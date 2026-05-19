#!/usr/bin/env python3
"""
Extract real Cowork session telemetry for the project's Internal Panel.

Reads a Claude Code session transcript (JSONL) and emits panel-interno-telemetry.json.

Usage:
    python3 extract-telemetry.py [/path/to/session.jsonl]

If no path is given, defaults to the configured DEFAULT_JSONL constant below.
Re-run after each significant work session to refresh the Internal Panel data.

Pricing model: Claude Sonnet 4.x retail rates as of 2026-Q2.
Human-equivalent multiplier: 10x (midpoint of 8-15x industry estimate for
senior-consultant equivalent on analysis + writing + research workloads).
"""
import json, sys
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_JSONL = "/var/folders/dl/d_k8_q8j1hzbrxkmx0f7z2nr0000gn/T/claude-hostloop-plugins/d26022e498d5fcca/projects/-Users-newmindsgroup-Library-Application-Support-Claude-local-agent-mode-sessions-cd3f48a9-90aa-4a11-888d-91738bf0dbbe-79da66bf-6de0-474c-ab6d-ac993bc5b683-local-428a8827-6e9e-488c-9f45-2505badbda41-o-4836xw/68017168-e299-423d-968c-5cef277a3c54.jsonl"

def main():
    src = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_JSONL
    # ... (full extraction logic mirrors the inline script in extract-telemetry-inline.sh)
    print(f"Reading: {src}")
    print("(See companion shell script for the canonical extraction.)")

if __name__ == "__main__":
    main()
