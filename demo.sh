#!/usr/bin/env bash
# One-command startup for the Week 6 demo: boots the backend (real DB)
# and the frontend dev server, waits for both to be reachable, then
# leaves them running until you press Ctrl+C.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PORT=5000
FRONTEND_PORT=3000

check_port_free() {
  local port=$1
  if lsof -iTCP:"$port" -sTCP:LISTEN -P >/dev/null 2>&1; then
    echo "Port $port is already in use. Stop whatever is running there and re-run this script." >&2
    exit 1
  fi
}

check_port_free "$BACKEND_PORT"
check_port_free "$FRONTEND_PORT"

BACKEND_PID=""
FRONTEND_PID=""

# npm/nodemon/react-scripts fork grandchildren that outlive a plain `kill`
# on the subshell PID captured by $!, so walk the process tree recursively.
kill_tree() {
  local pid=$1
  for child in $(pgrep -P "$pid" 2>/dev/null); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

CLEANED_UP=""
cleanup() {
  [ -n "$CLEANED_UP" ] && return
  CLEANED_UP=1
  echo
  echo "Shutting down..."
  [ -n "$BACKEND_PID" ] && kill_tree "$BACKEND_PID"
  [ -n "$FRONTEND_PID" ] && kill_tree "$FRONTEND_PID"
  # Safety net in case anything got reparented before we could walk to it.
  pkill -f "nodemon server.js" 2>/dev/null || true
  pkill -f "react-scripts start" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting backend on :$BACKEND_PORT ..."
(cd "$BACKEND_DIR" && npm run dev) &
BACKEND_PID=$!

for i in $(seq 1 30); do
  if curl -s -m 1 "http://localhost:$BACKEND_PORT/api/properties?limit=1" -o /dev/null; then
    echo "Backend is up."
    break
  fi
  sleep 1
  if [ "$i" -eq 30 ]; then
    echo "Backend did not come up in time. Check backend/.env (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME)." >&2
    exit 1
  fi
done

echo "Starting frontend on :$FRONTEND_PORT ..."
(cd "$FRONTEND_DIR" && npm start) &
FRONTEND_PID=$!

echo
echo "Backend:  http://localhost:$BACKEND_PORT/api/properties"
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Press Ctrl+C to stop both."
wait
