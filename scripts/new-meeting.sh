#!/usr/bin/env bash
# ==========================================================================
# new-meeting.sh
# Scaffold a per-meeting notes file from meeting-notes-template.md.
# Usage: bash scripts/new-meeting.sh "title" [type]
#   type defaults to "meetings". Use "interviews" for research interviews.
# Examples:
#   bash scripts/new-meeting.sh "weekly status with client"
#   bash scripts/new-meeting.sh "ceo discovery interview" interviews
# ==========================================================================
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 \"meeting title\" [type]" >&2
  echo "  type defaults to 'meetings'. Use 'interviews' for research interviews." >&2
  exit 2
fi

TITLE="$1"
TYPE="${2:-meetings}"

case "$TYPE" in
  meetings|interviews|workshops)
    ;;
  *)
    echo "type must be one of: meetings, interviews, workshops" >&2
    exit 2
    ;;
esac

SLUG=$(printf '%s' "$TITLE" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')

if [[ -z "$SLUG" ]]; then
  echo "Could not derive a slug from: $TITLE" >&2
  exit 2
fi

cd "$(git rev-parse --show-toplevel)"

OUT_DIR="research/$TYPE"
mkdir -p "$OUT_DIR"

TODAY=$(date +%Y-%m-%d)
OUT="$OUT_DIR/$TODAY-$SLUG.md"

if [[ -f "$OUT" ]]; then
  echo "Refusing to overwrite existing file: $OUT" >&2
  exit 2
fi

TEMPLATE="docs/project-memory/meeting-notes-template.md"
if [[ ! -f "$TEMPLATE" ]]; then
  echo "Missing template: $TEMPLATE" >&2
  exit 2
fi

# Copy the template starting from the first --- line (skips the prefix instructions)
awk '/^---$/{found=1} found{print}' "$TEMPLATE" | tail -n +2 > "$OUT"

# Substitute the title and the date
sed -i.bak \
  -e "s|^# Meeting: {{TITLE}}|# Meeting: $TITLE|" \
  -e "s|^\*\*Date\*\* | YYYY-MM-DD |\*\*Date\*\* | $TODAY|" \
  "$OUT" && rm -f "$OUT.bak"

echo "Created: $OUT"
echo "Next steps:"
echo "  1. Edit $OUT: fill in date, attendees, format, recording status."
echo "  2. During or after the meeting, fill in the structured sections."
echo "  3. After the meeting, run through the 'After-meeting checklist' at the bottom."
echo "  4. Commit and push."
