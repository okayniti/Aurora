<div align="center">

# AURORA

**An AI-powered cognitive productivity dashboard that learns your energy, predicts burnout, and schedules your life.**

[![Next.js 14](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-1b5e20?style=for-the-badge&logoColor=white)](https://xgboost.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

<br />

![Aurora Dashboard](./docs/screenshot.png)

## What is Aurora?

Aurora is an intelligent cognitive productivity dashboard designed to eliminate decision fatigue and protect user wellbeing. Built for high-performers, deep-workers, and engineers, it uses a suite of local and fast machine learning models to dynamically forecast energy peaks, monitor burnout risk, and autonomously orchestrate tasks. By merging bleeding-edge UI/UX aesthetics with rigorous AI systems, Aurora acts as a personalized neural co-pilot for your daily workflow.

## Key Features

*   **Dashboard:** A dynamic intelligence hub presenting active tasks, immediate neural insights, and an animated ambient energy wave representing your current focus state.
*   **Energy:** Predictive hourly energy forecasting leveraging LSTM neural networks to help you align your most demanding work with your body's natural cognitive peaks.
*   **Burnout:** Real-time 30-day burnout risk prediction and feature-explainability (SHAP values) powered by XGBoost, safeguarding long-term mental stamina.
*   **Scheduler:** An autonomous time-blocking system utilizing Deep Q-Networks (Reinforcement Learning) to logically bin tasks according to priority, deadlines, and active energy bounds.
*   **Identity:** A semantic-similarity engine powered by HuggingFace MiniLM embeddings to continuously evaluate how well your daily actions map to your overarching personal identity.
*   **Analytics:** Comprehensive historical tracking of deep work volume, decision fatigue, task completion rates, and overarching predictive trends.

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Recharts, Framer Motion |
| **Backend** | FastAPI, SQLAlchemy (Async), Alembic, SlowAPI |
| **Database** | SQLite (dev), PostgreSQL via Supabase (prod) |
| **ML Models** | PyTorch LSTM, Deep Q-Network, XGBoost + SHAP, HuggingFace MiniLM |
| **UI Libraries** | Magic UI, Aceternity UI, React Bits |
| **DevOps** | Vercel (frontend), Render (backend) |

## Getting Started

**Prerequisites:**
*   Node.js 18+
*   Python 3.11+

### Step-by-Step Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/aurora.git
   cd aurora
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

Aurora will now be fully operational. The frontend runs precisely on `localhost:3000` while proxying intelligence requests directly to `localhost:8000`.

## Environment Variables

Secure environments require `.env` declarations inside both `backend` and `frontend` environments depending on the context.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | The async connection string to the local DB or PostgreSQL cluster. | `postgresql+asyncpg://user:pass@host:5432/db` |
| `FRONTEND_URL` | Used for precise CORS configuration validating incoming UI requests. | `http://localhost:3000` (Dev) |

## Project Structure

```text
aurora/
├── backend/
│   ├── app/
│   │   ├── main.py           # Core FastAPI execution node 
│   │   ├── api.py            # API routing specifications
│   │   ├── ml_models.py      # Core logic for LSTM/XGBoost/DQN embeddings
│   │   ├── schemas.py        # Pydantic input validations
│   │   ├── database.py       # Async SQLAlchemy connections 
│   │   └── config.py         # Env config resolution layer
│   ├── migrations/           # Alembic PostgreSQL revisions
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js 14 App Router layout & pages
│   │   ├── components/       # Heavy architecture & atomic UI tokens 
│   │   │   ├── charts/       # Lazy-evaluated Recharts wrappers
│   │   │   ├── layout/       # Global memoized wrappers (MetricCard, etc)
│   │   │   └── ui/           # Premium design components (MagicUI/Aceternity)
│   │   └── lib/              # Client API adapters & Context architectures
│   ├── tailwind.config.ts    # Fluid intelligence dynamic colors
│   ├── next.config.js        # Bundle analysis execution
│   └── package.json
└── README.md
```

## API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Pulse check validating database and ML tensor availability. |
| `GET` | `/api/dashboard/{user_id}` | Aggregates daily telemetry, active tasks, and summarized insights. |
| `GET` | `/api/energy/forecast/{user_id}` | Computes and returns the 24-hr LSTM energy tensor forecast. |
| `GET` | `/api/burnout/risk/{user_id}` | Assesses immediate and near-term burnout probability mapping. |
| `POST` | `/api/scheduler/optimize` | Solves for optimal daily scheduling configurations utilizing DQN. |
| `POST` | `/api/identity/align` | Embeds daily intentions and checks semantic alignment via MiniLM. |
| `GET` | `/api/analytics/weekly/{user_id}` | Fetches raw longitudinal trends for deeper Recharts visualization. |

## ML Models

*   **LSTM (Energy Forecasting):** Recurrent neural nets mapping circadian biological patterns and estimating chronological task density variations.
*   **DQN (RL Scheduling):** A localized Reinforcement Learning network targeting the scheduling bin-packing problem utilizing maximum energy reward states.
*   **XGBoost + SHAP (Burnout):** Boosted trees predicting long-term psychological strain, augmented with SHAP trees calculating explainable task contribution factors.
*   **MiniLM (Identity Alignment):** An embedded sentence-transformer mapping high-dimensional vectors to understand exact semantic overlaps between raw text tasks and broader foundational goals.

## Design System
*Fluid Intelligence* encapsulates the UX ideology behind Aurora: clean, breathable, yet highly structured layouts with minimal friction.

*   **Color Tokens**: `primary` (#cc97ff), `secondary` (#3adffa), `tertiary` (#9093ff).
*   **Key UX Patterns**: Dark-mode glassmorphism (`glass-panel`), ambient light reactive orbs tracking mouse movements (`Spotlight`), and depth-altering scroll parallax layouts (`BackgroundBeams`).

## Performance
Aurora aims for instantaneous frontend interactivity. Standardized benchmarks feature an outstanding **~105kb First Load JS** payload. We achieved these metrics by extensively applying `next/dynamic` to heavy charting and structural visual layers, wrapping high-turnover UI nodes inside `React.memo`, and executing sophisticated structural `Skeleton` fallback sequences per route intercept.

## Deployment

**Frontend (Vercel)**:
1. Connect repository natively over Vercel.
2. The UI will seamlessly auto-build utilizing `npm run build` targeting standard outputs.

**Backend (Render)**:
1. Deploy as a new Web Service using the `backend` root path.
2. Use Python 3.11 environment. 
3. Run command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Database (Supabase)**:
1. Spin up a new Supabase PostgreSQL cluster.
2. Store the resulting string locally, update to `postgresql+asyncpg` dialect format.
3. Apply inside backend ENV logic as `DATABASE_URL`.

## Contributing

We welcome community extensions targeting new AI layers and UI aesthetics. Standard protocol involves:
1. Forking the repository
2. Creating a feature branch (`git checkout -b feature/AmazingFeature`)
3. Committing your changes (`git commit -m 'Add some AmazingFeature'`)
4. Resolving PR flows targeting `main`

## License
Open-sourced under the **MIT** License. See the `LICENSE` file for extensive details.
