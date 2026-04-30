#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/vertex-markets"

echo "[deploy] Entering ${APP_DIR}"
cd "${APP_DIR}"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[deploy] Refusing deploy: working tree is dirty on VPS."
  echo "[deploy] Commit/stash/remove server-side changes, then rerun."
  exit 1
fi

echo "[deploy] Pulling latest main"
git fetch origin main
git checkout main
git pull --ff-only origin main

echo "[deploy] Installing deps"
pnpm install --frozen-lockfile

echo "[deploy] Building apps"
pnpm --filter @vertex/main-api build
pnpm --filter @vertex/chart-api build
pnpm --filter @vertex/web build

echo "[deploy] Loading runtime env"
set -a
source .env
set +a

echo "[deploy] Restarting PM2 services"
pm2 restart vertex-main-api vertex-chart-api vertex-web --update-env
pm2 save

echo "[deploy] Done"
