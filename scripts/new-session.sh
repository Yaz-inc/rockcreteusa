#!/usr/bin/env bash
# ==========================================================================
# new-session.sh
# Prepends a new session-log entry to docs/project-memory/session-log.md.
# Usage: bash scripts/new-session.sh "short title" "tool-used" "person-name"
# Example: bash scripts/new-session.sh "Auth flow design" "Cursor" "Daniel"
# ==========================================================================
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 \"short title\" \"tool-used\" \"person-name\"" >&2
  echo "Example: $0 \"Auth flow design\" \"Cursor\" \"Daniel\"" >&2
  exit 2
fi

TITLE="$1"
TOOL="$2"
PERSON="$3"

cd "$(git rev-parse --show-toplevel)"

LOG="docs/project-memory/session-log.md"
if [[ ! -f "$LOG" ]]; then
  echo "Session log not found: $LOG" >&2
  exit 2
fi

TODAY=$(date +%Y-%m-%d)

# Build the new entry
ENTRY=$(cat <<EOF
## $TODAY ($TITLE) · $TOOL · $PERSON

**Triggered by:** _One sentence describing what prompted the session._

**Worked on:**

-

**What was produced:**

-

**Where things ended:**

_One paragraph capturing the state at session end and what should happen next._

---

EOF
)

# Use awk to insert after the first heading + intro paragraph block
TMP="${LOG}.tmp"
awk -v entry="$ENTRY" '
  BEGIN { inserted = 0 }
  /^---$/ && !inserted {
    print
    print ""
    print entry
    inserted = 1
    next
  }
  { print }
' "$LOG" > "$TMP"

mv "$TMP" "$LOG"

echo "Prepended new entry for $TODAY to $LOG"
echo "Now edit $LOG to fill in the Triggered by / Worked on / Produced / Ended sections."
