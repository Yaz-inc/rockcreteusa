#!/usr/bin/env bash
# ==========================================================================
# new-adr.sh
# Scaffolds the next ADR file under docs/decision-records/.
# Usage: bash scripts/new-adr.sh "short title here"
# ==========================================================================
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 \"short title for the ADR\"" >&2
  exit 2
fi

TITLE="$*"

# Slugify: lowercase, replace non-alnum with hyphens, collapse, strip
SLUG=$(printf '%s' "$TITLE" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')

if [[ -z "$SLUG" ]]; then
  echo "Could not derive a slug from: $TITLE" >&2
  exit 2
fi

cd "$(git rev-parse --show-toplevel)"

ADR_DIR="docs/decision-records"
mkdir -p "$ADR_DIR"

# Find the next sequence number
LAST_NUM=$(ls -1 "$ADR_DIR" 2>/dev/null \
  | grep -E '^[0-9]{4}-' \
  | sed -E 's/^([0-9]{4})-.*/\1/' \
  | sort -n \
  | tail -1 || echo "0000")

# Strip leading zeros for arithmetic, default to 0
NEXT_NUM=$((10#${LAST_NUM:-0} + 1))
PADDED=$(printf "%04d" "$NEXT_NUM")

OUT="$ADR_DIR/$PADDED-$SLUG.md"

if [[ -f "$OUT" ]]; then
  echo "Refusing to overwrite existing file: $OUT" >&2
  exit 2
fi

# Copy from template
TEMPLATE="$ADR_DIR/0000-template.md"
if [[ ! -f "$TEMPLATE" ]]; then
  echo "Missing template: $TEMPLATE" >&2
  exit 2
fi

# Substitute the title and date in the new ADR
TODAY=$(date +%Y-%m-%d)
sed \
  -e "s/^# ADR-0000:.*/# ADR-$PADDED: $TITLE/" \
  -e "s/^\*\*Date:\*\* YYYY-MM-DD/**Date:** $TODAY/" \
  -e "s/^\*\*Status:\*\*.*/**Status:** Proposed/" \
  "$TEMPLATE" > "$OUT"

echo "Created: $OUT"
echo "Next steps:"
echo "  1. Edit $OUT to fill in Context, Options, Decision, Consequences."
echo "  2. Open a PR with the title: 'docs(adr): $PADDED $TITLE'."
echo "  3. After approval, change Status to Accepted and merge."
echo "  4. Add an entry to docs/project-memory/decisions.md linking to this ADR."
