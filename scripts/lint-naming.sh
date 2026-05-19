#!/usr/bin/env bash
# ==========================================================================
# lint-naming.sh
# Enforces the naming conventions documented in
# docs/project-memory/naming-conventions.md across every tracked Git path.
# Fails the build (exit 1) if any violation is found.
# ==========================================================================
set -euo pipefail

GREEN="$(printf '\033[32m')"; RED="$(printf '\033[31m')"
YELLOW="$(printf '\033[33m')"; CYAN="$(printf '\033[36m')"
RESET="$(printf '\033[0m')"

ok()    { printf "%s✓%s %s\n" "$GREEN" "$RESET" "$*"; }
warn()  { printf "%s⚠%s %s\n" "$YELLOW" "$RESET" "$*"; }
err()   { printf "%s✗%s %s\n" "$RED" "$RESET" "$*" >&2; }
info()  { printf "%s→%s %s\n" "$CYAN" "$RESET" "$*"; }

# Allowlist of paths that may use SCREAMING_CASE or otherwise differ.
# Anchored with ^ so only exact matches.
ALLOWED_REGEX='^(\.github/CODEOWNERS|\.github/PULL_REQUEST_TEMPLATE\.md|\.github/ISSUE_TEMPLATE/[a-z0-9_-]+\.md|\.github/workflows/[a-z0-9._-]+\.ya?ml|README\.md|LICENSE|CONTRIBUTING\.md|CHANGELOG\.md|SECURITY\.md|CODE_OF_CONDUCT\.md|\.gitignore|\.editorconfig|\.gitattributes|init\.sh|init\.ps1|\.template/[a-z0-9._-]+\.(json|md))$'

# Run inside the repo root
if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  err "Not inside a Git repository."
  exit 2
fi
cd "$(git rev-parse --show-toplevel)"

violations=0

# Get all tracked files
mapfile -t FILES < <(git ls-files)

info "Scanning $(printf '%d' "${#FILES[@]}") tracked paths..."

for f in "${FILES[@]}"; do
  # Allowlist
  if [[ "$f" =~ $ALLOWED_REGEX ]]; then
    continue
  fi

  # Files inside docs/decision-records/ may use the NNNN-title.md pattern
  if [[ "$f" =~ ^docs/decision-records/[0-9]{4}-[a-z0-9-]+\.md$ ]]; then
    continue
  fi

  # 1. Check for non-ASCII characters
  if printf '%s' "$f" | LC_ALL=C grep -q '[^[:print:]]'; then
    err "Non-ASCII path: $f"
    violations=$((violations+1))
    continue
  fi

  # 2. Check for spaces
  if [[ "$f" == *" "* ]]; then
    err "Path contains spaces: $f"
    violations=$((violations+1))
    continue
  fi

  # 3. Check for parentheses, ampersands, or other shell-special chars
  if [[ "$f" =~ [\(\)\&\!\$\;\,\\\?\*\<\>\|\"\'] ]]; then
    err "Path contains forbidden characters: $f"
    violations=$((violations+1))
    continue
  fi

  # 4. Each segment must be lowercase (or be a known allowlisted item).
  # Skip the basename check for files matching SCREAMING_CASE pattern at any level
  IFS='/' read -ra parts <<< "$f"
  for part in "${parts[@]}"; do
    # Allow names like '0001-foo.md', '0000-template.md'
    if [[ "$part" =~ ^[0-9]+-[a-z0-9-]+(\.[a-z0-9]+)?$ ]]; then
      continue
    fi
    # Allow lowercase names: kebab-case, with optional extension
    if [[ "$part" =~ ^[a-z0-9._-]+$ ]]; then
      continue
    fi
    # Allow .github
    if [[ "$part" == ".github" ]]; then
      continue
    fi
    # Allow .template
    if [[ "$part" == ".template" ]]; then
      continue
    fi
    # Allow .gitkeep (for empty folder placeholders)
    if [[ "$part" == ".gitkeep" ]]; then
      continue
    fi
    # Allowlisted SCREAMING_CASE names at any depth
    case "$part" in
      README.md|LICENSE|CONTRIBUTING.md|CHANGELOG.md|SECURITY.md|CODE_OF_CONDUCT.md|CODEOWNERS|PULL_REQUEST_TEMPLATE.md|INSTALL.md|ARCHITECTURE.md|DEPLOY.md|VERCEL.md)
        continue ;;
    esac
    err "Path segment violates kebab-case-ASCII rule: '$part' (in $f)"
    violations=$((violations+1))
    break
  done
done

# 5. Em-dash check across text content (a soft rule but still surfaced)
#
# Allowlist: files whose explicit purpose is to document the no-em-dash rule
# may legitimately contain the character (in code blocks, character tables,
# or as the literal example of what NOT to do). Other files must be em-dash
# free.
info "Scanning for em-dashes (forbidden per writing-conventions.md)..."
EMDASH_DOC_ALLOWLIST=(
  "docs/project-memory/writing-conventions.md"
  "docs/project-memory/naming-conventions.md"
  "docs/project-memory/instructions.md"
  "drive-folder-structure/README.md"
  "CONTRIBUTING.md"
  ".github/PULL_REQUEST_TEMPLATE.md"
  "scripts/lint-naming.sh"
  ".template/prompts/kickoff-orchestrator.md"
  ".template/prompts/lifecycle-orchestrator.md"
)
is_emdash_allowed() {
  local f="$1"
  for allowed in "${EMDASH_DOC_ALLOWLIST[@]}"; do
    [[ "$f" == "$allowed" ]] && return 0
  done
  return 1
}

EMDASH_HITS=0
while IFS= read -r f; do
  # Skip binary files
  if file --mime "$f" 2>/dev/null | grep -q "charset=binary"; then
    continue
  fi
  # Skip files that exist to document the em-dash rule
  if is_emdash_allowed "$f"; then
    continue
  fi
  if LC_ALL=en_US.UTF-8 grep -l $'\xe2\x80\x94' "$f" >/dev/null 2>&1; then
    err "Em-dash (—) found in: $f"
    EMDASH_HITS=$((EMDASH_HITS+1))
  fi
done < <(printf '%s\n' "${FILES[@]}")

if [[ $EMDASH_HITS -gt 0 ]]; then
  err "Found em-dashes in $EMDASH_HITS file(s). Replace with natural punctuation. See docs/project-memory/writing-conventions.md."
  violations=$((violations + EMDASH_HITS))
fi

if [[ $violations -gt 0 ]]; then
  err "Naming/writing lint failed with $violations violation(s)."
  exit 1
else
  ok "Naming/writing lint passed: ${#FILES[@]} paths clean."
fi
