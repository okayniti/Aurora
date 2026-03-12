<div align="center">
  <img src="https://img.shields.io/badge/AURORA-Behavioral%20AI-5c7cfa?style=for-the-badge&logo=brain&logoColor=white" alt="AURORA Badge"/>

  # 🌌 AURORA 
  **Adaptive User-aware Resource Orchestration & Realtime Analytics**

  *An AI-powered behavioral intelligence platform that predicts energy, prevents burnout, and optimally schedules your life.*

  <img src="https://img.shields.io/badge/Python-3.13-blue?logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/PyTorch-2.0+-ee4c2c?logo=pytorch&logoColor=white" alt="PyTorch"/>
</div>

---

## 🚀 The Vision
AURORA is an intelligent cognitive companion. Think of it as **Spotify Wrapped for your productivity** — but running in real-time, backed by machine learning, and actively preventing you from burning out.

It learns your behavior to:
1. **Predict** your energy peaks via PyTorch LSTMs.
2. **Protect** your mental health using XGBoost burnout detection & SHAP explainability.
3. **Schedule** your tasks at the optimal times using a Deep Q-Network Reinforcement Learning agent.
4. **Align** your time with your core identity using Sentence Transformers.

---

## ✨ Features UI

- **Modern Glassmorphic Dashboard**: A stunning, animated Bento-grid interface providing an instant cognitive summary.
- **Daily Calibration**: Log your sleep, exercise, and caffeine daily to continuously train your personal AI models.
- **Burnout Mitigation Engine**: Tracks your behavioral trends over 30 days and dynamically alerts you to rest.

---

## 🧠 The AI Stack

AURORA relies on 4 distinct machine learning models:

| Model | Architecture | Purpose |
|-------|-------------|---------|
| **Energy Forecast** | PyTorch LSTM | Analyzes past 168hrs to predict your next 24hrs of cognitive energy. |
| **Burnout Risk** | XGBoost + SHAP | Calculates burnout probability and explains *why* you are at risk. |
| **Task Scheduler** | Double DQN (RL) | Learns your scheduling success to slot tasks exactly when you have the energy to do them. |
| **Identity Alignment** | Sentence Transformers | Analyzes task descriptions to ensure they align with your core values. |

---

## 💻 Tech Architecture 

- **Frontend:** Next.js 14, React 18, Tailwind CSS, Recharts
- **Backend:** FastAPI, Python 3.11+, SQLAlchemy (Async), Uvicorn
- **Database:** SQLite (Dev) / PostgreSQL (Prod)

---

## ⚡ Quick Start

Get your personal instance running locally in under 2 minutes.

**1. Clone & Setup Backend**
```bash
git clone https://github.com/okayniti/Aurora.git
cd Aurora/backend
python -m venv venv
source venv/Scripts/activate # Windows
pip install -r requirements.txt
```

**2. Train Local ML Models & Start Server**
```bash
python scripts/seed_data.py
python scripts/train_all.py # Trains your personal models (~3 min)
uvicorn app.main:app --reload --port 8000
```

**3. Run the Frontend**
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** to enter the Cognitive Dashboard.

---
*Built with 💻 by Niti.*
