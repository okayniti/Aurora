<h1 align="center">🌅 AURORA</h1>

<h3 align="center">Adaptive Unified Reinforcement Optimized Routine Architect</h3>

<p align="center">
  <em>An AI-powered behavioral intelligence system that predicts cognitive energy, schedules tasks dynamically, aligns daily execution with long-term identity goals, and prevents burnout using machine learning and reinforcement learning.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776ab?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/PyTorch-2.5-ee4c2c?style=for-the-badge&logo=pytorch&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/XGBoost-SHAP-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<p align="center">
  <strong>AURORA is not a productivity app.</strong><br>
  It is a <strong>human-performance operating system</strong> — a research-grade platform that treats daily execution as an optimization problem.
</p>

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ee3c16cf-653e-4f6d-9ba2-612566829c41" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c3ada2f6-67ae-4cef-bfd5-9aa2317035a6" />

---

## 🧠 What Makes It Different

Most "AI productivity apps" are glorified todo lists with GPT wrappers. AURORA is built from the ground up with **real ML models**:

| Problem | AURORA's Approach | Model |
|---------|------------------|-------|
| "When am I most productive?" | Predicts hourly cognitive energy using historical behavioral patterns | **LSTM** (PyTorch) |
| "Am I burning out?" | Classifies burnout risk with explainable factors | **XGBoost + SHAP** |
| "What should I do next?" | Learns optimal task ordering through trial and reward | **Double DQN** (RL) |
| "Does this align with who I want to be?" | Measures task-identity similarity via semantic embeddings | **Sentence Transformers** |
| "What if my plan falls apart?" | Detects deviations and auto-reschedules in real-time | **Rule-Based + RL** |

---

## 📸 Live Screenshots

<table>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/dashboard.png" alt="Cognitive Dashboard" />
      <p align="center"><strong>Cognitive Dashboard</strong><br><sub>Real-time metrics, energy forecast, burnout trend, SHAP feature importance</sub></p>
    </td>
    <td width="50%">
      <img src="docs/screenshots/energy.png" alt="Energy Forecasting" />
      <p align="center"><strong>Energy Forecasting Engine</strong><br><sub>24-hour LSTM-predicted energy with circadian rhythm modeling</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/burnout.png" alt="Burnout Monitor" />
      <p align="center"><strong>Burnout Risk Monitor</strong><br><sub>XGBoost classifier with per-prediction SHAP explainability</sub></p>
    </td>
    <td width="50%">
      <img src="docs/screenshots/scheduler.png" alt="RL Scheduler" />
      <p align="center"><strong>RL Task Scheduler</strong><br><sub>Deep Q-Network agent with energy-difficulty matching and reward breakdown</sub></p>
    </td>
  </tr>
</table>

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│   Dashboard │ Energy │ Burnout │ Scheduler │ Identity │ Analytics │
│                         │ REST API                           │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    FastAPI Backend                            │
│  ┌────────────┐  ┌──────────┐  ┌─────────┐  ┌───────────┐  │
│  │ Energy     │  │ Burnout  │  │ RL      │  │ Identity  │  │
│  │ LSTM       │  │ XGBoost  │  │ DQN     │  │ Sentence  │  │
│  │ (PyTorch)  │  │ + SHAP   │  │ Agent   │  │ Transformers │
│  └────────────┘  └──────────┘  └─────────┘  └───────────┘  │
│                          │                                   │
│          Services Layer → Replanning Engine                   │
│                          │                                   │
│                    ┌─────┴──────┐                            │
│                    │ PostgreSQL │ (SQLite for dev)            │
│                    │ 8 Tables   │                            │
│                    └────────────┘                            │
└──────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Strict modular separation** — each ML module has `model.py`, `train.py`, `inference.py`, `features.py`, `evaluate.py`
- **Training ≠ Inference** — completely separated pipelines
- **Heuristic fallbacks** — every ML module works immediately via rule-based fallback (cold-start ready)
- **Async throughout** — full async FastAPI with SQLAlchemy async sessions

---

## 🧠 ML Modules Deep Dive

### 1. Energy Forecasting Engine

| Aspect | Detail |
|--------|--------|
| **Architecture** | Multi-layer LSTM with layer normalization |
| **Input** | 168-hour sliding window (7 days) of behavioral features |
| **Features** | Cyclically-encoded time (sin/cos), sleep, caffeine, exercise |
| **Output** | 24-hour energy predictions (0–10 scale) |
| **Fallback** | Circadian rhythm heuristic with sleep/caffeine modifiers |

### 2. Burnout Risk Predictor

| Aspect | Detail |
|--------|--------|
| **Architecture** | XGBoost gradient-boosted classifier |
| **Features** | Sleep trend (7-day EMA), deep work streak, stress trend, energy variance, cognitive load |
| **Explainability** | SHAP TreeExplainer — per-prediction feature importance |
| **Class Balancing** | `scale_pos_weight=2.0` for imbalanced burnout labels |
| **Fallback** | Weighted rule-based scoring system |

### 3. RL Task Scheduler

```
State:  s = (energy, burnout, time_left, tasks_left, avg_difficulty, cognitive_load)
Action: a = select_task(i) ∈ {0, ..., N-1} ∪ {break}
Reward: R = +1.0×completion + 0.5×alignment + 0.3×priority − 1.5×burnout − 1.0×overload
```

| Aspect | Detail |
|--------|--------|
| **Algorithm** | Double DQN with experience replay |
| **Exploration** | ε-greedy with exponential decay (1.0 → 0.01) |
| **Action Masking** | Invalid actions masked with −∞ Q-values |
| **Target Network** | Hard update every 10 episodes |
| **Fallback** | Priority-weighted greedy scheduler |

### 4. Identity Alignment Engine

| Aspect | Detail |
|--------|--------|
| **Embedding** | `all-MiniLM-L6-v2` (384 dimensions) |
| **Method** | Encode identity → embed each task → cosine similarity |
| **Output** | Alignment score per task (0–100%) |
| **Fallback** | TF-IDF vectorization with L2 normalization |

### 5. Dynamic Replanning

| Trigger | Detection | Response |
|---------|-----------|----------|
| Missed Task | `status="pending" AND time > scheduled_end` | Re-invoke scheduler |
| Energy Deviation | `|actual − predicted| > 2σ` | Reorder by difficulty |
| Stress Spike | `burnout_prob > 0.8` | Insert recovery breaks |

---

## ⚙ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 · TypeScript · Tailwind CSS · Recharts |
| **Backend** | FastAPI · Pydantic · SQLAlchemy (async) |
| **Database** | PostgreSQL / SQLite (dev) · 8 normalized tables |
| **ML - Forecasting** | PyTorch LSTM |
| **ML - Classification** | XGBoost + SHAP |
| **ML - RL** | PyTorch Double DQN |
| **ML - NLP** | Sentence Transformers |
| **Infrastructure** | Docker · Docker Compose |

---

## 📡 API Endpoints (20+)

Full interactive documentation at `/docs` (Swagger) when backend is running.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/energy/forecast/{user_id}` | 24-hour energy predictions |
| `POST` | `/api/energy/log` | Record actual energy reading |
| `GET` | `/api/burnout/risk/{user_id}` | Burnout probability + SHAP values |
| `GET` | `/api/burnout/trend/{user_id}` | 30-day burnout trend |
| `POST` | `/api/scheduler/optimize/{user_id}` | RL-optimized schedule generation |
| `POST` | `/api/scheduler/feedback` | RL reward signal |
| `POST` | `/api/identity/align` | Task-identity alignment score |
| `GET` | `/api/analytics/dashboard/{user_id}` | Full dashboard metrics |
| `POST` | `/api/tasks/` | Create task |
| `POST` | `/api/replan/trigger` | Trigger schedule replanning |
| `GET` | `/api/health` | Health check |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+

### 1. Clone & Setup

```bash
git clone https://github.com/okayniti/Aurora.git
cd Aurora
cp .env.example .env
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate    # Windows (Git Bash)
# source venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### 4. Docker (Production)

```bash
docker compose up --build
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
```

---

## 📊 Evaluation Metrics

| Model | Metrics | Target |
|-------|---------|--------|
| Energy LSTM | MAE, RMSE, R², directional accuracy | MAE < 1.0, R² > 0.7 |
| Burnout Classifier | AUC-ROC, F1, Precision, Recall | AUC > 0.85, F1 > 0.8 |
| RL Scheduler | Episode reward, completion rate, burnout avoidance % | Completion > 80% |
| Identity Engine | Pearson correlation, alignment MAE | Pearson > 0.7 |

---

## 🗂 Project Structure (83 Files)

```
Aurora/
├── backend/
│   ├── app/
│   │   ├── api/              # 7 route modules + master router
│   │   ├── database/         # ORM models, schemas, connection
│   │   ├── ml/
│   │   │   ├── energy_model/ # LSTM model, features, train, inference, evaluate
│   │   │   ├── burnout_model/# XGBoost + SHAP
│   │   │   ├── rl_scheduler/ # DQN agent, Gym environment, reward
│   │   │   ├── identity_engine/ # Sentence-transformer embeddings
│   │   │   └── replanning/   # Triggers, engine, priority protection
│   │   ├── services/         # 6 business logic services
│   │   └── utils/            # Logger, metrics
│   ├── scripts/              # Seed data, training orchestration
│   ├── tests/                # Unit tests
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/              # 6 pages: dashboard, energy, burnout, scheduler, identity, analytics
│   │   ├── components/       # Sidebar, MetricCard
│   │   ├── lib/              # API client, utilities
│   │   └── types/            # TypeScript interfaces
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🌟 Why This Project Is Unique

1. **Real ML, not API wrappers** — LSTM, XGBoost, DQN, and Sentence-Transformers built from scratch
2. **Reinforcement learning for scheduling** — the agent _learns_ optimal ordering through multi-component rewards
3. **Explainable AI** — SHAP values make burnout predictions transparent and interpretable
4. **Identity alignment via NLP** — semantic embeddings ensure daily tasks align with who you _want to become_
5. **Cold-start ready** — heuristic fallbacks work instantly; ML models improve as data accumulates
6. **Production-grade** — async APIs, Docker deployment, structured logging, separated training/inference

---

## 🔮 Future Scope

- Wearable integration (Apple Watch / Fitbit HRV)
- Temporal Fusion Transformer for energy forecasting
- PPO agent upgrade from DQN
- Multi-day planning and collaborative scheduling
- Mobile companion app (React Native)
- LLM-powered natural language task creation

---

## 📝 Resume-Ready Summary

> **AURORA** is a full-stack AI behavioral intelligence platform that optimizes daily human performance through machine learning. The system combines an **LSTM energy forecasting engine** (PyTorch), an **XGBoost burnout classifier with SHAP explainability**, a **Deep Q-Network reinforcement learning scheduler** with multi-component reward signals, and a **sentence-transformer identity alignment engine**. Built with **FastAPI** microservices, **PostgreSQL** (8-table schema), a **Next.js** analytical dashboard with Recharts visualizations, and **Docker** orchestration. Demonstrates end-to-end ML system design: from feature engineering and training pipelines to real-time inference APIs with heuristic fallbacks, automated replanning triggers, and comprehensive evaluation frameworks.

---

<p align="center">
  <sub><strong>AURORA</strong> — Because execution should be adaptive, not arbitrary.</sub>
</p>
