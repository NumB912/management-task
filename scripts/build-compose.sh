#!/usr/bin/env bash
set -euo pipefail

# Keep two attempts within the workflow's 30 minute SSH timeout.
build_log=$(mktemp)
trap 'rm -f "$build_log"' EXIT

for attempt in 1 2; do
  echo "Docker build attempt ${attempt}/2 (maximum 12 minutes)"
  if timeout --kill-after=30s 12m \
    docker compose --parallel 2 "$@" build --pull 2>&1 | tee "$build_log"; then
    exit 0
  else
    status=$?
  fi

  if [ "$status" -eq 124 ] || [ "$status" -eq 137 ]; then
    echo "::error::Docker build exceeded 12 minutes. Check VPS connectivity to Docker Hub and Docker daemon logs."
    exit "$status"
  fi

  if [ "$attempt" -eq 2 ] || ! grep -Eiq \
    'TLS handshake timeout|i/o timeout|temporary failure in name resolution|no such host|connection reset by peer|network is unreachable' "$build_log"; then
    exit "$status"
  fi

  echo "Transient network failure while building; retrying in 10 seconds."
  sleep 10
done
