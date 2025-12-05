FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

ENV PORT=8080
CMD ["functions-framework", "--target", "app", "--source", "app.py", "--port", "8080"]