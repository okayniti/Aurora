FROM python:3.11-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies — torch first, pinned to the CPU-only wheel. The default
# PyPI wheel bundles CUDA libraries this container will never use (there's no
# GPU on Render), inflating install size and resident memory for no benefit.
# Installing it before requirements.txt satisfies the >= constraint there
# without pip re-resolving it against the default (CUDA) index.
COPY requirements.txt .
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Application code
COPY . .

# Create models directory
RUN mkdir -p models

# Expose port
EXPOSE 8000

# Render (and most PaaS hosts) inject the port to bind via $PORT at runtime —
# exec-form CMD can't expand env vars, so this needs the shell form.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
