#!/usr/bin/env bash
# Run development server (bash)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
