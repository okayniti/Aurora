"""
AURORA Identity Alignment Engine — Embedding Module
Generates semantic embeddings from identity and task descriptions.

Uses sentence-transformers for high-quality text embeddings.
"""

import numpy as np
import logging
from typing import Optional, List
import pickle

logger = logging.getLogger("aurora.identity.embeddings")


class EmbeddingService:
    """
    Text embedding service using sentence-transformers.

    Converts identity descriptions and task descriptions into
    384-dimensional semantic vectors for alignment computation.
    """

    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self.is_loaded = False

    def load_model(self):
        """Lazy-load the sentence-transformer model."""
        if self.is_loaded:
            return

        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name)
            self.is_loaded = True
            logger.info(f"Embedding model loaded: {self.model_name}")
        except ImportError:
            logger.warning(
                "sentence-transformers not installed. "
                "Using TF-IDF fallback for embeddings."
            )
            self._init_tfidf_fallback()
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            self._init_tfidf_fallback()

    def _init_tfidf_fallback(self):
        """Initialize a simple TF-IDF-based embedding fallback."""
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            self.tfidf = TfidfVectorizer(max_features=384)
            self.is_loaded = True
            self.model = None  # Mark as fallback mode
            logger.info("Using TF-IDF fallback for embeddings")
        except ImportError:
            logger.error("Neither sentence-transformers nor sklearn available.")

    def encode(self, text: str) -> np.ndarray:
        """
        Encode a text string into a dense embedding vector.

        Args:
            text: Input text (identity description or task description)

        Returns:
            np.ndarray of shape (384,) — the embedding vector
        """
        if not self.is_loaded:
            self.load_model()

        if self.model is not None:
            # sentence-transformers encoding
            embedding = self.model.encode(text, show_progress_bar=False)
            return np.array(embedding, dtype=np.float32)
        else:
            # TF-IDF fallback (lower quality but functional)
            return self._tfidf_encode(text)

    def encode_batch(self, texts: List[str]) -> np.ndarray:
        """
        Encode a batch of texts.

        Args:
            texts: List of text strings

        Returns:
            np.ndarray of shape (n, 384)
        """
        if not self.is_loaded:
            self.load_model()

        if self.model is not None:
            embeddings = self.model.encode(texts, show_progress_bar=False, batch_size=32)
            return np.array(embeddings, dtype=np.float32)
        else:
            return np.stack([self._tfidf_encode(t) for t in texts])

    def _tfidf_encode(self, text: str) -> np.ndarray:
        """Fallback TF-IDF encoding."""
        try:
            if not hasattr(self.tfidf, 'vocabulary_'):
                # Fit on the input text as a minimal corpus
                self.tfidf.fit([text, "placeholder document for vocabulary"])
            vector = self.tfidf.transform([text]).toarray()[0]

            # Pad or truncate to 384 dimensions
            if len(vector) < 384:
                vector = np.pad(vector, (0, 384 - len(vector)))
            else:
                vector = vector[:384]

            # L2 normalize
            norm = np.linalg.norm(vector)
            if norm > 0:
                vector = vector / norm

            return vector.astype(np.float32)
        except Exception as e:
            logger.error(f"TF-IDF fallback failed: {e}")
            return np.zeros(384, dtype=np.float32)

    def serialize_embedding(self, embedding: np.ndarray) -> bytes:
        """Serialize embedding for database storage."""
        return pickle.dumps(embedding)

    def deserialize_embedding(self, data: bytes) -> np.ndarray:
        """Deserialize embedding from database storage."""
        return pickle.loads(data)
