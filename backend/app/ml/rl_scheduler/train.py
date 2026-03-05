"""
AURORA RL Scheduler — Training Loop
Episodic training of the DQN agent on synthetic and historical schedules.
"""

import numpy as np
import logging
from typing import Dict, List, Optional

from app.ml.rl_scheduler.environment import TaskSchedulingEnv
from app.ml.rl_scheduler.agent import DQNAgent
from app.utils.metrics import calculate_rl_metrics

logger = logging.getLogger("aurora.rl.train")


class RLTrainer:
    """
    Training pipeline for the RL scheduling agent.

    Implements:
    - Episodic training with synthetic tasks
    - Target network updates
    - Training metrics tracking
    - Checkpoint saving
    """

    def __init__(
        self,
        agent: Optional[DQNAgent] = None,
        target_update_freq: int = 10,
    ):
        self.agent = agent or DQNAgent()
        self.env = TaskSchedulingEnv()
        self.target_update_freq = target_update_freq

    def generate_synthetic_tasks(self, num_tasks: int = 8) -> List[Dict]:
        """Generate a random set of tasks for training episodes."""
        categories = ["coding", "writing", "meetings", "planning", "research", "review"]

        tasks = []
        for i in range(num_tasks):
            tasks.append({
                "id": f"task_{i}",
                "title": f"Task {i}",
                "difficulty": float(np.random.uniform(1, 10)),
                "estimated_minutes": int(np.random.choice([30, 60, 90, 120])),
                "priority": int(np.random.randint(1, 6)),
                "category": np.random.choice(categories),
                "identity_alignment": float(np.random.uniform(0.2, 1.0)),
                "status": "pending",
            })

        return tasks

    def generate_synthetic_energy(self) -> List[float]:
        """Generate a realistic energy forecast with noise."""
        base = [
            3.0, 2.5, 2.0, 1.5, 1.0, 1.5,
            3.0, 5.0, 7.0, 8.0, 8.5, 8.0,
            7.0, 6.0, 5.5, 6.5, 7.0, 7.5,
            7.0, 6.5, 6.0, 5.0, 4.0, 3.5,
        ]
        noise = np.random.normal(0, 0.5, 24)
        return [float(np.clip(b + n, 0, 10)) for b, n in zip(base, noise)]

    def train(
        self,
        num_episodes: int = 1000,
        save_path: str = "models/rl_agent.pt",
        log_interval: int = 100,
    ) -> Dict[str, list]:
        """
        Train the DQN agent over multiple episodes.

        Each episode:
        1. Generate random tasks and energy forecast
        2. Run the scheduling environment
        3. Store transitions and train
        4. Periodically update target network

        Returns:
            Training history with rewards and metrics
        """
        history = {
            "episode_rewards": [],
            "episode_lengths": [],
            "completion_rates": [],
            "epsilon_values": [],
            "losses": [],
        }

        logger.info(f"Starting RL training: {num_episodes} episodes")

        for episode in range(num_episodes):
            tasks = self.generate_synthetic_tasks(
                num_tasks=np.random.randint(4, 12)
            )
            energy = self.generate_synthetic_energy()
            burnout = float(np.random.uniform(0.1, 0.7))

            state = self.env.reset(tasks, energy, burnout)
            episode_reward = 0.0
            episode_steps = 0

            while not self.env.done:
                valid_actions = self.env.get_valid_actions()
                action = self.agent.select_action(state, valid_actions, training=True)

                next_state, reward, done, info = self.env.step(action)

                self.agent.store_transition(state, action, reward, next_state, done)
                loss = self.agent.train_step()

                if loss is not None:
                    history["losses"].append(loss)

                state = next_state
                episode_reward += reward
                episode_steps += 1

            # Track metrics
            history["episode_rewards"].append(episode_reward)
            history["episode_lengths"].append(episode_steps)
            history["epsilon_values"].append(self.agent.epsilon)

            completion_rate = len(self.env.scheduled_tasks) / max(len(tasks), 1)
            history["completion_rates"].append(completion_rate)

            # Update target network
            if episode % self.target_update_freq == 0:
                self.agent.update_target_network()

            # Logging
            if episode % log_interval == 0:
                avg_reward = np.mean(history["episode_rewards"][-log_interval:])
                avg_completion = np.mean(history["completion_rates"][-log_interval:])
                logger.info(
                    f"Episode {episode}/{num_episodes} | "
                    f"Avg Reward: {avg_reward:.2f} | "
                    f"Completion: {avg_completion:.1%} | "
                    f"Epsilon: {self.agent.epsilon:.3f}"
                )

        # Save trained agent
        self.agent.save(save_path)
        self.agent.training_rewards = history["episode_rewards"]

        logger.info("RL training complete")
        return history

    def evaluate(self, num_episodes: int = 100) -> Dict[str, float]:
        """Evaluate the trained agent without exploration."""
        rewards, completions, burnouts = [], [], []

        for _ in range(num_episodes):
            tasks = self.generate_synthetic_tasks()
            energy = self.generate_synthetic_energy()
            burnout = float(np.random.uniform(0.1, 0.7))

            state = self.env.reset(tasks, energy, burnout)
            ep_reward = 0.0

            while not self.env.done:
                valid_actions = self.env.get_valid_actions()
                action = self.agent.select_action(state, valid_actions, training=False)
                state, reward, done, _ = self.env.step(action)
                ep_reward += reward

            rewards.append(ep_reward)
            completions.append(len(self.env.scheduled_tasks) / max(len(tasks), 1))
            burnouts.append(self.env.burnout_prob)

        metrics = calculate_rl_metrics(rewards, completions, burnouts)
        logger.info(f"RL evaluation: {metrics}")
        return metrics
