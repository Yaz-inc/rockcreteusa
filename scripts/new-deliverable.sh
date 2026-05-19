#!/usr/bin/env bash
# ==========================================================================
# new-deliverable.sh
# Scaffolds the next deliverable file under deliverables/.
# Usage: bash scripts/new-deliverable.sh "title here"
# ==========================================================================
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 \"deliverable title\"" >&2
  exit 2
fi

TITLE="$*"

SLUG=$(printf '%s' "$TITLE" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')

if [[ -z "$SLUG" ]]; then
  echo "Could not derive a slug from: $TITLE" >&2
  exit 2
fi

cd "$(git rev-parse --show-toplevel)"

DEL_DIR="deliverables"
mkdir -p "$DEL_DIR"

LAST_NUM=$(ls -1 "$DEL_DIR" 2>/dev/null \
  | grep -E '^[0-9]{4}-' \
  | sed -E 's/^([0-9]{4})-.*/\1/' \
  | sort -n \
  | tail -1 || echo "0000")

NEXT_NUM=$((10#${LAST_NUM:-0} + 1))
PADDED=$(printf "%04d" "$NEXT_NUM")

OUT="$DEL_DIR/$PADDED-$SLUG.md"

if [[ -f "$OUT" ]]; then
  echo "Refusing to overwrite existing file: $OUT" >&2
  exit 2
fi

TEMPLATE="$DEL_DIR/0000-template.md"
if [[ ! -f "$TEMPLATE" ]]; then
  echo "Missing template: $TEMPLATE" >&2
  exit 2
fi

TODAY=$(date +%Y-%m-%d)
sed \
  -e "s/^# 0000:.*/# $PADDED: $TITLE/" \
  -e "s|\*\*ID\*\* | 0000|\*\*ID\*\* | $PADDED|" \
  "$TEMPLATE" > "$OUT"

# The pipe character in sed needs escaping; redo more safely
cp "$TEMPLATE" "$OUT"
sed -i.bak \
  -e "s/^# 0000: Template (rename when copying)/# $PADDED: $TITLE/" \
  -e "s/| \*\*ID\*\* | 0000 |/| **ID** | $PADDED |/" \
  -e "s/{{DELIVERABLE_TITLE}}/$TITLE/" \
  "$OUT" && rm -f "$OUT.bak"

echo "Created: $OUT"
echo "Next steps:"
echo "  1. Edit $OUT: fill in Phase, Milestone tag, Owner, Reviewer(s), Approver, Due date, Format."
echo "  2. Add a row in docs/project-memory/phases-and-milestones.md pointing to this file."
echo "  3. Set status to 'in progress' once the work starts."
