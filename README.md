<div align="center">

# AURORA

**An AI-powered cognitive productivity dashboard that learns your energy, predicts burnout, and schedules your life.**

[![Next.js 14](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-1b5e20?style=for-the-badge&logoColor=white)](https://xgboost.ai/)

</div>

<br />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/448428a5-28b5-4bb6-b2dd-c0160a8bae0e" />

## What is Aurora?

Aurora is an intelligent cognitive productivity dashboard designed to eliminate decision fatigue and protect user wellbeing. Built for high-performers, deep-workers, and engineers, it uses a suite of local and fast machine learning models to dynamically forecast energy peaks, monitor burnout risk, and autonomously orchestrate tasks. By merging bleeding-edge UI/UX aesthetics with rigorous AI systems, Aurora acts as a personalized neural co-pilot for your daily workflow.

## Key Features

*   **Auth:** Email/password accounts with JWT sessions — every data endpoint is scoped to the authenticated user; there's no shared or client-supplied user ID anywhere in the API.
*   **Dashboard:** A dynamic intelligence hub presenting active tasks, immediate neural insights, and an animated ambient energy wave representing your current focus state.
*   **Energy:** Predictive hourly energy forecasting leveraging LSTM neural networks to help you align your most demanding work with your body's natural cognitive peaks.
*   **Burnout:** Real-time 30-day burnout risk prediction and feature-explainability (SHAP values) powered by XGBoost, safeguarding long-term mental stamina.
*   **Scheduler:** An autonomous time-blocking system utilizing Deep Q-Networks (Reinforcement Learning) to logically bin tasks according to priority, deadlines, and active energy bounds.
*   **Identity:** A semantic-similarity engine powered by HuggingFace MiniLM embeddings to continuously evaluate how well your daily actions map to your overarching personal identity.
*   **Analytics:** Comprehensive historical tracking of deep work volume, decision fatigue, task completion rates, and overarching predictive trends.

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Recharts, Framer Motion, TanStack Query |
| **Backend** | FastAPI, SQLAlchemy (Async), Alembic, SlowAPI, python-jose, bcrypt |
| **Database** | SQLite (dev), PostgreSQL (prod — Render, Supabase, or any managed Postgres) |
| **ML Models** | PyTorch LSTM, Deep Q-Network, XGBoost + SHAP, HuggingFace MiniLM |
| **UI Libraries** | Magic UI, Aceternity UI, React Bits |
| **DevOps** | Vercel (frontend), Render (backend, Docker) |

## Getting Started

**Prerequisites:**
*   Node.js 18+
*   Python 3.11+

### Step-by-Step Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/okayniti/Aurora.git
   cd Aurora
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   cp .env.example .env      # then fill in SECRET_KEY at minimum — see below
   uvicorn app.main:app --reload --port 8000
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
   npm run dev
   ```

Aurora will now be fully operational. The frontend runs on `localhost:3000` and talks to the API on `localhost:8000`. Visit `/register` to create the first account — there's no seeded demo user; every user's data is private to their own login.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | Async connection string. SQLite for dev (`sqlite+aiosqlite:///./aurora_dev.db`); for Postgres, a bare `postgres://` or `postgresql://` URL is automatically rewritten to the `asyncpg` driver. |
| `SECRET_KEY` | Yes in prod | JWT signing key. The app **refuses to start** if `DEBUG=false` and this is still the development default — set a real random value before deploying. |
| `DEBUG` | Yes | `true` locally, `false` in any real deployment. |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins (e.g. your Vercel URL). Whitespace around entries is trimmed automatically. |
| `LOG_LEVEL` | No | Defaults to `INFO`. |
| `EMBEDDING_MODEL_NAME` | No | Defaults to `sentence-transformers/all-MiniLM-L6-v2`. |
| `GEMINI_API_KEY` | No | Enables the `/api/chat` assistant to call Gemini instead of returning an offline canned response. |

See `backend/.env.example` for the full list (RL hyperparameters, replanning thresholds, etc. — all have sane defaults).

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the backend API, including the `/api` suffix (e.g. `https://your-backend.onrender.com/api`). |

## Project Structure

```text
Aurora/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app, lifespan (loads ML models), health check
│   │   ├── config.py         # Pydantic Settings — env parsing, prod safety checks
│   │   ├── dependencies.py   # Auth (get_current_user) and ownership guards
│   │   ├── middleware.py     # Request timing middleware
│   │   ├── core/security.py  # Password hashing (bcrypt) and JWT issuing
│   │   ├── api/               # One router per domain (auth, energy, burnout, scheduler,
│   │   │                       identity, tasks, replanning, analytics, chat)
│   │   ├── services/          # Business logic called by the routers
│   │   ├── ml/                 # energy_model (LSTM), burnout_model (XGBoost+SHAP),
│   │   │                       rl_scheduler (DQN), identity_engine (MiniLM), replanning
│   │   ├── database/           # SQLAlchemy models, Pydantic schemas, async engine
│   │   └── utils/               # Rate limiter, TTL cache, websocket manager, logger
│   ├── alembic/                # Postgres schema migrations
│   ├── scripts/                # seed_data.py, train_all.py — ML training & dev seeding
│   ├── tests/                  # pytest suite (route auth/ownership, ML module checks)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router — one folder per page/route
│   │   ├── components/
│   │   │   ├── charts/          # Recharts wrappers, lazy-loaded via next/dynamic
│   │   │   ├── layout/          # Header, SideNav, ClientShell, MetricCard, ...
│   │   │   └── ui/               # Design-system primitives (glass panels, gradients, ...)
│   │   └── lib/                  # api.ts (typed client), UserContext, useApi hook
│   ├── DESIGN.md                # "Fluid Intelligence" design system spec
│   └── package.json
├── render.yaml                  # Render Blueprint — provisions backend + Postgres together
└── docker-compose.yml            # Local Postgres + backend + frontend, all in Docker
```

## API Reference

Base path: `/api`. Every route below **requires** `Authorization: Bearer <token>` except `/health` and `/auth/register` + `/auth/login`. Routes that take a `{user_id}` path param verify it matches the token's owner (403 otherwise) — there is no way to read or write another account's data.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Public health check — DB connectivity and ML model load status. |
| `POST` | `/auth/register` | Create an account, returns a session token. |
| `POST` | `/auth/login` | Exchange credentials for a session token. |
| `GET` | `/auth/me` | Current authenticated user. |
| `GET` | `/energy/forecast/{user_id}` | 24-hour LSTM energy forecast. |
| `POST` | `/energy/log` | Log an actual energy reading. |
| `GET` | `/energy/history/{user_id}` | Historical energy logs. |
| `GET` | `/energy/comparison/{user_id}` | Predicted vs. actual energy for a day. |
| `GET` | `/burnout/risk/{user_id}` | Current burnout risk + SHAP feature importance. |
| `POST` | `/burnout/snapshot` | Record burnout indicator values. |
| `GET` | `/burnout/trend/{user_id}` | Burnout probability trend over N days. |
| `GET` | `/burnout/snapshot/{user_id}/latest` | Latest raw snapshot (for UI init). |
| `POST` | `/scheduler/optimize/{user_id}` | Run the DQN agent to generate a daily schedule. |
| `GET` | `/scheduler/schedule/{user_id}` | Get the schedule for a given day. |
| `POST` | `/scheduler/feedback` | Report whether a scheduled block was completed (RL reward signal). |
| `GET` | `/scheduler/efficiency/{user_id}` | Schedule adherence / completion metrics. |
| `POST` | `/identity/profile` | Set or update the user's identity description. |
| `GET` | `/identity/profile/{user_id}` | Get the identity description. |
| `POST` | `/identity/align` | Compute a task's alignment score against the identity profile. |
| `GET` | `/identity/scores/{user_id}` | Alignment scores for all of the user's tasks. |
| `POST` | `/tasks/` | Create a task. |
| `GET` | `/tasks/user/{user_id}` | List tasks (optional `status`/`category` filters). |
| `PUT` | `/tasks/{task_id}` | Update task fields. |
| `PATCH` | `/tasks/{task_id}/status` | Update task status. |
| `POST` | `/replan/trigger` | Manually trigger a schedule replan; also broadcasts over the `/ws/replan` websocket. |
| `GET` | `/replan/events/{user_id}` | Replan event history. |
| `GET` | `/analytics/dashboard/{user_id}` | Aggregated dashboard metrics. |
| `GET` | `/analytics/daily/{user_id}` | Analytics for a specific day. |
| `POST` | `/chat/` | Talk to the Aurora assistant (Gemini if configured, offline fallback otherwise). |

Full interactive docs (Swagger UI) are always available at `/docs` on a running backend.

## ML Models

*   **LSTM (Energy Forecasting):** Recurrent neural nets mapping circadian biological patterns and estimating chronological task density variations.
*   **DQN (RL Scheduling):** A localized Reinforcement Learning network targeting the scheduling bin-packing problem utilizing maximum energy reward states.
*   **XGBoost + SHAP (Burnout):** Boosted trees predicting long-term psychological strain, augmented with SHAP trees calculating explainable task contribution factors.
*   **MiniLM (Identity Alignment):** An embedded sentence-transformer mapping high-dimensional vectors to understand exact semantic overlaps between raw text tasks and broader foundational goals.

All four are loaded into memory once at backend startup (`app/main.py`'s `lifespan`) — see the memory note under Deployment before picking a hosting plan.

## Design System
*Fluid Intelligence* encapsulates the UX ideology behind Aurora: clean, breathable, yet highly structured layouts with minimal friction. Full spec in [`frontend/DESIGN.md`](frontend/DESIGN.md).

*   **Color Tokens**: `primary` (#cc97ff), `secondary` (#3adffa), `tertiary` (#9093ff).
*   **Key UX Patterns**: Dark-mode glassmorphism (`glass-panel`), ambient light reactive orbs tracking mouse movements (`Spotlight`), and depth-altering scroll parallax layouts (`BackgroundBeams`).

## Performance
Aurora aims for instantaneous frontend interactivity. Standardized benchmarks feature an outstanding **~105kb First Load JS** payload. We achieved these metrics by extensively applying `next/dynamic` to heavy charting and structural visual layers, wrapping high-turnover UI nodes inside `React.memo`, and executing sophisticated structural `Skeleton` fallback sequences per route intercept.

## Deployment

**Backend (Render)**:
1. Easiest path: **New → Blueprint**, point it at this repo — `render.yaml` provisions the web service and a Postgres database together, using the Docker build in `backend/Dockerfile`.
2. Manually is fine too: **New → Web Service**, root directory `backend`, runtime Docker, health check path `/api/health`, and set the env vars listed above.
3. **Memory matters here.** The backend loads PyTorch, XGBoost, SHAP, and sentence-transformers into memory at boot. The Docker image installs the CPU-only torch wheel to cut this down (no CUDA libraries you'd never use on a GPU-less host), but Render's Free/Starter tiers are both 512MB RAM and can still OOM-kill the process during startup. If the deploy goes green but then crash-loops or the health check never turns up, that's almost always why — Standard (2GB) is the tier that reliably fits this model stack.
4. `CORS_ORIGINS` on the backend must include your deployed frontend's exact origin, or every request from it will fail CORS preflight even though both services are individually healthy.

**Frontend (Vercel)**:
1. Import the repo, set **Root Directory** to `frontend`.
2. Set `NEXT_PUBLIC_API_URL` to your backend's public URL + `/api`.
3. Deploy — Vercel auto-detects Next.js, no custom build config needed.

**Local Docker (alternative to the above)**:
```bash
docker compose up
```
Spins up Postgres, the backend, and the frontend together — see `docker-compose.yml`.

## License
No license file is currently included — all rights reserved by default. Contact the repo owner before reusing or redistributing this code.
