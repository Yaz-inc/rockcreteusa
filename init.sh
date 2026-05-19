#!/usr/bin/env bash
# ==========================================================================
# init.sh
# Bootstrap a new engagement from project-blueprint-template.
# Reads .template/placeholders.json, prompts for each placeholder,
# validates, then runs a single find-and-replace pass over every tracked
# text file.
#
# Idempotent: safe to re-run if you decide to change a value.
# Run: ./init.sh
# ==========================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

GREEN="$(printf '\033[32m')"; RED="$(printf '\033[31m')"
YELLOW="$(printf '\033[33m')"; CYAN="$(printf '\033[36m')"
DIM="$(printf '\033[2m')"; BOLD="$(printf '\033[1m')"
RESET="$(printf '\033[0m')"

ok()    { printf "%s✓%s %s\n" "$GREEN" "$RESET" "$*"; }
warn()  { printf "%s⚠%s %s\n" "$YELLOW" "$RESET" "$*"; }
err()   { printf "%s✗%s %s\n" "$RED" "$RESET" "$*" >&2; }
info()  { printf "%s→%s %s\n" "$CYAN" "$RESET" "$*"; }
hr()    { printf "%s%s%s\n" "$DIM" "------------------------------------------------------------" "$RESET"; }

PLACEHOLDERS_FILE="$ROOT/.template/placeholders.json"
STATE_FILE="$ROOT/.init-state"

if [[ ! -f "$PLACEHOLDERS_FILE" ]]; then
  err "Missing $PLACEHOLDERS_FILE"
  exit 2
fi

# Pick a Python (3) for JSON parsing
PY=""
for cand in python3 python; do
  if command -v "$cand" >/dev/null 2>&1; then
    PY="$cand"
    break
  fi
done
if [[ -z "$PY" ]]; then
  err "Python 3 is required for placeholder parsing. Install Python 3 and retry."
  exit 2
fi

# Slugify helper
slugify() {
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | LC_ALL=C tr -c 'a-z0-9' '-' \
    | sed -E 's/-+/-/g; s/^-+//; s/-+$//'
}

# Today's date
TODAY=$(date +%Y-%m-%d)
TODAY_YEAR=$(date +%Y)

printf "\n%s%s Project Blueprint Template, init %s\n" "$BOLD" "🚀" "$RESET"
printf "  This script bootstraps a new engagement from the template.\n"
printf "  Press Ctrl+C at any time to abort.\n\n"

# Read placeholder definitions
PLACEHOLDERS_JSON=$("$PY" -c "
import json,sys
with open('$PLACEHOLDERS_FILE') as f:
    d = json.load(f)
for p in d['placeholders']:
    name = p['name']
    prompt = p['prompt']
    default = p.get('default', '')
    derived = p.get('derived_from', '')
    validation = p.get('validation', '')
    required = '1' if p.get('required', False) else '0'
    # Encode as tab-separated; tabs are unlikely in prompts
    print('\t'.join([name, prompt, default, derived, validation, required]))
")

# Stage 1: collect answers
declare -A VALS

# Load prior state if present (idempotent re-runs)
if [[ -f "$STATE_FILE" ]]; then
  warn "Loading prior init values from $STATE_FILE (re-running init)"
  while IFS='=' read -r k v; do
    [[ -n "$k" ]] && VALS["$k"]="$v"
  done < "$STATE_FILE"
fi

# Pre-seed system-derived values
VALS["TODAY"]="$TODAY"
VALS["TODAY_YEAR"]="$TODAY_YEAR"

while IFS=$'\t' read -r name prompt default derived validation required; do
  [[ -z "$name" ]] && continue

  # Resolve derived defaults
  if [[ -n "$derived" && -z "${VALS[$name]:-}" ]]; then
    case "$derived" in
      TODAY)
        default="$TODAY" ;;
      TODAY_YEAR)
        default="$TODAY_YEAR" ;;
      LANGUAGE_PRIMARY)
        default="${VALS[LANGUAGE_PRIMARY]:-$default}" ;;
      *)
        if [[ -n "${VALS[$derived]:-}" ]]; then
          default=$(slugify "${VALS[$derived]}")
        fi
        ;;
    esac
  fi

  # Use prior state as the new default if we have one
  current="${VALS[$name]:-}"
  if [[ -n "$current" ]]; then
    default="$current"
  fi

  while true; do
    if [[ -n "$default" ]]; then
      printf "%s [%s%s%s]: " "$prompt" "$CYAN" "$default" "$RESET"
    else
      printf "%s: " "$prompt"
    fi
    IFS= read -r answer
    : "${answer:=$default}"

    if [[ "$required" == "1" && -z "$answer" ]]; then
      err "This field is required."
      continue
    fi

    if [[ -n "$validation" ]]; then
      if ! printf '%s' "$answer" | grep -qE "$validation"; then
        err "Value does not match validation pattern: $validation"
        continue
      fi
    fi

    VALS["$name"]="$answer"
    break
  done
done <<< "$PLACEHOLDERS_JSON"

# Save state for idempotent re-runs
{
  for k in "${!VALS[@]}"; do
    [[ "$k" == "TODAY" || "$k" == "TODAY_YEAR" ]] && continue
    printf '%s=%s\n' "$k" "${VALS[$k]}"
  done
} > "$STATE_FILE"

# Show summary
hr
printf "\n%sCollected values%s\n\n" "$BOLD" "$RESET"
for k in PROJECT_NAME PROJECT_SLUG CLIENT_NAME PROJECT_TYPE START_DATE PROJECT_LEAD REPO_URL DASHBOARD_URL LANGUAGE_PRIMARY LANGUAGE_SECONDARY; do
  if [[ -n "${VALS[$k]:-}" ]]; then
    printf "  %-22s %s\n" "$k" "${VALS[$k]}"
  fi
done
printf "\n"

read -p "Apply these to every tracked file? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  warn "Aborted. State saved to $STATE_FILE; re-run when ready."
  exit 0
fi

# Stage 2: find-and-replace across every tracked file
hr
info "Substituting placeholders across the repo..."

# Determine the file list
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  mapfile -t FILES < <(git ls-files)
else
  # Not a git repo yet (e.g. fresh clone with --depth=1 + git removed)
  mapfile -t FILES < <(find . -type f \
    -not -path './.git/*' \
    -not -path './node_modules/*' \
    -not -path './.init-backup/*')
fi

REPLACED_COUNT=0
SKIPPED_COUNT=0

# Build sed expressions for each placeholder
SED_EXPRS=()
for k in "${!VALS[@]}"; do
  [[ "$k" == "TODAY" || "$k" == "TODAY_YEAR" ]] && continue
  v="${VALS[$k]}"
  # Escape forward slashes and ampersands for sed
  v_escaped=$(printf '%s' "$v" | sed -e 's/[\/&]/\\&/g')
  SED_EXPRS+=( -e "s/{{$k}}/$v_escaped/g" )
done

for f in "${FILES[@]}"; do
  # Skip binary files and the placeholders.json itself
  if [[ "$f" == *".template/placeholders.json"* ]]; then
    SKIPPED_COUNT=$((SKIPPED_COUNT+1))
    continue
  fi
  if file --mime "$f" 2>/dev/null | grep -q "charset=binary"; then
    SKIPPED_COUNT=$((SKIPPED_COUNT+1))
    continue
  fi
  # Skip the init scripts themselves
  case "$f" in
    init.sh|init.ps1|.init-state) SKIPPED_COUNT=$((SKIPPED_COUNT+1)); continue ;;
  esac

  if grep -q '{{[A-Z][A-Z0-9_]*}}' "$f" 2>/dev/null; then
    # Apply substitutions in place
    tmp="$(mktemp)"
    sed "${SED_EXPRS[@]}" "$f" > "$tmp"
    if ! cmp -s "$f" "$tmp"; then
      mv "$tmp" "$f"
      REPLACED_COUNT=$((REPLACED_COUNT+1))
    else
      rm "$tmp"
    fi
  fi
done

ok "Replaced placeholders in $REPLACED_COUNT file(s); skipped $SKIPPED_COUNT (binary or excluded)."

# Stage 3: post-init guidance
hr
printf "\n%sNext steps%s\n\n" "$BOLD" "$RESET"
cat <<EOF
  1. Read .template/post-init-checklist.md and work through the remaining placeholders.
     ${DIM}grep -rn '{{' . --exclude-dir=.git --exclude-dir=node_modules${RESET}

  2. Pick which docs/project-types/*.md guide(s) to keep:
     ${DIM}docs/project-types/${VALS[PROJECT_TYPE]}.md is the one tied to your PROJECT_TYPE${RESET}

  3. Customize the dashboard:
     ${DIM}blueprint-dashboard/index.html (THEME TOKENS block) + content${RESET}

  4. Wire up the deploy pipeline if you'll publish to a VPS:
     ${DIM}cp blueprint-dashboard/deploy/.env.example blueprint-dashboard/deploy/.env${RESET}
     ${DIM}then edit .env with your VPS details${RESET}

  5. Make the first real commit:
     ${DIM}git add . && git commit -m "chore: initialize ${VALS[PROJECT_NAME]} from project-blueprint-template"${RESET}

  6. (Optional) Delete init.sh, init.ps1, and .template/ once you're confident the init landed cleanly.

EOF

ok "Init complete for ${VALS[PROJECT_NAME]}."
