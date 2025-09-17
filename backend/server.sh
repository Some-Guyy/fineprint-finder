#!/bin/bash
uvicorn main:app --app-dir backend --host 0.0.0.0 --port 9000 --reload
