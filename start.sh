#!/bin/bash
echo "Starting Last-Mile Sprint..."

# Start FastAPI backend on port 8000
uvicorn backend.server:app --reload --port 8000 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID  →  http://localhost:8000"

# Start Vite frontend on port 5173
cd frontend && npm install && npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID  →  http://localhost:5173"

echo ""
echo "Both servers running. Press Ctrl+C to stop."

# Wait and forward signals
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
