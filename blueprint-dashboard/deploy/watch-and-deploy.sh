#!/usr/bin/env bash
# ==========================================================================
# Rockcrete USA Website Rebuild Blueprint, auto-publish daemon
# Watches the dashboard source file for changes and runs deploy.sh.
# Single-flight (won't pile up deploys), debounced, logged with timestamps.
#
# Run with: ./deploy/watch-and-deploy.sh
# Stop with: Ctrl+C
# ==========================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DASHBOARD_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source .env (so the watcher uses the same SOURCE_FILE setting)
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/.env"
fi
: "${SOURCE_FILE:=$DASHBOARD_DIR/index.html}"

WATCHED_FILE="$SOURCE_FILE"
DEPLOY_SCRIPT="$SCRIPT_DIR/deploy.sh"
DEBOUNCE_SECONDS=2
LOG_FILE="$SCRIPT_DIR/.watch.log"

GREEN="$(printf '\033[32m')"; YELLOW="$(printf '\033[33m')"
CYAN="$(printf '\033[36m')"; RED="$(printf '\033[31m')"
DIM="$(printf '\033[2m')"; BOLD="$(printf '\033[1m')"
RESET="$(printf '\033[0m')"

ts()    { date '+%Y-%m-%d %H:%M:%S'; }
ok()    { printf "%s[%s]%s %s✓%s %s\n" "$DIM" "$(ts)" "$RESET" "$GREEN" "$RESET" "$*" | tee -a "$LOG_FILE"; }
warn()  { printf "%s[%s]%s %s⚠%s %s\n" "$DIM" "$(ts)" "$RESET" "$YELLOW" "$RESET" "$*" | tee -a "$LOG_FILE"; }
err()   { printf "%s[%s]%s %s✗%s %s\n" "$DIM" "$(ts)" "$RESET" "$RED" "$RESET" "$*" | tee -a "$LOG_FILE" >&2; }
info()  { printf "%s[%s]%s %s→%s %s\n" "$DIM" "$(ts)" "$RESET" "$CYAN" "$RESET" "$*" | tee -a "$LOG_FILE"; }

# ---------------------------------------------------------------------------
# Pre-flight
# ---------------------------------------------------------------------------
if [[ ! -f "$WATCHED_FILE" ]]; then
  err "Watched file not found: $WATCHED_FILE"
  exit 2
fi
if [[ ! -x "$DEPLOY_SCRIPT" ]]; then
  err "Deploy script not executable: $DEPLOY_SCRIPT"
  exit 2
fi

# fswatch is optional. If absent, fall back to a polling loop using stat(1).
if command -v fswatch >/dev/null 2>&1; then
  WATCH_BACKEND="fswatch"
else
  WATCH_BACKEND="polling"
fi

# Single-flight lock, prevent overlapping deploys when changes burst
LOCK_FILE="/tmp/rockcreteusa-website-rebuild-deploy.lock"

deploy_with_lock() {
  if [[ -f "$LOCK_FILE" ]]; then
    warn "Deploy already in progress, skipping (lock: $LOCK_FILE)"
    return 0
  fi
  trap 'rm -f "$LOCK_FILE"' EXIT INT TERM
  touch "$LOCK_FILE"
  info "Change detected, deploying..."
  if "$DEPLOY_SCRIPT" >> "$LOG_FILE" 2>&1; then
    ok "Deploy succeeded"
  else
    err "Deploy FAILED, see $LOG_FILE for details"
  fi
  rm -f "$LOCK_FILE"
  trap - EXIT INT TERM
}

# ---------------------------------------------------------------------------
# Print banner and start
# ---------------------------------------------------------------------------
[[ -t 1 && -n "${TERM:-}" ]] && clear
printf "%s%s Rockcrete USA Website Rebuild Blueprint auto-publish daemon %s\n" "$BOLD" "👁" "$RESET"
printf "  watching: %s\n" "$WATCHED_FILE"
printf "  on change → %s\n" "$DEPLOY_SCRIPT"
printf "  backend:  %s · debounce: ${DEBOUNCE_SECONDS}s · log: %s\n" "$WATCH_BACKEND" "$LOG_FILE"
printf "  press %sCtrl+C%s to stop\n\n" "$BOLD" "$RESET"

# Initial deploy on start (so we know the current state matches production)
info "Running initial deploy to sync state..."
deploy_with_lock

# ---------------------------------------------------------------------------
# Main watch loop
# ---------------------------------------------------------------------------
if [[ "$WATCH_BACKEND" == "fswatch" ]]; then
  fswatch -o "$WATCHED_FILE" | while read -r _; do
    while read -r -t "$DEBOUNCE_SECONDS" _; do :; done
    deploy_with_lock
  done
else
  stat_mtime() { stat -f %m "$WATCHED_FILE" 2>/dev/null || stat -c %Y "$WATCHED_FILE" 2>/dev/null; }
  LAST_MTIME=$(stat_mtime)
  while true; do
    sleep "$DEBOUNCE_SECONDS"
    CUR_MTIME=$(stat_mtime)
    if [[ -n "$CUR_MTIME" && "$CUR_MTIME" != "$LAST_MTIME" ]]; then
      sleep "$DEBOUNCE_SECONDS"
      AFTER_MTIME=$(stat_mtime)
      while [[ "$AFTER_MTIME" != "$CUR_MTIME" ]]; do
        CUR_MTIME=$AFTER_MTIME
        sleep "$DEBOUNCE_SECONDS"
        AFTER_MTIME=$(stat_mtime)
      done
      LAST_MTIME=$CUR_MTIME
      deploy_with_lock
    fi
  done
fi
