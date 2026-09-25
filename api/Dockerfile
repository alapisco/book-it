# Build context: repository root (the API reads ../fixtures).
FROM python:3.12-slim
WORKDIR /srv/api
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY api/ .
COPY fixtures/ /srv/fixtures/
ENV BOOKIT_FIXTURES_DIR=/srv/fixtures
EXPOSE 8000
CMD ["uvicorn", "bookit.main:app", "--host", "0.0.0.0", "--port", "8000"]
