FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

ENV PORT=8080
# Increase timeout to 600 seconds (10 minutes) to handle long-running AI tasks
# Increase workers to handle concurrent requests
CMD ["gunicorn", "-b", "0.0.0.0:8080", "--timeout", "600", "--workers", "2", "--threads", "4", "--worker-class", "sync", "app:app"]