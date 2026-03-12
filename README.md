<p align="center">
  <img src="https://img.shields.io/badge/AURORA-Behavioral%20AI-5c7cfa?style=for-the-badge&logo=brain&logoColor=white" alt="AURORA Badge"/>
</p>

<h1 align="center">🌌 AURORA — Adaptive User-aware Resource Orchestration & Realtime Analytics</h1>

<p align="center">
  <strong>An AI-powered behavioral intelligence platform that prevents burnout before it happens.</strong><br/>
  Combines LSTM energy forecasting, XGBoost burnout detection, and Reinforcement Learning task scheduling — all adapting to <em>your</em> cognitive patterns.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.13-blue?logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/PyTorch-2.0+-ee4c2c?logo=pytorch&logoColor=white" alt="PyTorch"/>
  <img src="https://img.shields.io/badge/XGBoost-SHAP-orange" alt="XGBoost"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License"/>
</p>

---

## 🧠 What is AURORA?

AURORA is a **full-stack AI/ML application** that acts as a personal cognitive companion. It monitors your behavioral patterns — energy levels, task completion, stress indicators — and uses machine learning to:

- **Predict** when your energy will peak or crash (LSTM time-series model)
- **Detect** early signs of burnout before you feel them (XGBoost + SHAP explainability)
- **Schedule** your tasks at optimal times using your energy forecast (Deep Q-Network RL agent)
- **Align** tasks with your personal identity and values (Sentence Transformers embeddings)
- **Replan** dynamically when unexpected changes occur (rule-based trigger system)

> Think of it as **Spotify Wrapped for your productivity** — but in real-time, with predictions.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AURORA FRONTEND                       │
│        Next.js 14 · React · TypeScript · Tailwind       │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│   │Dashboard │ │ Energy   │ │ Burnout  │ │   RL     │  │
│   │          │ │ Forecast │ │ Monitor  │ │Scheduler │  │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│        └─────────────┴─────────────┴─────────────┘      │
│                         REST API                         │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────┐
│                    AURORA BACKEND                        │
│          FastAPI · SQLAlchemy · AsyncIO · Pydantic       │
│   ┌──────────────────────────────────────────────────┐  │
│   │                 API Layer (7 routers)             │  │
│   ├──────────────────────────────────────────────────┤  │
│   │               Services Layer (6 services)        │  │
│   ├──────────┬──────────┬───────────┬────────────────┤  │
│   │  LSTM    │ XGBoost  │  DQN RL   │  Sentence     │  │
│   │  Energy  │ Burnout  │ Scheduler │  Transformers  │  │
│   │  Model   │ + SHAP   │  Agent    │  Embeddings    │  │
│   └──────────┴──────────┴───────────┴────────────────┤  │
│   │              SQLite / PostgreSQL                  │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🎯 Cognitive Dashboard
- Real-time metrics: deep work hours, burnout risk, identity alignment, RL efficiency
- Live clock with behavioral status indicators
- Energy forecast chart + burnout trend visualization

### ⚡ Energy Forecasting (LSTM)
- 24-hour energy predictions using PyTorch LSTM
- **Log your energy** with sleep, caffeine, and exercise inputs
- Historical energy trends (peak, average, low by day)
- Automatic fallback to heuristic model if LSTM unavailable

### 🛡 Burnout Monitor (XGBoost + SHAP)
- Real-time burnout probability via XGBoost classifier
- **SHAP-based explainability** — see which factors drive your risk
- 30-day burnout trend visualization
- Risk levels: low, moderate, high, critical

### 📋 RL Task Scheduler (Deep Q-Network)
- **Create tasks** with title, description, difficulty, priority, category
- DQN agent schedules tasks at energy-optimal times
- **Click-to-toggle** task status (pending → in progress → done)
- Reward function: completion (+1.0), alignment (+0.5), burnout penalty (−1.5)

### 🧬 Identity Alignment (Sentence Transformers)
- Define your identity/values as free text
- Cosine similarity scoring between tasks and identity
- Alignment visualization for all tasks

### 📊 Analytics Dashboard
- Weekly performance trends
- Task completion rates and cognitive patterns
- Model performance metrics

### 🎨 Design & UX
- **Glassmorphism** dark theme with gradient accents
- **7 micro-animations**: fadeInUp, pulseGlow, float, shimmer, countUp, slideInLeft, stagger
- **Responsive** mobile sidebar with hamburger menu
- **Empty states** for graceful no-data handling

---

## 🤖 ML Models Deep Dive

| Model | Architecture | Input | Output | Training |
|-------|-------------|-------|--------|----------|
| **Energy** | 2-layer LSTM (hidden=64) | 168hr window × 6 features | 24hr energy forecast | 50 epochs, early stopping |
| **Burnout** | XGBoost classifier | sleep, stress, energy variance, cognitive load | Burnout probability + SHAP values | 2000 samples, validation split |
| **Scheduler** | Double DQN (ε-greedy) | Task features + energy + burnout state | Optimal task ordering | 500 episodes, target network updates |
| **Identity** | Sentence Transformers | User identity text + task descriptions | Cosine similarity score | Pre-trained (all-MiniLM-L6-v2) |

### Feature Engineering
- **Cyclical encoding** for time features (hour, day-of-week) using sin/cos
- **Sliding window** dataset creation for LSTM (7-day windows → 24hr forecasts)
- **Custom reward function** for RL: completion, alignment, priority, burnout penalty

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ 
- Node.js 18+
- Git

### 1. Clone the repo
```bash
git clone https://github.com/okayniti/Aurora.git
cd Aurora
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

### 3. Seed the Database
```bash
python scripts/seed_data.py
```

### 4. Train ML Models
```bash
python scripts/train_all.py
# Takes ~3-5 minutes: Energy LSTM → Burnout XGBoost → RL DQN
```

### 5. Start Backend
```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev
```

### 7. Open the App
Visit **http://localhost:3000** 🚀

---

## 📁 Project Structure

```
Aurora/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI route handlers (7 routers)
│   │   │   ├── energy.py     # Energy forecast & logging endpoints
│   │   │   ├── burnout.py    # Burnout risk & trend endpoints
│   │   │   ├── scheduler.py  # RL schedule optimization
│   │   │   ├── tasks.py      # CRUD for tasks
│   │   │   ├── identity.py   # Identity alignment endpoints
│   │   │   ├── analytics.py  # Dashboard aggregation
│   │   │   └── replan.py     # Dynamic replanning triggers
│   │   ├── database/
│   │   │   ├── models.py     # SQLAlchemy ORM models
│   │   │   ├── schemas.py    # Pydantic request/response schemas
│   │   │   └── session.py    # Async database session
│   │   ├── ml/
│   │   │   ├── energy_model/ # LSTM model, trainer, features, inference
│   │   │   ├── burnout_model/# XGBoost classifier, SHAP, trainer
│   │   │   ├── rl_scheduler/ # DQN agent, environment, reward, trainer
│   │   │   ├── identity_engine/ # Sentence Transformers embeddings
│   │   │   └── replanning/   # Rule-based trigger engine
│   │   ├── services/         # Business logic layer (6 services)
│   │   ├── utils/            # Logger, metrics, config
│   │   └── main.py           # FastAPI app entry point
│   ├── scripts/
│   │   ├── seed_data.py      # Database seeding script
│   │   └── train_all.py      # ML training orchestrator
│   ├── tests/                # Unit tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Cognitive Dashboard
│   │   │   ├── energy/page.tsx   # Energy Forecast + Log Energy
│   │   │   ├── burnout/page.tsx  # Burnout Monitor
│   │   │   ├── scheduler/page.tsx# RL Scheduler + Add Task
│   │   │   ├── identity/page.tsx # Identity Alignment
│   │   │   ├── analytics/page.tsx# Analytics Dashboard
│   │   │   ├── layout.tsx        # App layout with sidebar
│   │   │   └── globals.css       # Design system + animations
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar, MetricCard
│   │   │   └── ui/               # Skeleton, EmptyState
│   │   └── lib/
│   │       ├── api.ts            # API client (20+ endpoints)
│   │       ├── useApi.ts         # React hook with fallback
│   │       └── UserContext.tsx    # User state management
│   ├── Dockerfile
│   ├── package.json
│   └── tailwind.config.ts
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/users` | List users |
| `GET` | `/api/energy/forecast/{userId}` | 24hr energy prediction |
| `POST` | `/api/energy/log` | Log actual energy level |
| `GET` | `/api/energy/history/{userId}` | Historical energy data |
| `GET` | `/api/burnout/risk/{userId}` | Current burnout probability |
| `GET` | `/api/burnout/trend/{userId}` | 30-day burnout trend |
| `POST` | `/api/tasks/` | Create a new task |
| `GET` | `/api/tasks/{userId}` | List user tasks |
| `PATCH` | `/api/tasks/{taskId}/status` | Update task status |
| `POST` | `/api/scheduler/optimize/{userId}` | Generate optimized schedule |
| `GET` | `/api/scheduler/schedule/{userId}` | Get today's schedule |
| `POST` | `/api/identity/profile` | Update identity description |
| `POST` | `/api/identity/align` | Compute task alignment |
| `GET` | `/api/analytics/dashboard/{userId}` | Dashboard metrics |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts |
| **Backend** | FastAPI, SQLAlchemy 2.0 (async), Pydantic v2, Uvicorn |
| **ML/AI** | PyTorch (LSTM), XGBoost + SHAP, Sentence Transformers, NumPy |
| **RL** | Custom DQN with experience replay, target network, ε-greedy |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **DevOps** | Docker, Docker Compose |

---

## 📜 License

This project is licensed under the MIT License.
