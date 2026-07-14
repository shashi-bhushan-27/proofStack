# 🛡️ Master Playbook: Authentication & Payments Error Prevention Guide
**A complete post-mortem of all Firebase Authentication and Cashfree Payment integration issues encountered in proofStack, alongside copy-pasteable AI system instructions for flawless future implementations.**

---

## 📑 Part 1: Authentication Errors (Firebase Auth + FastAPI + PostgreSQL)

### ❌ Error 1: `auth/unauthorized-domain` popup during Google / GitHub OAuth login on Vercel
* **What Happened:** When testing Google or GitHub Sign-In on the live Vercel deployment (`proof-stack-xi.vercel.app`), Firebase blocked the login popup instantly with an `auth/unauthorized-domain` error.
* **Root Cause:** Firebase Authentication enforces strict origin checks. By default, only `localhost` and `your-project.firebaseapp.com` are authorized. When you deploy to Vercel or attach a custom domain, Firebase rejects OAuth token issuance for that domain unless explicitly allowed.
* **How to Avoid & Fix:**
  1. Go to the [Firebase Console](https://console.firebase.google.com/) $\rightarrow$ **Authentication** $\rightarrow$ **Settings** tab $\rightarrow$ **Authorized domains**.
  2. Click **Add domain** and enter your exact Vercel deployment domain (e.g., `proof-stack-xi.vercel.app` without `https://` or trailing slashes).
  3. Whenever you create a new Vercel preview deployment (`*.vercel.app`) or attach a custom domain, add it immediately to this list *before* testing OAuth.

---

### ❌ Error 2: `404 Not Found` when syncing Firebase ID Token to FastAPI (`/api/v1/auth/sync`)
* **What Happened:** After signing in with Google on the frontend, the browser sent a `POST` request to sync the user session, but received a `404 Not Found` error.
* **Root Cause:** There were two underlying discrepancies:
  1. **URL Path Normalization:** The environment variable `NEXT_PUBLIC_API_URL` was set to `https://your-backend.onrender.com` in one environment and `https://your-backend.onrender.com/api/v1` in another. Axios requests (`axios.post('/auth/sync')`) either missed `/api/v1` (`/auth/sync` $\rightarrow$ 404) or double-appended (`/api/v1/api/v1/auth/sync` $\rightarrow$ 404).
  2. **Endpoint Mismatch:** The frontend API client (`lib/api.ts`) called `/auth/sync`, but the backend had not registered an explicit `/auth/sync` endpoint that verified the Firebase ID token (`id_token`).
* **How to Avoid & Fix:**
  * Always normalize API base URLs inside your HTTP client wrapper (`lib/api.ts`) so it handles missing or duplicate `/api/v1` prefixes automatically:
    ```typescript
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const API_BASE_URL = rawUrl.endsWith("/api/v1") ? rawUrl : `${rawUrl.replace(/\/$/, "")}/api/v1`;
    ```
  * Always build a dedicated `/api/v1/auth/sync` FastAPI route that takes `{ id_token: string }`, verifies it via Google/Firebase JWT verification, and performs an atomic `UPSERT` (create if missing, update if existing) inside your PostgreSQL `User` table.

---

### ❌ Error 3: Database Connection Refused / Port Timeout (`ConnectionRefusedError on Port 5432`)
* **What Happened:** When the backend tried to authenticate and query PostgreSQL on Render/Vercel, SQLAlchemy crashed with `ConnectionRefusedError: [WinError 1225] / Connection refused on port 5432`.
* **Root Cause:** When connecting to managed PostgreSQL platforms (like **Supabase** or **Neon**) from cloud containers or local environments, connecting directly to the primary database port `5432` over IPv4 often times out or gets rejected due to transaction pooling restrictions and IPv6-only primary hostnames.
* **How to Avoid & Fix:**
  * Always use connection pooler ports (`port 6543` for Supabase `pgBouncer` transaction pooler) inside your `DATABASE_URL`.
  * Ensure the scheme is explicitly set for async SQLAlchemy (`postgresql+asyncpg://`).
  * When using connection poolers in transaction mode (`6543`), disable asyncpg statement caching inside `db/session.py` to prevent `Prepared statement already exists` errors:
    ```python
    engine = create_async_engine(
        settings.DATABASE_URL,
        connect_args={"prepared_statement_cache_size": 0, "statement_cache_size": 0}
    )
    ```

---

## 💳 Part 2: Cashfree Payments & Subscriptions Errors

### ❌ Error 4: `window.Cashfree is not a function` or SDK Loading Race Condition
* **What Happened:** When clicking "Upgrade to Pro", the browser threw a JavaScript runtime error: `window.Cashfree is not a function` or `Cannot read properties of undefined (reading 'checkout')`.
* **Root Cause:** In Next.js App Router, `<Script src="https://sdk.cashfree.com/js/v3/cashfree.js" />` loads asynchronously. If a user clicks the checkout button before the script finishes loading, `window.Cashfree` is `undefined`.
* **How to Avoid & Fix:**
  * Load the script using `strategy="afterInteractive"` or `beforeInteractive` in your root layout (`app/layout.tsx`).
  * In your checkout click handler, explicitly check if the SDK is loaded before invoking it:
    ```typescript
    if (typeof window === "undefined" || !window.Cashfree) {
      setError("Payment SDK is still initializing. Please wait a moment and try again.");
      return;
    }
    ```

---

### ❌ Error 5: Cashfree Sandbox rejecting orders with `order_currency: "USD"` (`502 Bad Gateway / Order Creation Failed`)
* **What Happened:** The backend attempted to create a Cashfree checkout session for `$29.00 USD`, but the API returned a failure or `502 Bad Gateway`.
* **Root Cause:** Cashfree Sandbox environments (especially Indian domestic merchant accounts) **strictly enforce `order_currency: "INR"`**. Attempting to pass `"USD"` or international currencies inside standard Indian test merchant gateways triggers immediate order validation errors.
* **How to Avoid & Fix:**
  * For Cashfree Sandbox development, **always use `INR`** (`"order_currency": "INR"` and prices like `₹499.00` or `₹1.00`).
  * Do not hardcode `$` or `USD` inside frontend pricing cards; render currency dynamically based on the plan configuration (`plan.currency === "INR" ? "₹" : "$"`).

---

### ❌ Error 6: Silent "Simulation Fallback" bypassing payment (`Auto-upgrading without card entry`)
* **What Happened:** When the user clicked "Upgrade to Pro Now", instead of asking for UPI/Card details, the app instantly redirected to `/billing/status?status=PAID` and upgraded the user to Pro for free.
* **Root Cause:** During local debugging, AI assistants frequently inject "simulation fallbacks" (`if error or not api_key: return {"simulation": True}`). When deployed to production, if the backend encountered any minor API error (like an invalid credential or timeout), it silently caught the error, returned `simulation: True`, and the frontend auto-redirected to the success page! Furthermore, the status page had a fallback check: `if (urlStatus === "PAID") setSuccess(true)`.
* **How to Avoid & Fix:**
  * **Never allow simulation fallbacks in staging/production.** If `create_checkout_session` fails to get a real `payment_session_id` from Cashfree (`status_code != 200`), it must raise an explicit `HTTPException(status_code=502, detail=...)` so the developer sees exactly what failed.
  * **Never verify payment state using frontend URL query parameters (`?status=PAID`).** The frontend `/billing/status` page must call a backend endpoint (`GET /api/v1/billing/status/{order_id}`) which directly checks the database (`user.subscription_status == "active"`) or makes a live server-to-server HTTP query to `https://sandbox.cashfree.com/pg/orders/{order_id}` (`order_status == "PAID"`).

---

### ❌ Error 7: Cashfree SDK Mode Misconfiguration (`NODE_ENV === "production" -> mode: "production"`)
* **What Happened:** Even after fixing the backend to return a valid Sandbox `payment_session_id`, the checkout modal failed to open on Vercel.
* **Root Cause:** The frontend checkout handler initialized Cashfree using `NODE_ENV`:
  ```typescript
  const cashfree = window.Cashfree({
    mode: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  });
  ```
  When deployed to Vercel/Render, `NODE_ENV` is always `"production"`. But the backend was configured with **Sandbox test credentials** (`CASHFREE_ENVIRONMENT = "Sandbox"`). Because the frontend initialized Cashfree in `"production"` mode while passing a `"sandbox"` session ID, the SDK rejected it.
* **How to Avoid & Fix:**
  * Separate your SDK environment selection from `NODE_ENV` by creating a dedicated environment variable (`NEXT_PUBLIC_CASHFREE_MODE`):
    ```typescript
    const cashfreeMode = (process.env.NEXT_PUBLIC_CASHFREE_MODE || "sandbox") as "sandbox" | "production";
    const cashfree = window.Cashfree({ mode: cashfreeMode });
    ```
  * In Vercel environment settings for staging/testing, explicitly set `NEXT_PUBLIC_CASHFREE_MODE=sandbox`.

---

### ❌ Error 8: `401 authentication Failed` — Character Ambiguity (`l` vs `1`) in AppID
* **What Happened:** When the backend called `https://sandbox.cashfree.com/pg/orders`, Cashfree returned:
  ```json
  { "message": "authentication Failed", "code": "request_failed", "type": "authentication_error" }
  ```
* **Root Cause:** The AppID copied from the screenshot (`...4931l1`) had a lowercase `l` at the end instead of the digit `1` (`...493111`). In standard web font interfaces, lowercase letter `l` (`l`) and digit one (`1`) look visually identical.
* **How to Avoid & Fix:**
  * When API keys fail with `401 authentication Failed` despite copying them directly from the dashboard, always run a direct terminal/Python script check comparing string length and testing for character confusions (`l` vs `1`, `O` vs `0`, `I` vs `l`).
  * Always verify API credentials via a simple `curl` or `python -c` script inside your container before debugging application logic:
    ```bash
    docker exec backend python -c "
    import httpx, asyncio
    async def test():
      headers = {'x-client-id': 'YOUR_APP_ID', 'x-client-secret': 'YOUR_SECRET', 'x-api-version': '2025-01-01'}
      resp = await httpx.AsyncClient().get('https://sandbox.cashfree.com/pg/orders/test_123', headers=headers)
      print(resp.status_code, resp.text)
    asyncio.run(test())"
    ```

---

### ❌ Error 9: Dashboard showing `FREE PLAN` even after successful payment & database upgrade
* **What Happened:** After successfully completing the Cashfree payment, PostgreSQL confirmed `subscription_tier = 'pro'` inside the database. However, after redirecting to `/dashboard`, the top badge still displayed **`FREE PLAN`**.
* **Root Cause:** The Pydantic serialization schema (`UserResponse` inside `schemas/auth.py`) was out of sync with the SQLAlchemy database model (`models/user.py`). While `models/user.py` had `subscription_tier`, `subscription_status`, and `daily_analyses_count`, the `UserResponse` schema only listed:
  ```python
  class UserResponse(BaseModel):
      id: uuid.UUID
      email: str
      full_name: str | None
      is_active: bool
      created_at: datetime
  ```
  Because FastAPI strictly strips any database columns not defined in the response Pydantic schema, `/api/v1/auth/me` silently omitted `subscription_tier` from the JSON payload sent to the frontend!
* **How to Avoid & Fix:**
  * Whenever you add new fields to a database model (especially subscription tiers, limits, or roles), **immediately update your public Pydantic schemas (`UserResponse`)** so those columns are exposed via API endpoints:
    ```python
    class UserResponse(BaseModel):
        model_config = ConfigDict(from_attributes=True)
        id: uuid.UUID
        email: str
        full_name: str | None
        is_active: bool
        subscription_tier: str | None = "free"
        subscription_status: str | None = "inactive"
        daily_analyses_count: int = 0
        created_at: datetime
    ```

---

### ❌ Error 10: HMAC Webhook Verification Failure (`401 Invalid webhook signature`)
* **What Happened:** When Cashfree sent real-time payment notifications (`PAYMENT_SUCCESS_WEBHOOK`) to `/api/v1/billing/webhook`, the backend rejected them with `401 Invalid webhook signature`.
* **Root Cause:** Cashfree computes its SHA-256 HMAC signature by concatenating the exact `x-webhook-timestamp` header with the **raw, unparsed request payload bytes (`timestamp.encode('utf-8') + raw_body_bytes`)**. If your FastAPI route uses `request.json()` or `Pydantic` models inside the route parameters *before* verifying the signature, FastAPI deserializes and reserializes the JSON string, altering whitespace and character encoding (`\r\n` vs `\n`), which permanently invalidates the cryptographic hash.
* **How to Avoid & Fix:**
  * Always read raw request body bytes (`await request.body()`) inside your webhook handler *before* parsing JSON:
    ```python
    @router.post("/billing/webhook")
    async def cashfree_webhook(
        request: Request,
        x_webhook_signature: str = Header(..., alias="x-webhook-signature"),
        x_webhook_timestamp: str = Header(..., alias="x-webhook-timestamp"),
        db: AsyncSession = Depends(get_db)
    ):
        raw_body = await request.body()
        signed_payload = x_webhook_timestamp.encode("utf-8") + raw_body
        computed_hmac = hmac.new(
            settings.CASHFREE_WEBHOOK_SECRET.encode("utf-8"),
            signed_payload,
            hashlib.sha256
        ).digest()
        computed_sig = base64.b64encode(computed_hmac).decode("utf-8")
        
        if not hmac.compare_digest(computed_sig, x_webhook_signature):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        # Now it is 100% safe to parse JSON
        payload = json.loads(raw_body.decode("utf-8"))
    ```

---
---

## 🤖 Part 3: Copy-Pasteable AI Instructions for Your Next Project

When you start your next full-stack project involving **Authentication** and/or **Payment Gateways (Cashfree / Stripe / Razorpay)**, copy and paste the appropriate prompt block below directly into your first prompt to your AI coding assistant (`Gemini`, `Claude`, or `ChatGPT`). This guarantees the AI follows strict production rules from Day 1 and never creates mock fallbacks or schema bugs.

### 📋 Prompt 1: Master Authentication Instruction (Firebase / JWT + FastAPI)
```markdown
<CRITICAL_AUTH_INSTRUCTIONS>
You are building the authentication and user session layer using Next.js (frontend) and FastAPI + PostgreSQL (backend). Follow these exact rules without deviation:

1. URL Normalization: In the frontend HTTP client wrapper (`lib/api.ts`), ensure `API_BASE_URL` automatically strips trailing slashes and ensures `/api/v1` is appended exactly once. Never hardcode relative URLs that break across environments.
2. Firebase Profile Synchronization: Create a dedicated backend route `POST /api/v1/auth/sync` accepting `{ id_token: str }`. The backend must verify the token using Firebase Admin SDK / Google certs and perform an atomic UPSERT on the PostgreSQL `User` table.
3. Strict Pydantic Schema Synchronization: Every column added to the SQLAlchemy `User` model (`subscription_tier`, `subscription_status`, `is_active`, `roles`, etc.) MUST be explicitly included in the public Pydantic `UserResponse` (`from_attributes=True`) schema. Do not silently filter out state fields!
4. Connection Pooler Port & Caching: If using Supabase / Neon PostgreSQL over async (`asyncpg`), use connection pooler port `6543` in `DATABASE_URL` and explicitly set `prepared_statement_cache_size=0` inside `create_async_engine` to prevent prepared statement crashes.
5. Vercel & Custom Domain Origin Checklist: Proactively remind me to add all Vercel domains (`*.vercel.app`) to Firebase Console -> Authentication -> Authorized Domains before attempting OAuth testing.
</CRITICAL_AUTH_INSTRUCTIONS>
```

---

### 📋 Prompt 2: Master Payment Gateway Instruction (Cashfree / PG Integration)
```markdown
<CRITICAL_PAYMENT_INSTRUCTIONS>
You are building a production-grade subscription and payment checkout flow using Cashfree JS SDK v3 and FastAPI. Follow these strict, non-negotiable architectural rules:

1. ZERO SIMULATION FALLBACKS: Never write "mock", "simulation", or "fallback" logic that bypasses real API calls or auto-upgrades users when an error occurs. If Cashfree `POST /pg/orders` fails or returns a non-200 status code, raise a clear `HTTPException(status_code=502, detail=...)`.
2. Sandbox Currency & Pricing Rules: If configuring Cashfree Sandbox (`CASHFREE_ENVIRONMENT="Sandbox"`), MUST use `"order_currency": "INR"` and test amounts (e.g., `₹499.00`). Never send `USD` or non-INR currencies to standard Indian test gateways.
3. SDK Mode vs NODE_ENV Separation: In Next.js, NEVER initialize `window.Cashfree({ mode: process.env.NODE_ENV === "production" ? "production" : "sandbox" })`. When deployed to Vercel/Render, `NODE_ENV` is `"production"`, which breaks Sandbox testing. Instead, create a dedicated env var: `NEXT_PUBLIC_CASHFREE_MODE="sandbox" | "production"` and pass `mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || "sandbox"`.
4. SDK Script Loading & Guard Check: In Next.js App Router, load `<Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="afterInteractive" />`. Before executing `cashfree.checkout()`, always check `if (typeof window === "undefined" || !window.Cashfree) return setError("SDK still loading...");`.
5. Server-Side Verification Only: Never upgrade a user on the frontend status page (`/billing/status`) based on URL parameters like `?status=PAID`. The status page must make a query to `GET /api/v1/billing/status/{order_id}`, where the backend directly checks `GET https://sandbox.cashfree.com/pg/orders/{order_id}` (`order_status == "PAID" | "ACTIVE"`) or verifies the DB status set by an HMAC-signed webhook.
6. Cryptographic Webhook Verification over Raw Bytes: In the FastAPI webhook endpoint (`POST /billing/webhook`), ALWAYS read `raw_body = await request.body()` first. Compute SHA-256 HMAC over `timestamp.encode('utf-8') + raw_body` against `x-webhook-signature`. NEVER parse `request.json()` or Pydantic schemas before verifying the HMAC signature, as JSON deserialization alters byte formatting and invalidates the hash.
</CRITICAL_PAYMENT_INSTRUCTIONS>
```

---

## 💡 Summary Check: How to Test Payments in Sandbox Like a Pro
Whenever testing a payment flow in your live environment, remember this 4-step checklist:
1. **Verify Credentials in Container:** Run a quick 1-line Python `httpx.get` inside your container to verify your AppID (`11` vs `l1`) and Secret Key return `200 OK`.
2. **Check Mode:** Confirm `NEXT_PUBLIC_CASHFREE_MODE=sandbox` inside your Vercel project settings.
3. **Use Official Test Cards:** When the Cashfree popup opens, select **Cards** and enter:
   - **Card Number:** `4706131211212123`
   - **Expiry:** Any future date (`12/30`)
   - **CVV:** `123`
   - **OTP:** `111000`
4. **Confirm Database & Schema Sync:** Check that `user.subscription_tier` is `'pro'` in PostgreSQL **AND** that `UserResponse` Pydantic schema returns it to `/auth/me`.
