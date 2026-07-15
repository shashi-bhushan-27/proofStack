"""Cashfree Subscriptions and Payments Service."""

import base64
import hashlib
import hmac
import json
import logging
import uuid
from typing import Any

import httpx
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)


class CashfreeBillingService:
    def __init__(self) -> None:
        self.app_id = settings.CASHFREE_APP_ID
        self.secret_key = settings.CASHFREE_SECRET_KEY
        self.env = settings.CASHFREE_ENVIRONMENT
        self.webhook_secret = settings.CASHFREE_WEBHOOK_SECRET

        if self.env.lower() == "production":
            self.base_url = "https://api.cashfree.com/pg"
        else:
            self.base_url = "https://sandbox.cashfree.com/pg"

    def _get_headers(self) -> dict[str, str]:
        return {
            "x-client-id": self.app_id,
            "x-client-secret": self.secret_key,
            "x-api-version": "2025-01-01",
            "Content-Type": "application/json",
        }

    async def create_checkout_session(
        self, user: User, plan_id: str, return_url: str, db: AsyncSession
    ) -> dict[str, Any]:
        """Create a Cashfree order / checkout session for subscription upgrade."""
        order_id = f"sub_{uuid.uuid4().hex[:16]}"
        amount = 499.00 if plan_id == "pro" else 1999.00

        payload = {
            "order_id": order_id,
            "order_amount": amount,
            "order_currency": "INR",
            "customer_details": {
                "customer_id": str(user.id).replace("-", "")[:32],
                "customer_email": user.email,
                "customer_name": user.full_name or user.email.split("@")[0],
                "customer_phone": "9999999999",
            },
            "order_meta": {
                "return_url": f"{return_url}?order_id={order_id}&status={{order_status}}",
                "notify_url": f"{settings.BACKEND_URL}/api/v1/billing/webhook",
            },
            "order_note": f"proofStack {plan_id.upper()} Subscription",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{self.base_url}/orders",
                json=payload,
                headers=self._get_headers(),
            )

            if resp.status_code not in (200, 201):
                error_detail = resp.text
                logger.error(
                    "Cashfree Create Order failed: status=%s body=%s",
                    resp.status_code,
                    error_detail,
                )
                raise HTTPException(
                    status_code=502,
                    detail=f"Cashfree order creation failed: {error_detail}",
                )

            data = resp.json()
            payment_session_id = data.get("payment_session_id")

            if not payment_session_id:
                logger.error("Cashfree response missing payment_session_id: %s", data)
                raise HTTPException(
                    status_code=502,
                    detail="Cashfree did not return a payment session.",
                )

            # Save the order association to the user
            user.cashfree_subscription_id = order_id
            await db.commit()

            return {
                "order_id": data.get("order_id", order_id),
                "payment_session_id": payment_session_id,
                "plan_id": plan_id,
                "amount": amount,
                "simulation": False,
            }

    async def verify_subscription_status(
        self, order_id: str, db: AsyncSession
    ) -> dict[str, Any]:
        """Verify order/subscription payment state directly from Cashfree servers."""
        stmt = select(User).where(User.cashfree_subscription_id == order_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="Order/User not found")

        # If already upgraded (e.g. via webhook), return current state
        if user.subscription_tier == "pro" and user.subscription_status == "active":
            return {"status": "active", "tier": "pro", "order_id": order_id}

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                resp = await client.get(
                    f"{self.base_url}/orders/{order_id}",
                    headers=self._get_headers(),
                )
                if resp.status_code == 200:
                    data = resp.json()
                    order_status = data.get("order_status", "")
                    logger.info(
                        "Cashfree order %s status: %s", order_id, order_status
                    )
                    if order_status == "PAID":
                        user.subscription_tier = "pro"
                        user.subscription_status = "active"
                        await db.commit()
                        return {"status": "active", "tier": "pro", "order_id": order_id}
                    elif order_status in ("EXPIRED", "CANCELLED", "TERMINATED", "FAILED"):
                        return {"status": "failed", "tier": "free", "order_id": order_id}
                    else:
                        # order_status == "ACTIVE" in Cashfree means Order created but payment unpaid/pending
                        return {"status": "pending", "tier": "free", "order_id": order_id}
                else:
                    logger.error(
                        "Cashfree verify order %s failed: %s %s",
                        order_id, resp.status_code, resp.text,
                    )
                    return {"status": "unknown", "tier": "free", "order_id": order_id}
            except Exception as e:
                logger.error("Cashfree verify exception for %s: %s", order_id, e)
                return {"status": "error", "tier": "free", "order_id": order_id}

    async def handle_webhook(
        self, raw_body: bytes, signature: str, timestamp: str, db: AsyncSession
    ) -> dict[str, Any]:
        """Verify HMAC signature and process webhook state."""
        if self.webhook_secret and self.webhook_secret != "TEST_WEBHOOK_SECRET":
            # Cashfree expects the timestamp concatenated with the raw payload
            signed_payload = timestamp.encode("utf-8") + raw_body
            computed_hmac = hmac.new(
                self.webhook_secret.encode("utf-8"),
                signed_payload,
                hashlib.sha256,
            )
            computed_sig = base64.b64encode(computed_hmac.digest()).decode("utf-8")
            if not hmac.compare_digest(computed_sig, signature):
                raise HTTPException(status_code=401, detail="Invalid webhook signature")

        payload = json.loads(raw_body.decode("utf-8"))
        data = payload.get("data", {})
        order = data.get("order", {})
        payment = data.get("payment", {})
        order_id = order.get("order_id") or payload.get("order_id")
        event_type = payload.get("type", "")

        logger.info("Cashfree webhook received: type=%s order_id=%s", event_type, order_id)

        if not order_id:
            return {"status": "ignored", "reason": "no_order_id"}

        stmt = select(User).where(User.cashfree_subscription_id == order_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            return {"status": "ignored", "reason": "user_not_found", "order_id": order_id}

        is_success_event = (
            event_type in ("PAYMENT_SUCCESS_WEBHOOK", "ORDER_PAID_WEBHOOK", "ORDER_SUCCESS_WEBHOOK")
            or order.get("order_status") == "PAID"
            or payment.get("payment_status") == "SUCCESS"
        ) and event_type not in ("PAYMENT_FAILED_WEBHOOK", "PAYMENT_USER_DROPPED_WEBHOOK", "ORDER_FAILED_WEBHOOK")

        is_failed_event = (
            event_type in ("PAYMENT_FAILED_WEBHOOK", "PAYMENT_USER_DROPPED_WEBHOOK", "ORDER_FAILED_WEBHOOK")
            or order.get("order_status") in ("EXPIRED", "CANCELLED", "FAILED")
            or payment.get("payment_status") in ("FAILED", "CANCELLED", "USER_DROPPED")
        )

        if is_success_event and not is_failed_event:
            user.subscription_tier = "pro"
            user.subscription_status = "active"
            await db.commit()
            logger.info("User %s upgraded to Pro via webhook (%s)", user.id, event_type)
            return {"status": "processed", "user_id": str(user.id), "tier": "pro"}
        elif is_failed_event:
            if user.subscription_tier == "pro" and user.cashfree_subscription_id == order_id:
                user.subscription_tier = "free"
                user.subscription_status = "failed"
                await db.commit()
            logger.info("User %s payment failed/dropped via webhook (%s)", user.id, event_type)
            return {"status": "failed", "user_id": str(user.id), "tier": "free"}

        return {"status": "received", "order_id": order_id}

    async def cancel_subscription(self, user: User, db: AsyncSession) -> dict[str, Any]:
        """Cancel user's active Pro subscription."""
        user.subscription_tier = "free"
        user.subscription_status = "cancelled"
        await db.commit()
        return {"status": "cancelled", "tier": "free"}


billing_service = CashfreeBillingService()
