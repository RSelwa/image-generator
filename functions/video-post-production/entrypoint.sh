#!/bin/bash
set -e

echo "Starting bgutil PO token server..."
cd /opt/bgutil/server
deno run --allow-env --allow-net --allow-ffi=. --allow-read=. src/main.ts &
BGUTIL_PID=$!
cd /app

sleep 5

if ! kill -0 $BGUTIL_PID 2>/dev/null; then
  echo "ERROR: bgutil PO token server failed to start"
  exit 1
fi

echo "PO token server running on port 4416"

python main.py
EXIT_CODE=$?

kill $BGUTIL_PID 2>/dev/null || true
exit $EXIT_CODE
