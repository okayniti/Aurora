<p align="center">
  <img src="https://img.shields.io/badge/AURORA-Behavioral%20AI-5c7cfa?style=for-the-badge&labelColor=0a0e1a" alt="AURORA" />
  <img src="https://img.shields.io/badge/Python-3.11-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/PyTorch-2.5-ee4c2c?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

# 🌅 AURORA

### **Adaptive Unified Reinforcement Optimized Routine Architect**

> _An AI-powered behavioral intelligence system that predicts cognitive energy, schedules tasks dynamically, aligns daily execution with long-term identity goals, and prevents burnout using machine learning and reinforcement learning._

AURORA is not a productivity app. It is a **human-performance operating system** — a research-grade platform that treats daily execution as an optimization problem, combining time-series forecasting, gradient-boosted classification, deep reinforcement learning, and NLP embeddings into a unified adaptive system.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [System Architecture](#-system-architecture)
- [Core ML Modules](#-core-ml-modules)
- [Reinforcement Learning Approach](#-reinforcement-learning-approach)
- [Explainability](#-explainability)
- [Tech Stack](#-tech-stack)
- [API Documentation](#-api-documentation)
- [Installation](#-installation)
- [Development Roadmap](#-development-roadmap)
- [Evaluation Metrics](#-evaluation-metrics)
- [Why This Project Is Unique](#-why-this-project-is-unique)
- [Future Scope](#-future-scope)
- [Resume-Ready Summary](#-resume-ready-summary)

---

## 🎯 Problem Statement

Knowledge workers face a critical inefficiency: **they schedule tasks without considering their cognitive state.** The result is a systematic mismatch between _what_ needs to be done, _when_ it's scheduled, and _how much energy_ is available to do it.

Current productivity tools treat all hours as equal, ignore burnout risk entirely, and have no mechanism to learn from behavioral patterns. This leads to:

- **Chronic energy misallocation** — hard tasks during low-energy periods
- **Invisible burnout accumulation** — no early warning system
- **Identity drift** — daily tasks diverge from long-term goals
- **Static scheduling** — no adaptation when conditions change mid-day

---

## 💡 Solution Overview

AURORA addresses these problems through five interconnected AI modules:

| Module | Intelligence Layer | Purpose |
|--------|-------------------|---------|
| **Energy Forecasting Engine** | LSTM (PyTorch) | Predict hourly cognitive energy for the next 24h |
| **Burnout Risk Predictor** | XGBoost + SHAP | Classify burnout probability with explainable feature importance |
| **RL Scheduler** | DQN with experience replay | Learn optimal task ordering through reinforcement learning |
| **Identity Alignment Engine** | Sentence Transformers | Measure task-identity alignment via semantic embeddings |
| **Dynamic Replanning System** | Rule-based + RL | Auto-reschedule when deviations are detected |

All modules feed into a **Cognitive Analytics Dashboard** that provides real-time visibility into deep work hours, identity alignment, burnout trend, energy forecast accuracy, decision fatigue, and RL strategy efficiency.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │Dashboard │ │ Energy   │ │ Burnout  │ │ Scheduler  │  │
│  │          │ │ Forecast │ │ Monitor  │ │ (RL View)  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│       │             │            │              │         │
│       └─────────────┴────────────┴──────────────┘         │
│                          │ API Client                     │
└──────────────────────────┼────────────────────────────────┘
                           │ HTTP / JSON
┌──────────────────────────┼────────────────────────────────┐
│                   FastAPI Backend                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Energy   │ │ Burnout  │ │ RL       │ │ Identity   │  │
│  │ API      │ │ API      │ │ Scheduler│ │ API        │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│       │             │            │              │         │
│  ┌────┴─────┐ ┌─────┴────┐ ┌────┴─────┐ ┌─────┴──────┐  │
│  │ Energy   │ │ Burnout  │ │ DQN      │ │ Sentence   │  │
│  │ LSTM     │ │ XGBoost  │ │ Agent    │ │ Transformer│  │
│  │ (PyTorch)│ │ + SHAP   │ │ (PyTorch)│ │ Embeddings │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│                          │ Services Layer                 │
│                  ┌───────┴────────┐                       │
│                  │  PostgreSQL    │                       │
│                  │  (8 tables)    │                       │
│                  └────────────────┘                       │
└───────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **Strict modular separation**: Each ML module has its own `model.py`, `train.py`, `inference.py`, `features.py`, and `evaluate.py`
- **Training ≠ Inference**: Training pipelines are completely separated from inference services
- **Service layer pattern**: API routes → Services → ML Models / Database (no direct coupling)
- **Heuristic fallbacks**: Every ML module has a rule-based fallback for cold-start scenarios
- **Async throughout**: Full async FastAPI with SQLAlchemy async sessions

---

## 🧠 Core ML Modules

### 1. Energy Forecasting Engine

| Aspect | Detail |
|--------|--------|
| **Architecture** | Multi-layer LSTM (PyTorch) with layer normalization |
| **Input** | 168-hour sliding window (7 days) of behavioral features |
| **Features** | Cyclically-encoded time (sin/cos), normalized sleep, caffeine, exercise |
| **Output** | 24-hour energy predictions (0–10 scale) |
| **Loss** | MSE with ReduceLROnPlateau scheduler |
| **Fallback** | Circadian rhythm heuristic with sleep/caffeine/exercise modifiers |
| **Training** | Sliding window, gradient clipping, early stopping, checkpoint saving |

### 2. Burnout Risk Predictor

| Aspect | Detail |
|--------|--------|
| **Architecture** | XGBoost gradient-boosted classifier |
| **Input Features** | Sleep trend (7d EMA), deep work streak, stress trend (EMA), energy variance (σ²), cognitive load (Σ difficulty) |
| **Output** | Burnout probability (0–1) + per-feature SHAP values |
| **Explainability** | SHAP TreeExplainer for per-prediction feature importance |
| **Class Balancing** | `scale_pos_weight=2.0` for imbalanced burnout labels |
| **Fallback** | Weighted rule-based scoring system |

### 3. RL Task Scheduler

| Aspect | Detail |
|--------|--------|
| **Algorithm** | Double DQN with experience replay |
| **State Space** | 6D continuous: energy, burnout prob, time remaining, tasks remaining, avg difficulty, cognitive load |
| **Action Space** | Discrete: select next task from pool (+ "take break" action) |
| **Reward** | Multi-component: `+1.0×completion + 0.5×alignment + 0.3×priority − 1.5×burnout − 1.0×overload` |
| **Target Network** | Hard update every 10 episodes |
| **Exploration** | ε-greedy with exponential decay (1.0 → 0.01) |
| **Action Masking** | Invalid actions (already-scheduled tasks) masked with -∞ Q-values |
| **Fallback** | Priority-weighted greedy scheduler |

### 4. Identity Alignment Engine

| Aspect | Detail |
|--------|--------|
| **Embedding Model** | `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions) |
| **Process** | Encode identity description → embed each task → cosine similarity |
| **Output** | Alignment score per task (0–100%) |
| **Caching** | Embeddings serialized and stored in PostgreSQL |
| **Batch Support** | Vectorized batch alignment for all user tasks |
| **Fallback** | TF-IDF vectorization with L2 normalization |

### 5. Dynamic Replanning System

| Trigger | Detection | Response |
|---------|-----------|----------|
| **Missed Task** | `status="pending" AND current_time > scheduled_end` | Re-invoke scheduler, prioritize remaining tasks |
| **Energy Deviation** | `\|actual − predicted\| > 2σ` (z-score) | Reorder tasks by ascending/descending difficulty |
| **Stress Spike** | `burnout_prob > 0.8` | Insert recovery breaks, defer non-critical tasks |

Priority protection ensures tasks with priority ≥ 4 are never deferred unless burnout exceeds critical threshold (0.8).

---

## 🎮 Reinforcement Learning Approach

The scheduling problem is formulated as a **Markov Decision Process**:

```
State:  s = (energy, burnout, time_left, tasks_left, avg_difficulty, cognitive_load)
Action: a = select_task(i) ∈ {0, ..., N-1} ∪ {break}
Reward: R = α·completion + β·alignment + γ·priority − δ·burnout − ε·overload
```

**Why DQN over simpler methods?**
- The state space is continuous and multi-dimensional
- Action selection depends on _combinations_ of state features (e.g., high difficulty + low energy = bad)
- The agent must learn long-horizon strategies (scheduling decisions affect end-of-day outcomes)
- Experience replay enables sample-efficient learning from limited behavioral data

**Training**: Episodes use synthetic task/energy data to bootstrap the agent. Once deployed, real user interaction provides on-policy reward signals through the feedback endpoint.

---

## 🔍 Explainability

AURORA is designed with **interpretability-first** ML:

| Module | Explainability Method |
|--------|----------------------|
| Energy Model | Per-hour bias analysis, predicted vs actual comparison charts |
| Burnout Classifier | SHAP TreeExplainer — shows exactly which factor (sleep, stress, etc.) drives each prediction |
| RL Scheduler | Reward component breakdown — users can see why each task was placed at its slot |
| Identity Engine | Cosine similarity scores with alignment interpretation categories |

Every prediction includes the model type used (`lstm`/`heuristic`, `xgboost`/`rule_based`, `rl_dqn`/`greedy`) so users always know the basis of the system's recommendations.

---

## ⚙ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Recharts | Analytical dark-mode dashboard UI |
| **Backend** | FastAPI, Pydantic, SQLAlchemy (async) | Modular REST API with validation |
| **Database** | PostgreSQL 16 | 8 normalized tables with indexes |
| **ML - Forecasting** | PyTorch (LSTM) | Time-series energy prediction |
| **ML - Classification** | XGBoost, SHAP | Burnout risk with explainability |
| **ML - RL** | PyTorch (DQN) | Schedule optimization agent |
| **ML - NLP** | Sentence Transformers | Identity-task semantic alignment |
| **Infrastructure** | Docker, Docker Compose | Container orchestration |
| **Logging** | Structured JSON logging | Production observability |

---

## 📡 API Documentation

AURORA exposes 20+ REST endpoints across 7 modules. Full interactive documentation is available at `/docs` (Swagger) and `/redoc` when the backend is running.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/energy/forecast/{user_id}` | 24-hour energy predictions |
| `POST` | `/api/energy/log` | Record actual energy reading |
| `GET` | `/api/burnout/risk/{user_id}` | Burnout probability + SHAP importance |
| `GET` | `/api/burnout/trend/{user_id}` | 30-day burnout trend |
| `POST` | `/api/scheduler/optimize/{user_id}` | RL-optimized schedule generation |
| `POST` | `/api/scheduler/feedback` | Reward signal submission |
| `POST` | `/api/identity/align` | Compute task-identity alignment |
| `GET` | `/api/identity/scores/{user_id}` | All task alignment scores |
| `POST` | `/api/tasks/` | Create task |
| `PATCH` | `/api/tasks/{task_id}/status` | Update task status |
| `POST` | `/api/replan/trigger` | Trigger schedule replanning |
| `GET` | `/api/analytics/dashboard/{user_id}` | Full dashboard metrics |
| `GET` | `/api/health` | Service health check |

---

## 🚀 Installation

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 16+ (or Docker)

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/yourusername/aurora.git
cd aurora

# Copy environment configuration
cp .env.example .env

# Start all services
docker-compose up --build

# Access:
#   Frontend:  http://localhost:3000
#   Backend:   http://localhost:8000
#   API Docs:  http://localhost:8000/docs
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
cp .env.example .env         # Edit DATABASE_URL

# Start the server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

**Database:**
```bash
# Create PostgreSQL database
createdb aurora_db

# Tables are auto-created on first backend startup

# Seed demo data
cd backend
python scripts/seed_data.py
```

**Train ML Models (Optional):**
```bash
cd backend
python scripts/train_all.py
```

---

## 📅 Development Roadmap

| Week | Focus | Deliverables |
|------|-------|-------------|
| **1** | Scaffolding & Database | Project init, Docker, DB schema, seed data, health endpoint |
| **2** | Energy Model + API | LSTM architecture, training pipeline, energy endpoints, heuristic fallback |
| **3** | Burnout Model + API | XGBoost classifier, SHAP integration, burnout endpoints, rule-based fallback |
| **4** | RL Scheduler | Gym environment, DQN agent, reward function, training loop, scheduler endpoints |
| **5** | Identity Engine + Replanning | Sentence-transformer embeddings, alignment scoring, replan triggers, task CRUD |
| **6** | Frontend — Core UI | Layout, dashboard, all pages with Recharts data visualizations |
| **7** | Frontend — Charts & Polish | Interactive charts, animations, responsive design, loading states |
| **8** | Integration, Docker, Docs | End-to-end API integration, Docker polish, README, final QA |

---

## 📊 Evaluation Metrics

| Model | Metrics | Target |
|-------|---------|--------|
| **Energy LSTM** | MAE, RMSE, R², directional accuracy, per-hour bias | MAE < 1.0, R² > 0.7 |
| **Burnout Classifier** | AUC-ROC, F1, Precision, Recall, Brier score | AUC > 0.85, F1 > 0.8 |
| **RL Scheduler** | Avg episode reward, completion rate, burnout avoidance %, schedule stability | Completion > 80% |
| **Identity Engine** | Pearson correlation, Spearman rank correlation, alignment MAE | Pearson > 0.7 |

---

## 🌟 Why This Project Is Unique

1. **Not a todo app with AI stickers** — AURORA uses real LSTM, XGBoost, DQN, and sentence-transformer architectures, not wrapper APIs
2. **Reinforcement learning for scheduling** — Tasks aren't just sorted by priority; the agent _learns_ optimal ordering strategies through trial and reward
3. **Explainable burnout prediction** — SHAP values provide transparent, per-prediction explanations of why burnout risk changes
4. **Identity alignment via NLP** — Semantic embeddings ensure daily tasks align with who the user _wants to become_
5. **Adaptive replanning** — The system reacts to real-time deviations (missed tasks, energy drops, stress spikes) automatically
6. **Cold-start ready** — Every ML module has a heuristic fallback that works immediately; models improve as data accumulates
7. **Production-grade engineering** — Async database, structured logging, Docker deployment, separated training/inference, and comprehensive test coverage

---

## 🔮 Future Scope

- **Wearable integration** — Apple Watch / Fitbit heart rate and HRV for real-time stress detection
- **Multi-day planning** — Extend RL agent to optimize weekly schedules
- **Collaborative scheduling** — Team-level energy and workload balancing
- **Attention-based models** — Replace LSTM with Temporal Fusion Transformer for energy forecasting
- **PPO agent** — Upgrade from DQN to Proximal Policy Optimization for more stable learning
- **Federated learning** — Train models across users while preserving privacy
- **Mobile app** — React Native companion for energy logging and schedule viewing
- **Natural language task creation** — LLM-powered task parsing from free-text input

---

## 📝 Resume-Ready Summary

> **AURORA** is a full-stack AI behavioral intelligence platform that optimizes daily human performance through machine learning. The system combines an **LSTM-based energy forecasting engine** (PyTorch), an **XGBoost burnout classifier with SHAP explainability**, a **Deep Q-Network reinforcement learning scheduler** that learns optimal task ordering through multi-component reward signals (completion, identity alignment, burnout avoidance), and an **NLP-powered identity alignment engine** using sentence-transformer embeddings. Built with a production-grade architecture — **FastAPI** microservices, **PostgreSQL** (8-table normalized schema), **Next.js** analytical dashboard, and **Docker** orchestration — AURORA demonstrates end-to-end ML system design: from feature engineering and model training pipelines to real-time inference APIs with heuristic fallbacks, automated replanning triggers, and comprehensive evaluation frameworks. The project showcases expertise in time-series modeling, gradient-boosted classification, reinforcement learning environment design, NLP embeddings, async API development, and modern frontend data visualization.

---

<p align="center">
  <sub>Designed and engineered as a flagship AI system.</sub><br>
  <sub>AURORA — Because execution should be adaptive, not arbitrary.</sub>
</p>
