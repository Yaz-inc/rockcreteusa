#!/usr/bin/env bash
# ==========================================================================
# Rockcrete USA Website Rebuild Blueprint, deploy script
# Pushes the dashboard from this local folder to a VPS via rsync over SSH.
# Idempotent · safe to run on every change · exits non-zero on failure.
# ==========================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Config, load from .env if present, otherwise use these defaults
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DASHBOARD_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source .env if present (the user creates this with their credentials)
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/.env"
fi

# Defaults, override in .env. Any value left as a placeholder ({{...}}) means
# you have not run ./init.sh or have not edited .env yet.
: "${DEPLOY_USER:=deploy}"
: "${DEPLOY_HOST:=}"
: "${DEPLOY_PATH:=/var/www/rockcreteusa-website-rebuild/}"
: "${DEPLOY_SSH_KEY:=}"           # path to private key, optional
: "${DEPLOY_SSH_PORT:=22}"
: "${SOURCE_FILE:=$DASHBOARD_DIR/index.html}"
: "${TARGET_FILENAME:=index.html}"
: "${URL:=https://rockcreteusa.projectizer.ai/}"

# ---------------------------------------------------------------------------
# Pretty output
# ---------------------------------------------------------------------------
GREEN="$(printf '\033[32m')"; RED="$(printf '\033[31m')"
YELLOW="$(printf '\033[33m')"; CYAN="$(printf '\033[36m')"
DIM="$(printf '\033[2m')"; BOLD="$(printf '\033[1m')"
RESET="$(printf '\033[0m')"

ok()    { printf "%s✓%s %s\n" "$GREEN" "$RESET" "$*"; }
warn()  { printf "%s⚠%s %s\n" "$YELLOW" "$RESET" "$*"; }
err()   { printf "%s✗%s %s\n" "$RED" "$RESET" "$*" >&2; }
info()  { printf "%s→%s %s\n" "$CYAN" "$RESET" "$*"; }
dim()   { printf "%s%s%s\n" "$DIM" "$*" "$RESET"; }

# ---------------------------------------------------------------------------
# Build SSH options
# ---------------------------------------------------------------------------
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 -p "$DEPLOY_SSH_PORT")
if [[ -n "$DEPLOY_SSH_KEY" ]]; then
  if [[ ! -f "$DEPLOY_SSH_KEY" ]]; then
    err "SSH key not found: $DEPLOY_SSH_KEY"
    exit 2
  fi
  SSH_OPTS+=(-i "$DEPLOY_SSH_KEY")
fi

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
printf "\n%s%s Rockcrete USA Website Rebuild Blueprint deploy %s\n" "$BOLD" "🚀" "$RESET"
dim   "  source: $SOURCE_FILE"
dim   "  target: $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH$TARGET_FILENAME"
dim   "  url:    $URL"
echo

if [[ -z "$DEPLOY_HOST" ]]; then
  err "DEPLOY_HOST is empty. Edit deploy/.env (copy from .env.example)."
  exit 2
fi

if ! command -v rsync >/dev/null 2>&1; then
  err "rsync not installed. Install via: brew install rsync (macOS) or apt-get install rsync (Linux)"
  exit 2
fi

if [[ ! -f "$SOURCE_FILE" ]]; then
  err "Source file not found: $SOURCE_FILE"
  exit 2
fi

SOURCE_SIZE=$(stat -f%z "$SOURCE_FILE" 2>/dev/null || stat -c%s "$SOURCE_FILE")
if [[ "$SOURCE_SIZE" -lt 10000 ]]; then
  err "Source file suspiciously small ($SOURCE_SIZE bytes). Aborting to avoid clobbering production."
  exit 2
fi
ok "Source file present ($(numfmt --to=iec "$SOURCE_SIZE" 2>/dev/null || echo "${SOURCE_SIZE} B"))"

# Test SSH connectivity (non-fatal warning if it fails, rsync will surface the real error)
info "Testing SSH connectivity..."
if ssh "${SSH_OPTS[@]}" -o BatchMode=yes "$DEPLOY_USER@$DEPLOY_HOST" "true" 2>/dev/null; then
  ok "SSH OK"
else
  warn "SSH connectivity test failed (key not loaded? agent not running? wrong user?). Proceeding anyway, rsync will give the real error."
fi

# ---------------------------------------------------------------------------
# Compute hash before deploy for change detection
# ---------------------------------------------------------------------------
LOCAL_HASH=$(shasum -a 256 "$SOURCE_FILE" | awk '{print $1}')
dim "  local sha256: ${LOCAL_HASH:0:12}..."

REMOTE_HASH=$(ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
  "test -f $DEPLOY_PATH$TARGET_FILENAME && shasum -a 256 $DEPLOY_PATH$TARGET_FILENAME 2>/dev/null | awk '{print \$1}' || echo NEW" \
  2>/dev/null || echo "UNREACHABLE")

if [[ "$REMOTE_HASH" == "UNREACHABLE" ]]; then
  warn "Could not check remote hash (will deploy anyway)"
elif [[ "$REMOTE_HASH" == "NEW" ]]; then
  info "Remote file does not exist yet, first deploy"
elif [[ "$REMOTE_HASH" == "$LOCAL_HASH" ]]; then
  ok "Remote already has the latest version (sha256 match), nothing to do"
  echo
  exit 0
else
  dim "  remote sha256: ${REMOTE_HASH:0:12}..."
  info "Hash differs, will publish"
fi

# ---------------------------------------------------------------------------
# Atomic deploy: upload to .new, then rename
# ---------------------------------------------------------------------------
info "Uploading via rsync..."
START_TS=$(date +%s)

rsync -avz --checksum --progress \
  -e "ssh ${SSH_OPTS[*]}" \
  "$SOURCE_FILE" \
  "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH$TARGET_FILENAME.new"

# Atomic rename so reads always see a complete file
ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
  "mv $DEPLOY_PATH$TARGET_FILENAME.new $DEPLOY_PATH$TARGET_FILENAME"

END_TS=$(date +%s)
ELAPSED=$((END_TS - START_TS))

# ---------------------------------------------------------------------------
# Post-deploy verification: HEAD the URL and check status
# ---------------------------------------------------------------------------
info "Verifying via HTTP..."
if command -v curl >/dev/null 2>&1; then
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m 10 -L "$URL" || echo "000")
  if [[ "$HTTP_STATUS" =~ ^(200|401)$ ]]; then
    ok "$URL → HTTP $HTTP_STATUS $([ "$HTTP_STATUS" = 401 ] && echo '(basic auth, expected if staging-protected)' || echo '')"
  else
    warn "$URL returned HTTP $HTTP_STATUS, may need nginx config check"
  fi
else
  warn "curl not installed, skipping HTTP verification"
fi

# ---------------------------------------------------------------------------
# Optional: log the deploy to a server-side log
# ---------------------------------------------------------------------------
ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
  "echo '[$(date -u +%Y-%m-%dT%H:%M:%SZ)] deploy by ${USER:-unknown} from $(hostname): sha256=${LOCAL_HASH:0:12} size=${SOURCE_SIZE}' >> $DEPLOY_PATH.deploy.log" \
  2>/dev/null || true

echo
ok "Deploy complete in ${ELAPSED}s · live at $URL"
echo
