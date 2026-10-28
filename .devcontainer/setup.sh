#!/usr/bin/env bash
# Runs once when the Codespace is created or rebuilt (postCreateCommand).
# Prints every step and the exact command, then that command's full output,
# so the creation log shows what is happening.

set -euo pipefail
cd "$(dirname "$0")/.."

start=$(date +%s)

step() { printf '\n==> [%s/2] %s\n' "$1" "$2"; }
run()  { printf '$ %s\n' "$*"; "$@"; }

echo "Slotwise setup starting (Node $(node --version), npm $(npm --version))"

step 1 "Installing packages from package-lock.json. First run can take a few minutes."
# --foreground-scripts shows the output of package install scripts
# (like workerd downloading Cloudflare's local runtime) instead of hiding it.
run npm ci --foreground-scripts --no-audit --no-fund

step 2 "Applying database migrations to the local D1 database"
# CI=true makes wrangler skip its "continue? (Y/n)" question.
run env CI=true npx wrangler d1 migrations apply slotwise --local

echo
echo "Slotwise setup finished in $(( $(date +%s) - start ))s."
echo "Start the app with: npm run dev   (then open port 5173 from the Ports tab)"
