# ─── Build stage ───
FROM python:3.12-slim AS builder


WORKDIR /app


RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt


# ─── Runtime stage ───
FROM python:3.12-slim


RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl && rm -rf /var/lib/apt/lists/*


# Non-root user (security)
RUN useradd -m -u 1000 appuser
WORKDIR /app


COPY --from=builder /root/.local /home/appuser/.local
COPY --chown=appuser:appuser backend/ ./backend/
COPY --chown=appuser:appuser alembic/ ./alembic/
COPY --chown=appuser:appuser alembic.ini ./


USER appuser
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1


EXPOSE 8000


HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
  CMD curl -f http://localhost:8000/health || exit 1


# Chạy migration TRƯỚC khi start app
CMD sh -c "alembic upgrade head && uvicorn backend.main:app --host 0.0.0.0 --port 8000"