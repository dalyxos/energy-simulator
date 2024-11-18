FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt requirements.txt

RUN python -m venv .venv && .venv/bin/pip install -r requirements.txt

COPY . .

EXPOSE 5000
CMD [".venv/bin/flask", "run"]