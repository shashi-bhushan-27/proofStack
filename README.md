<div align="center">

# 🛡️ proofStack
### **Evidence-Based AI Resume Intelligence Platform**

*Stop matching keywords. Start measuring real candidate skill implementation depth and evidence.*

[![Next.js 15](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python 3.11+](https://img.shields.io/badge/Python%203.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL%2016-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Firebase Auth](https://img.shields.io/badge/Firebase%20Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Cashfree PG](https://img.shields.io/badge/Cashfree%20Payments-5C13D4?style=for-the-badge&logo=stripe&logoColor=white)](https://cashfree.com/)
[![Google Gemini 3.1](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%203.1--Flash%20Lite-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

</div>

---

## 🌟 Executive Summary

Traditional Applicant Tracking Systems (ATS) rely on superficial keyword matching. If a candidate lists *"Kubernetes, Docker, Redis, and FastAPI"* in a bulleted skill section, standard keyword scanners assign a 100% match score—even if the candidate has never deployed a container or built a production system.

**proofStack** bridges this gap by shifting the paradigm from **Keyword Recognition** to **Evidence Verification**. Powered by advanced LLMs (**Google Gemini 3.1 Flash Lite (`gemini-3.1-flash-lite`)** via OpenAI compatibility layer & `instructor`) combined with a **deterministic backend scoring engine**, proofStack extracts semantic skill claims, locates concrete proof within project descriptions and work history, and grades implementation depth.

---

## ✨ Key Features & Capabilities

### 🔍 1. Evidence-Based Skill Verification Engine
- **Semantic Extraction**: Automatically parses complex job descriptions into categorized technical requirements (`Language`, `Framework`, `Database`, `Cloud`, `DevOps`, `AI/ML`, etc.) with strict importance tiers (`Required`, `Preferred`, `Optional`).
- **5-Tier Evidence Grading**: Classifies every detected skill claim into precise evidence tiers:
  - **`Strong` (90 pts)**: Detailed technical context, implementation depth, ownership clarity, and measurable outcomes.
  - **`Moderate` (65 pts)**: Explains what was built or implemented using the technology.
  - **`Weak` (40 pts)**: Mentioned inside a project or role but lacks specific implementation detail.
  - **`Mentioned Only` (25 pts)**: Listed inside a comma-separated skills section with zero proof of practical use.
  - **`Missing` (0 pts)**: Not demonstrated anywhere in the resume.

### 📐 2. Deterministic 5-Dimension Scoring Engine
While LLMs perform contextual natural language understanding, **all numerical scores are computed deterministically** by backend business logic to ensure fairness, consistency, and zero hallucination:
- **Required Skill Coverage (35%)**: Weighted percentage of mandatory job skills backed by solid evidence.
- **Evidence Strength (35%)**: Average quality of proof across all matched technical requirements.
- **Preferred Skill Coverage (10%)**: Bonus evaluation for secondary and nice-to-have qualifications.
- **Experience Relevance (10%)**: Evaluation of domain alignment and career progression.
- **Resume Communication (10%)**: Clarity of action verbs, quantifiable metrics, and structure.

### 💬 3. Interactive AI Resume Interrogation & Bullet Generator
- **Deep Skill Probing**: Click on any weak or missing skill inside the evaluation report to launch an interactive chat session with the AI Interrogator.
- **Evidence Unearthing**: The AI asks targeted, probing questions (e.g., *"How exactly did you optimize PostgreSQL query throughput in your senior project?"*).
- **One-Click Bullet Synthesis**: Once sufficient context is gathered during the conversation, the AI generates high-impact, STAR-method (Situation, Task, Action, Result) resume bullet points ready to paste directly into your resume.

### 🔐 4. Enterprise Auth & Firebase Synchronization
- **Multi-Provider Authentication**: Supports email/password registration along with **Google** and **GitHub** OAuth via Firebase Authentication.
- **Seamless Database Synchronization**: Automatically syncs authenticated Firebase ID tokens with PostgreSQL user records (`/api/v1/auth/sync`), maintaining robust session management across frontend and backend.

### 💳 5. Cashfree Subscriptions & Real-Time Webhook Engine
- **Two-Tier Monetization**:
  - **Free Starter**: 3 AI evaluations per day, standard skill evidence matching, basic interrogation.
  - **Pro Intelligence (₹499/month)**: Unlimited AI evaluations, priority LLM queues, deep scoring breakdowns, and full interrogation history.
- **Seamless Checkout Integration**: Integrated with **Cashfree JS SDK v3** for instant modal/page checkouts supporting UPI, Cards, and Netbanking in INR.
- **Cryptographic Webhook Verification**: Real-time event notifications (`PAYMENT_SUCCESS_WEBHOOK`) are verified using SHA-256 HMAC signature verification against `x-webhook-signature` and `x-webhook-timestamp` headers.

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    subgraph Frontend [Next.js 15 / React 19 / Tailwind CSS]
        UI[App Router & Dashboard UI]
        AuthClient[Firebase Auth SDK]
        Checkout[Cashfree JS SDK v3]
    end

    subgraph Backend [FastAPI / Python 3.11+ / Async SQLAlchemy]
        API[FastAPI Router /api/v1]
        AuthDeps[JWT & Firebase Token Guard]
        BillingSvc[Cashfree Billing Service]
        ScoringEngine[Deterministic 5-Dimension Scoring Engine]
        LLMSvc[Google Gemini 3.1 AI Orchestrator]
    end

    subgraph Data & External [Storage, DB & Third-Party APIs]
        DB[(PostgreSQL Database)]
        Firebase[(Firebase Auth Server)]
        CashfreeAPI[(Cashfree Payments Gateway)]
        GeminiAPI[(Google Gemini 3.1 API Server)]
    end

    UI -->|Bearer Token / API Requests| API
    AuthClient <-->|OAuth / ID Tokens| Firebase
    API -->|Verify Token| AuthDeps
    AuthDeps -->|Sync Profile| DB
    UI -->|Initiate Checkout| BillingSvc
    BillingSvc <-->|Create Order / Verify Status| CashfreeAPI
    CashfreeAPI -->|HMAC Webhook Post| BillingSvc
    BillingSvc -->|Upgrade Subscription Tier| DB
    API -->|Parse Resume & JD| LLMSvc
    LLMSvc <-->|Structured JSON Evaluation| GeminiAPI
    LLMSvc -->|Raw Evidence Tiers| ScoringEngine
    ScoringEngine -->|Save Evaluation Metrics| DB
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | [Next.js 15](https://nextjs.org/) (App Router), React 19, TypeScript |
| **Styling & UI Components** | Tailwind CSS, Lucide Icons, Glassmorphism & Dark Mode Design System |
| **State & Data Fetching** | TanStack React Query (`@tanstack/react-query`), Axios Interceptors |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/), Python 3.11+, Uvicorn |
| **Database & ORM** | PostgreSQL 16, [SQLAlchemy 2.0+ (Async)](https://www.sqlalchemy.org/), AsyncPG, Alembic Migrations |
| **Data Validation** | Pydantic v2 (`SettingsConfigDict`, Strict Type Validation) |
| **AI / LLM Orchestration** | **Google Gemini 3.1 Flash Lite (`gemini-3.1-flash-lite`)** via OpenAI Compatibility (`instructor`) |
| **Authentication** | Firebase Authentication (Google, GitHub, Email/Password), PyJWT |
| **Payments Gateway** | Cashfree Payments PG API (`v2025-01-01`), Cashfree Webhooks, JS SDK v3 |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js** v18.17+ and **npm** / **yarn** / **pnpm**
- **Python** 3.11+
- **PostgreSQL** 16+ (Local instance, Docker, or [Supabase](https://supabase.com/))
- **API Keys**:
  - [Google AI Studio Gemini API Key](https://aistudio.google.com/) (`gemini-3.1-flash-lite`)
  - [Firebase Project Configuration](https://console.firebase.google.com/)
  - [Cashfree Merchant Sandbox Account](https://merchant.cashfree.com/)

---

### 1. Repository Setup

```bash
git clone https://github.com/shashi-bhushan-27/proofStack.git
cd proofStack
```

---

### 2. Backend Configuration (`/backend`)

1. Navigate to the backend directory and set up a Python virtual environment:
```bash
cd backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# macOS/Linux:
source venv/bin/activate
```

2. Install backend dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file inside `backend/` (`backend/.env`) with your configuration:
```ini
# ── Application ──────────────────────────────────────────────────────
APP_NAME=proofStack
DEBUG=True
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=["http://localhost:3000"]

# ── Database (PostgreSQL / Supabase) ─────────────────────────────────
# Note: For Supabase Poolers over IPv4, port 6543 is auto-rewritten by session.py
DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/proofstack

# ── Authentication & Firebase ────────────────────────────────────────
SECRET_KEY=super-secret-jwt-key-for-local-testing-only-64-bytes
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FIREBASE_PROJECT_ID=your-firebase-project-id

# ── Cashfree Billing & Subscriptions (Sandbox) ───────────────────────
CASHFREE_APP_ID=TEST11139498d3f12f7c30963022212489493111
CASHFREE_SECRET_KEY=cfsk_ma_test_f541c8559993bb4e3f68af0f066a2ffc_e380cdcd
CASHFREE_ENVIRONMENT=Sandbox
CASHFREE_WEBHOOK_SECRET=TEST_WEBHOOK_SECRET

# ── LLM / AI Engine ──────────────────────────────────────────────────
GEMINI_API_KEY=AIzaSy_your_gemini_api_key_here
LLM_PROVIDER=gemini
LLM_MODEL=gemini-3.1-flash-lite
```

4. Run database migrations using Alembic:
```bash
alembic upgrade head
```

5. Start the FastAPI development server:
```bash
uvicorn app.main:app --reload --port 8000
```
*Backend API Swagger UI will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)*

---

### 3. Frontend Configuration (`/frontend`)

1. Open a new terminal window, navigate to the frontend directory, and install node modules:
```bash
cd frontend
npm install
```

2. Create a `.env.local` file inside `frontend/` (`frontend/.env.local`):
```ini
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Cashfree Environment Mode ("sandbox" or "production")
NEXT_PUBLIC_CASHFREE_MODE=sandbox

# Firebase Authentication Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

3. Start the Next.js development server:
```bash
npm run dev
```
*Frontend application will be accessible at: [http://localhost:3000](http://localhost:3000)*

---

## 🔌 Comprehensive API Reference

Base Endpoint: `/api/v1`

### 🔒 Authentication (`/auth`)
| Method | Route | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/auth/register` | Register new user via email/password and issue JWT tokens | No |
| `POST` | `/auth/login` | Authenticate user credentials and return access/refresh tokens | No |
| `POST` | `/auth/sync` | Synchronize authenticated Firebase user profile with PostgreSQL | Yes |
| `GET` | `/auth/me` | Fetch active user profile, daily limits, and subscription tier | Yes |

### 📄 Resumes (`/resumes`)
| Method | Route | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/resumes/upload` | Upload and parse PDF resume into structured text & metadata | Optional |
| `GET` | `/resumes` | List all resumes uploaded by the current authenticated user | Yes |
| `GET` | `/resumes/{id}` | Retrieve specific resume metadata and raw extracted text | Yes |
| `DELETE` | `/resumes/{id}` | Permanently delete resume file and associated records | Yes |

### 🎯 Job Descriptions (`/job-descriptions`)
| Method | Route | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/job-descriptions` | Submit raw job description text for AI requirement extraction | Optional |
| `GET` | `/job-descriptions/{id}` | Retrieve parsed job requirements, mandatory skills, and weights | Optional |

### 📊 Analyses & Evidence Evaluation (`/analyses`)
| Method | Route | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/analyses` | Launch multi-dimensional AI evaluation (Enforces daily plan limits) | Optional |
| `GET` | `/analyses` | Paginated list of past evaluations (`fit_score`, job title, dates) | Yes |
| `GET` | `/analyses/{id}` | Full evaluation report including 5-dimension scoring breakdown | Optional |
| `GET` | `/analyses/{id}/skills` | Detailed skill evidence matrix (`Strong`, `Moderate`, `Missing`, etc.) | Optional |
| `GET` | `/analyses/{id}/recommendations` | AI-generated actionable improvements grouped by priority | Optional |
| `DELETE` | `/analyses/{id}` | Delete evaluation history and associated interrogation chats | Yes |

### 💬 AI Interrogation & Bullet Synthesis (`/interrogation`)
| Method | Route | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/analyses/{id}/interrogation` | Start a targeted AI interview session on a weak/missing skill | Yes |
| `POST` | `/interrogation/{session_id}/message` | Send user message/context and receive probing AI follow-ups | Yes |
| `GET` | `/interrogation/{session_id}` | Fetch full interrogation chat transcript and generated bullet points | Yes |

### 💳 Billing & Cashfree Payments (`/billing`)
| Method | Route | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/billing/plans` | Fetch available subscription plans (`free` and `pro` INR pricing) | Optional |
| `POST` | `/billing/checkout` | Create Cashfree order & obtain `payment_session_id` for SDK v3 | Yes |
| `GET` | `/billing/status/{order_id}` | Directly verify order status (`PAID` / `ACTIVE`) against Cashfree | Yes |
| `POST` | `/billing/webhook` | SHA-256 HMAC protected webhook receiver for instant tier upgrade | No (HMAC Guard) |
| `POST` | `/billing/cancel` | Cancel active Pro subscription and return to Free tier limits | Yes |

---

## 🧪 Testing Cashfree Payments in Sandbox

To verify the end-to-end upgrade flow in your local environment or staging:
1. Navigate to your dashboard and open **Pricing & Billing** (`/billing`).
2. Click **Upgrade to Pro Now (₹499/month)**.
3. When the Cashfree modal opens, select **Card Payment** and enter the official test credentials:
   - **Card Number**: `4706131211212123`
   - **Expiry Date**: Any future date (e.g., `12/30`)
   - **CVV**: `123`
   - **Simulated OTP**: `111000`
4. Upon confirmation, the webhook (`PAYMENT_SUCCESS_WEBHOOK`) instantly marks the account `ACTIVE` (`pro`), lifting daily analysis caps immediately.

---

## 📁 Repository Structure

```
proofStack/
├── backend/                       # FastAPI Backend Engine
│   ├── app/
│   │   ├── ai/                    # Groq Llama 3.1 / Gemini AI Orchestration Layer
│   │   ├── api/                   # REST API Routers
│   │   │   ├── deps.py            # JWT / Firebase Auth Guards & Database Injection
│   │   │   └── v1/                # Endpoint Modules (auth, resumes, billing, etc.)
│   │   ├── core/                  # Global Pydantic Settings & Security Utilities
│   │   ├── db/                    # Async SQLAlchemy Session & Base Model Registry
│   │   ├── models/                # Relational Database Models (User, Analysis, Interrogation)
│   │   ├── schemas/               # Pydantic Request/Response DTOs
│   │   ├── scoring/               # Deterministic 5-Dimension Business Logic
│   │   ├── services/              # Core Services (Cashfree Billing, Auth, Analytics)
│   │   └── utils/                 # PDF Text Extractor & Skill Normalizer
│   ├── alembic/                   # Database Migration Scripts
│   ├── requirements.txt           # Python Dependency Manifest
│   └── Dockerfile                 # Production Container Definition
│
├── frontend/                      # Next.js 15 Frontend Application
│   ├── public/                    # Static Assets & SVGs
│   ├── src/
│   │   ├── app/                   # App Router Pages & Layouts
│   │   │   ├── (auth)/            # Login & Registration Pages
│   │   │   ├── (dashboard)/       # Main Evaluation Dashboard, Billing & Status Pages
│   │   │   └── analysis/          # New Analysis Workflow & Detailed Report Viewers
│   │   ├── components/            # Reusable UI Elements (Headers, Footers, Modals)
│   │   ├── lib/                   # API Axios Client, Firebase Initialization, Validators
│   │   ├── providers/             # Auth Context & TanStack React Query Providers
│   │   └── types/                 # Comprehensive TypeScript Interfaces (`index.ts`)
│   ├── package.json               # Node Package Dependencies
│   └── tailwind.config.ts         # Design Tokens & Theme Customizations
│
└── README.md                      # Project Documentation
```

---

## 🌐 Production Deployment Guide

### Frontend → Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com/).
2. Under **Root Directory**, click **Edit** and select `frontend`.
3. Configure the **Environment Variables** in project settings (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CASHFREE_MODE=production`, and Firebase credentials).
4. Click **Deploy**.

### Backend → Render
1. Create a new **Web Service** on [Render](https://render.com/) pointing to your GitHub repository.
2. Set the **Root Directory** to `backend`.
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment**, add your `DATABASE_URL` (using port `6543` for Supabase connection poolers), `GEMINI_API_KEY`, and production Cashfree `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, and `CASHFREE_WEBHOOK_SECRET`.

---

## 🤝 Contributing & Support

1. Fork the Project and create your Feature Branch (`git checkout -b feature/AmazingFeature`)
2. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the Branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <p className="text-sm text-slate-500 mt-8">
    <b>proofStack</b> — Built with verifiable evidence, not buzzwords.
  </p>
</div>
