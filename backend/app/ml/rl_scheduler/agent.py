"""
AURORA RL Scheduler — DQN Agent
Deep Q-Network agent for task scheduling optimization.

Implements:
- Multi-layer DQN with experience replay
- Epsilon-greedy exploration with decay
- Target network for stable training
- Action masking for valid actions only
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
import logging
from collections import deque
from typing import Dict, List, Optional, Tuple

from app.ml.rl_scheduler.environment import TaskSchedulingEnv
from app.config import settings

logger = logging.getLogger("aurora.rl.agent")


class ReplayMemory:
    """Experience replay buffer for DQN training."""

    def __init__(self, capacity: int = 10000):
        self.memory = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        """Store a transition."""
        self.memory.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int) -> List:
        """Sample a random batch of transitions."""
        return random.sample(self.memory, batch_size)

    def __len__(self) -> int:
        return len(self.memory)


class DQNetwork(nn.Module):
    """
    Deep Q-Network for action-value estimation.

    Architecture:
        State (6D) → FC(128) → ReLU → FC(128) → ReLU → FC(64) → ReLU → Q-values (21)
    """

    def __init__(self, state_dim: int = 6, action_dim: int = 21):
        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim),
        )

    def forward(self, state: torch.Tensor) -> torch.Tensor:
        """Compute Q-values for all actions given a state."""
        return self.network(state)


class DQNAgent:
    """
    DQN Agent for task scheduling.

    Implements:
    - Epsilon-greedy with exponential decay
    - Double DQN (target network)
    - Experience replay
    - Action masking for valid task selections
    """

    def __init__(
        self,
        state_dim: int = TaskSchedulingEnv.STATE_DIM,
        action_dim: int = TaskSchedulingEnv.MAX_TASKS + 1,
        learning_rate: float = None,
        gamma: float = None,
        epsilon_start: float = None,
        epsilon_end: float = None,
        epsilon_decay: int = None,
        batch_size: int = None,
        memory_size: int = None,
        device: str = "cpu",
    ):
        self.device = torch.device(device)
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma or settings.RL_GAMMA
        self.batch_size = batch_size or settings.RL_BATCH_SIZE
        self.epsilon = epsilon_start or settings.RL_EPSILON_START
        self.epsilon_end = epsilon_end or settings.RL_EPSILON_END
        self.epsilon_decay = epsilon_decay or settings.RL_EPSILON_DECAY

        # Networks
        self.policy_net = DQNetwork(state_dim, action_dim).to(self.device)
        self.target_net = DQNetwork(state_dim, action_dim).to(self.device)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()

        # Optimizer
        lr = learning_rate or settings.RL_LEARNING_RATE
        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=lr)

        # Replay memory
        mem_size = memory_size or settings.RL_MEMORY_SIZE
        self.memory = ReplayMemory(mem_size)

        self.steps_done = 0
        self.training_rewards: List[float] = []

    def select_action(
        self,
        state: np.ndarray,
        valid_actions: Optional[List[int]] = None,
        training: bool = True,
    ) -> int:
        """
        Select action using epsilon-greedy policy with action masking.

        Args:
            state: Current state vector
            valid_actions: List of valid action indices
            training: If True, use epsilon-greedy; if False, always exploit

        Returns:
            Selected action index
        """
        if valid_actions is None:
            valid_actions = list(range(self.action_dim))

        # Epsilon-greedy exploration
        if training:
            self.epsilon = self.epsilon_end + (1.0 - self.epsilon_end) * \
                np.exp(-self.steps_done / self.epsilon_decay)
            self.steps_done += 1

            if random.random() < self.epsilon:
                return random.choice(valid_actions)

        # Exploitation: select best valid action
        state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
        self.policy_net.eval()
        with torch.no_grad():
            q_values = self.policy_net(state_tensor).squeeze()

        # Mask invalid actions with very negative value
        masked_q = torch.full_like(q_values, -1e9)
        for a in valid_actions:
            if a < len(q_values):
                masked_q[a] = q_values[a]

        return int(masked_q.argmax().item())

    def store_transition(self, state, action, reward, next_state, done):
        """Store transition in replay memory."""
        self.memory.push(state, action, reward, next_state, done)

    def train_step(self) -> Optional[float]:
        """
        Perform one training step using experience replay.

        Returns:
            Loss value if training occurred, None if not enough samples
        """
        if len(self.memory) < self.batch_size:
            return None

        # Sample batch
        transitions = self.memory.sample(self.batch_size)
        states, actions, rewards, next_states, dones = zip(*transitions)

        state_batch = torch.FloatTensor(np.array(states)).to(self.device)
        action_batch = torch.LongTensor(actions).to(self.device)
        reward_batch = torch.FloatTensor(rewards).to(self.device)
        next_state_batch = torch.FloatTensor(np.array(next_states)).to(self.device)
        done_batch = torch.FloatTensor(dones).to(self.device)

        # Current Q-values
        self.policy_net.train()
        current_q = self.policy_net(state_batch).gather(1, action_batch.unsqueeze(1)).squeeze()

        # Target Q-values (Double DQN: use policy net to select, target net to evaluate)
        with torch.no_grad():
            next_actions = self.policy_net(next_state_batch).argmax(1)
            next_q = self.target_net(next_state_batch).gather(1, next_actions.unsqueeze(1)).squeeze()
            target_q = reward_batch + self.gamma * next_q * (1 - done_batch)

        # Loss and optimization
        loss = nn.SmoothL1Loss()(current_q, target_q)
        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.policy_net.parameters(), max_norm=1.0)
        self.optimizer.step()

        return loss.item()

    def update_target_network(self):
        """Copy policy network weights to target network."""
        self.target_net.load_state_dict(self.policy_net.state_dict())

    def save(self, path: str):
        """Save agent checkpoint."""
        from pathlib import Path as PathLib
        PathLib(path).parent.mkdir(parents=True, exist_ok=True)
        torch.save({
            "policy_net": self.policy_net.state_dict(),
            "target_net": self.target_net.state_dict(),
            "optimizer": self.optimizer.state_dict(),
            "steps_done": self.steps_done,
            "epsilon": self.epsilon,
            "training_rewards": self.training_rewards,
        }, path)
        logger.info(f"RL agent saved to {path}")

    def load(self, path: str) -> bool:
        """Load agent from checkpoint."""
        try:
            checkpoint = torch.load(path, map_location=self.device)
            self.policy_net.load_state_dict(checkpoint["policy_net"])
            self.target_net.load_state_dict(checkpoint["target_net"])
            self.optimizer.load_state_dict(checkpoint["optimizer"])
            self.steps_done = checkpoint.get("steps_done", 0)
            self.epsilon = checkpoint.get("epsilon", self.epsilon_end)
            self.training_rewards = checkpoint.get("training_rewards", [])
            logger.info(f"RL agent loaded from {path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load RL agent: {e}")
            return False


class GreedyScheduler:
    """
    Fallback greedy scheduler.
    Schedules tasks by priority × energy-difficulty matching.
    Used when RL agent is untrained.
    """

    def schedule(
        self,
        tasks: List[Dict],
        energy_forecast: List[float],
        start_hour: int = 8,
        end_hour: int = 22,
    ) -> List[Dict]:
        """
        Generate a greedy schedule.

        Strategy: Sort by priority (desc), then match high-difficulty tasks
        to high-energy time slots.
        """
        if not tasks:
            return []

        # Sort tasks by priority (descending)
        sorted_tasks = sorted(tasks, key=lambda t: t.get("priority", 3), reverse=True)

        schedule = []
        current_hour = start_hour

        for task in sorted_tasks:
            if current_hour >= end_hour:
                break

            difficulty = task.get("difficulty", 5.0)
            est_hours = max(1, (task.get("estimated_minutes", 60) + 30) // 60)

            # Find best energy slot for this task
            best_hour = current_hour
            best_energy = energy_forecast[current_hour] if current_hour < 24 else 5.0

            for h in range(current_hour, min(end_hour, 24)):
                if energy_forecast[h] > best_energy and difficulty > 5:
                    best_energy = energy_forecast[h]
                    best_hour = h

            schedule.append({
                "task_id": task.get("id"),
                "task_title": task.get("title", "Untitled"),
                "time_slot_start_hour": current_hour,
                "time_slot_end_hour": min(current_hour + est_hours, end_hour),
                "confidence": 0.5,
            })

            current_hour += est_hours

        return schedule
