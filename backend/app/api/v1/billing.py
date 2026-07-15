"""Billing & Subscriptions API router."""

from typing import Any

from fastapi import APIRouter, Depends, Header, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services.billing_service import billing_service

router = APIRouter(prefix="/billing", tags=["billing"])


class CheckoutRequest(BaseModel):
    plan_id: str = "pro"
    return_url: str = "http://localhost:3000/billing/status"


@router.get("/plans")
async def get_plans() -> dict[str, Any]:
    """Get available pricing plans and feature comparisons."""
    return {
        "plans": [
            {
                "id": "free",
                "name": "Free Starter",
                "price": 0,
                "currency": "INR",
                "interval": "month",
                "features": [
                    "3 AI Resume Analyses per day",
                    "Standard skill evidence matching",
                    "Basic interactive resume interrogation",
                    "Community support",
                ],
                "limits": {"analyses_per_day": 3},
            },
            {
                "id": "pro",
                "name": "Pro Intelligence",
                "price": 10,
                "currency": "INR",
                "interval": "month",
                "features": [
                    "Unlimited AI Resume Analyses",
                    "Deep multi-dimensional evidence strength scoring",
                    "High-priority LLM generation queues",
                    "Advanced resume interrogation session history",
                    "Actionable bullet point generator with AI refinement",
                ],
                "limits": {"analyses_per_day": 999999},
            },
        ]
    }


@router.post("/checkout")
async def create_checkout(
    req: CheckoutRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Initiate a Cashfree checkout session to upgrade to Pro."""
    return await billing_service.create_checkout_session(
        user=current_user, plan_id=req.plan_id, return_url=req.return_url, db=db, request=request
    )


@router.get("/status/{order_id}")
async def check_order_status(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Verify order/subscription status from Cashfree servers."""
    return await billing_service.verify_subscription_status(order_id=order_id, db=db)


@router.post("/webhook")
async def handle_cashfree_webhook(
    request: Request,
    x_webhook_signature: str = Header("", alias="x-webhook-signature"),
    x_webhook_timestamp: str = Header("", alias="x-webhook-timestamp"),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Handle incoming Cashfree subscription/order webhook events."""
    raw_body = await request.body()
    return await billing_service.handle_webhook(
        raw_body=raw_body, signature=x_webhook_signature, timestamp=x_webhook_timestamp, db=db
    )


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Cancel current Pro subscription."""
    return await billing_service.cancel_subscription(user=current_user, db=db)
