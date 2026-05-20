# Telemetry folder

Holds the data files that feed the Internal Panel.

## Files

| File | What it is | Refresh cadence |
|---|---|---|
| `panel-interno-telemetry.json` | Real AI session telemetry (time, tokens, cost) | After each meaningful Cowork session |
| `tasks.json` | Tasks, milestones, time entries, AI attribution | After each work block (in-app via the timer / Manual Entry; or by editing the JSON directly) |
| `extract-telemetry.py` | The script that produces `panel-interno-telemetry.json` from a Cowork session JSONL transcript |, |
| `panel-interno-telemetry.example.json` | Sample telemetry data, useful as a placeholder before the first real run |, |
| `tasks.example.json` | Sample tasks data, copy to `tasks.json` and edit at INSTALL Step 4 |, |

## How to refresh telemetry

```
python3 telemetry/extract-telemetry.py /path/to/session.jsonl
```

Or with no argument to use the default session path baked into the script (edit the script's `DEFAULT_JSONL` constant for your environment):

```
python3 telemetry/extract-telemetry.py
```

The script overwrites `panel-interno-telemetry.json` in place. Reload the dashboard to see the new numbers.

For full details on the pipeline, including how to find your session JSONL on different platforms, see [../docs/telemetry.md](../../docs/telemetry.md).

## How to edit tasks

Two ways:

1. **In the dashboard itself**, use the live timer, the Manual Entry button, or the New Task button on the Internal Panel. Changes persist to `localStorage` in the preview build, or to the backend in production.
2. **Directly in the JSON**, open `tasks.json` in your editor. Useful for bulk operations (renaming categories, restructuring milestones, deleting test entries). Reload the dashboard after editing to see changes.

For full details on the data model, see [../docs/task-tracking.md](../../docs/task-tracking.md).

## What lives here

Just the data. No HTML, no CSS, no scripts other than the Python extractor. The dashboard reads these files at startup; nothing else writes to them in the v0.1.0 model (in production with a backend, the API endpoint writes via the same JSON shape).
