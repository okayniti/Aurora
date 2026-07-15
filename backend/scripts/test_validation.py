"""
AURORA — Manual Validation Script
Verifies that validation bounds and fallback embeddings work correctly.
"""

import sys
import os
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pydantic import ValidationError
from app.database.schemas import EnergyLogCreate, BurnoutSnapshotCreate
from app.ml.identity_engine.embeddings import EmbeddingService
from app.ml.identity_engine.alignment import AlignmentScorer


def test_energy_log_bounds():
    print("\n--- Testing EnergyLogCreate Validation ---")
    user_id = uuid.uuid4()
    
    # Test valid boundary values
    for val in [0.0, 5.5, 10.0]:
        try:
            log = EnergyLogCreate(user_id=user_id, energy_level=val)
            print(f"[OK] Allowed valid energy level: {val}")
        except ValidationError as e:
            print(f"[FAIL] Failed to allow valid energy level: {val}. Error: {e}")

    # Test invalid values (should be rejected)
    for val in [-1.0, 10.1, 50.0]:
        try:
            log = EnergyLogCreate(user_id=user_id, energy_level=val)
            print(f"[FAIL] Allowed INVALID energy level (should have rejected): {val}")
        except ValidationError:
            print(f"[OK] Correctly rejected invalid energy level: {val}")


def test_burnout_snapshot_bounds():
    print("\n--- Testing BurnoutSnapshotCreate Validation ---")
    user_id = uuid.uuid4()
    
    # Test values > 1.0 (previously rejected, now allowed)
    try:
        snapshot = BurnoutSnapshotCreate(
            user_id=user_id,
            sleep_trend=7.5,
            energy_variance=3.2,
            cognitive_load=15.5
        )
        print("[OK] Correctly allowed sleep_trend=7.5, energy_variance=3.2, cognitive_load=15.5")
    except ValidationError as e:
        print(f"[FAIL] Erroneously rejected valid burnout features (> 1.0). Error: {e}")


def test_tfidf_fallback_similarities():
    print("\n--- Testing TF-IDF Fallback Embeddings Similarity ---")
    
    # Force fallback
    service = EmbeddingService()
    service._init_tfidf_fallback()
    
    identity = "I am a disciplined machine learning engineer who values deep work and code quality."
    task_aligned = "Write backend python code and deploy the model"
    task_unaligned = "Go to the grocery store and buy some milk"

    scorer = AlignmentScorer(service)
    
    res_aligned = scorer.compute_alignment(identity, task_aligned)
    res_unaligned = scorer.compute_alignment(identity, task_unaligned)
    
    print(f"Identity: \"{identity}\"")
    print(f"Aligned Task: \"{task_aligned}\"")
    print(f"  Similarity: {res_aligned['raw_similarity']:.4f} (Score: {res_aligned['alignment_score']}%)")
    print(f"Unaligned Task: \"{task_unaligned}\"")
    print(f"  Similarity: {res_unaligned['raw_similarity']:.4f} (Score: {res_unaligned['alignment_score']}%)")

    # The similarity should not be exactly 0.0 or 1.0, and aligned should have a higher score than unaligned
    assert 0.0 < res_aligned['raw_similarity'] < 1.0, "Similarity should be a fractional value"
    assert res_aligned['raw_similarity'] > res_unaligned['raw_similarity'], "Aligned task should have higher similarity than unaligned task"
    print("[OK] Fallback vectorizer similarity behavior verified!")


if __name__ == "__main__":
    test_energy_log_bounds()
    test_burnout_snapshot_bounds()
    test_tfidf_fallback_similarities()
    print("\nAll validation tests complete successfully!")
