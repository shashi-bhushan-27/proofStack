# 🔍 proofStack — Evidence-Based AI Resume Intelligence

> **Stop matching keywords. Start measuring evidence.**

proofStack evaluates how well a candidate's resume matches a job description based on **actual evidence of skill usage** rather than simple keyword matching.

Traditional ATS systems check whether required keywords appear somewhere in a resume. Candidates can list technologies like Redis, Docker, FastAPI, or Kubernetes in the Skills section without demonstrating actual usage. proofStack answers a more meaningful question:

> *"Does the candidate provide credible evidence that they have actually used the skills required by the job?"*

---

## ✨ Core Features

- **Evidence-Based Analysis** — Evaluates whether skills are actually demonstrated through projects and experience
- **5-Dimension Scoring** — Overall fit, skill coverage, evidence strength, communication quality, unsupported claims
- **Skill Evidence Matrix** — Visual breakdown of every skill with evidence levels (Strong → Missing)
- **Actionable Recommendations** — Specific, contextual improvement suggestions (never generic advice)
- **Resume Interrogation** — AI asks targeted questions to help strengthen weak evidence
- **Two-Tier Access** — Analyze for free, save and improve with an account
- **Analysis History** — Save, review, and compare past analyses

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy 2.0+, Pydantic v2 |
| **Database** | PostgreSQL 16 |
| **AI/LLM** | Groq (free tier), instructor library |
| **Auth** | NextAuth.js v5 + JWT |
| **Storage** | S3-compatible (AWS S3 / Cloudflare R2) |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Docker** and Docker Compose (for PostgreSQL)
- **Groq API Key** (free at [console.groq.com](https://console.groq.com))

### 1. Clone & Configure

```bash
git clone https://github.com/yourusername/proofstack.git
cd proofstack
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start Database

```bash
docker-compose up db -d
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
proofStack/
├── frontend/                 # Next.js 15 application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities, API client, auth
│   │   ├── services/         # API service functions
│   │   ├── types/            # TypeScript types
│   │   └── providers/        # Context providers
│   └── ...
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/              # REST API routes
│   │   ├── core/             # Config, security
│   │   ├── db/               # Database session
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── ai/               # LLM provider & services
│   │   ├── scoring/          # Deterministic scoring
│   │   ├── utils/            # PDF processor, normalizer
│   │   └── tests/            # pytest test suite
│   └── alembic/              # Database migrations
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📊 Scoring Formula

The scoring engine is fully deterministic — the LLM classifies evidence, but scores are calculated by backend business logic.

| Component | Weight | Description |
|-----------|--------|-------------|
| Required Skill Coverage | 35% | Percentage of required skills found, weighted by evidence quality |
| Evidence Strength | 35% | Average evidence score across all matched skills |
| Preferred Skill Coverage | 10% | Percentage of preferred skills found |
| Experience Relevance | 10% | How relevant the candidate's experience is to the role |
| Resume Communication | 10% | How effectively skills are communicated |

### Evidence Level Scores

| Level | Score | Description |
|-------|-------|-------------|
| Strong | 90 | Technical context, implementation details, ownership, outcomes |
| Moderate | 65 | Explains what was built/implemented with the technology |
| Weak | 40 | Appears in project/experience but lacks meaningful context |
| Mentioned Only | 25 | Listed in Skills section without supporting evidence |
| Missing | 0 | Not found anywhere in the resume |

---

## 🔌 API Reference

Base URL: `http://localhost:8000/api/v1`

### Public Endpoints (No Auth Required)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/resumes/upload` | Upload a PDF resume |
| POST | `/job-descriptions` | Create a job description |
| POST | `/analyses` | Start a new analysis |
| GET | `/analyses/{id}` | Get analysis results |
| GET | `/analyses/{id}/skills` | Get skill evidence matrix |

### Protected Endpoints (Auth Required)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current user info |
| GET | `/analyses` | Analysis history |
| DELETE | `/analyses/{id}` | Delete analysis |
| GET | `/analyses/{id}/recommendations` | Get recommendations |
| POST | `/analyses/{id}/interrogation` | Start interrogation |
| POST | `/interrogation/{id}/message` | Send interrogation message |

---

## 🧪 Testing

```bash
cd backend
pytest -v                          # Run all tests
pytest tests/test_scoring.py -v    # Scoring engine tests
pytest tests/test_normalizer.py -v # Skill normalization tests
pytest tests/test_api_auth.py -v   # Authentication tests
```

---

## 🌐 Deployment

### Frontend → Vercel
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Backend → Render
1. Create a new Web Service on Render
2. Point to the `backend/` directory
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### Database → Render PostgreSQL or Neon
1. Create a PostgreSQL instance
2. Update `DATABASE_URL` in your environment

---

## 📄 License

MIT

---

*Built with evidence, not buzzwords.*
