#!/usr/bin/env bash
# Runs every time you open the Codespace (postAttachCommand).
# Short checklist of what is ready.

ok()   { printf '  [ok]      %s\n' "$1"; }
miss() { printf '  [missing] %s\n' "$1"; }

echo "Slotwise Codespace status"

[ -d node_modules ] && ok "packages installed" || miss "packages (run: npm ci)"
[ -d .wrangler/state ] && ok "local database" || miss "local database (run: npx wrangler d1 migrations apply slotwise --local)"

if command -v claude >/dev/null 2>&1; then ok "Claude Code"; else miss "Claude Code (comes from your dotfiles repo)"; fi
[ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ] && ok "Claude login secret" || miss "Claude login secret (CLAUDE_CODE_OAUTH_TOKEN)"
[ -f "$HOME/.wakatime.cfg" ] && ok "Hackatime config" || miss "Hackatime config (HACKATIME_API_KEY secret)"

echo
echo "Next: npm run dev"
