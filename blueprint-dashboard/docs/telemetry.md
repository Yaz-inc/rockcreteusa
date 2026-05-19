# Telemetry Pipeline

How the dashboard's Internal Panel produces real numbers, not mock data, for AI session time, token consumption, cost, and the human-equivalent comparison.

## What it produces

The Internal Panel renders four primary KPIs:

- **Active AI time**, sum of intervals between consecutive turns when those intervals are < 30 minutes (longer intervals are treated as human pauses, not work)
- **Tokens consumed**, input + output + cache_read + cache_create totals
- **AI cost**, token totals × Claude Sonnet 4.x retail rates
- **Savings vs. human equivalent**, estimated human cost minus AI cost, with documented multiplier

Plus secondary visualizations:

- Per-day activity (turns logged per working day)
- Top tools used (bash, Read, Write, Edit, etc., ranked)
- Token detail breakdown (input vs. output vs. cache)
- Per-task and per-milestone roll-ups (when combined with the task tracker)

## How it works

The pipeline has three pieces:

1. **Source**, Claude Code maintains a JSONL transcript per session at `/var/folders/.../claude-hostloop-plugins/<id>/projects/<project>/<session-uuid>.jsonl`. Each line is one event (user turn, assistant turn, tool call). Assistant turns include the API's reported token usage.

2. **Extractor**, `telemetry/extract-telemetry.py` reads the JSONL, aggregates token usage by category, computes timing, and writes the result to `telemetry/panel-interno-telemetry.json`.

3. **Renderer**, `index.html` `fetch()`es the JSON at startup and `renderPanel()` paints it into the Internal Panel.

## Refreshing the data

After any meaningful Cowork session for the project:

```
cd dashboard/
python3 telemetry/extract-telemetry.py /path/to/your/session.jsonl
```

Or with no argument to use the default session path baked into the script (edit the script to point at the right session for your engagement):

```
python3 telemetry/extract-telemetry.py
```

Reload the dashboard and the new numbers appear.

## Schema of `panel-interno-telemetry.json`

```json
{
  "_meta": { "generated_at": "...", "source": "...", "note": "..." },
  "project": { "name": "...", "client": "...", "funder": "...", "consultant_lead": "..." },
  "session": {
    "id": "...",
    "title": "...",
    "first_activity": "ISO timestamp",
    "last_activity": "ISO timestamp",
    "wall_clock_hours": 137.77,
    "active_hours": 1.78,
    "distinct_working_days": ["YYYY-MM-DD", ...],
    "daily_turn_counts": [{ "date": "YYYY-MM-DD", "turns": N }, ...]
  },
  "interactions": {
    "user_turns": N,
    "assistant_turns": N,
    "tool_use_count": N,
    "tool_use_breakdown": { "ToolName": N, ... }
  },
  "tokens": {
    "input": N, "cache_create": N, "cache_read": N, "output": N, "total": N
  },
  "ai_cost": { "currency": "USD", "amount": 25.7236, "pricing_model": "..." },
  "human_equivalent": {
    "hours_estimate": 17.71,
    "hourly_rate_usd": 125,
    "cost_estimate_usd": 2214.31,
    "multiplier_applied": 10,
    "multiplier_rationale": "..."
  },
  "value_delivered": {
    "savings_usd": 2188.59,
    "roi_multiple": 86.1,
    "savings_percent": 98.8
  },
  "deliverables_touched": ["...", ...],
  "expenses": { "_note": "...", "entries": [] }
}
```

## Pricing model

Default uses Claude Sonnet 4.x retail rates as of 2026-Q2:

- Input tokens: $3.00 per million
- Output tokens: $15.00 per million
- Cache-read tokens: $0.30 per million
- Cache-create tokens: $3.75 per million

Edit the constants at the top of `extract-telemetry.py` to use different rates if your pricing tier differs (Anthropic enterprise rates, monthly subscription amortization, etc.).

## Human-equivalent multiplier

The default 10× multiplier is the midpoint of the 8–15× industry range cited for senior consultants performing equivalent analysis, technical writing, and documentary research. It's an estimate, not a benchmark. Adjust per engagement:

- Pure research / synthesis tasks: 12–15× (AI is fastest at heavy reading and pattern extraction)
- Code-heavy implementation: 8–10× (junior engineers can be reasonably fast)
- Visual design / brand work: 6–8× (designers benefit less from raw text speed)
- Stakeholder communication, meetings: 1× (no AI multiplier; human time is human time)

The multiplier is documented in the JSON via `human_equivalent.multiplier_rationale` so anyone reading the dashboard sees how the savings number was computed.

## Hourly rate

Default $125/hr is a blended senior-consultant rate. Adjust to match the consultancy's actual rate card. If different consultants have different rates, future versions of the schema can support per-task rates, for now, one rate per project keeps the math simple.

## Multi-session aggregation

The current extractor reads one JSONL at a time. To aggregate across multiple sessions for the same engagement, two options:

1. **Run the extractor on each session and manually sum**, the simplest; works well for monthly reporting
2. **Concatenate JSONL files first**, `cat session1.jsonl session2.jsonl > combined.jsonl` then point the extractor at the combined file. Timestamps are preserved so daily breakdowns work.

Future template versions may include a `combine-sessions.py` helper.

## Privacy and data hygiene

The JSONL contains the actual conversation contents, user messages, assistant responses, tool inputs/outputs. The extractor reads it but **only writes aggregated numbers** to the output JSON. No conversation content is exposed to the dashboard.

That said:

- Don't commit the raw JSONL to a public repo (it's local to the consultant's machine for a reason)
- Don't share `panel-interno-telemetry.json` with the client unless the role gating is in place, it reveals the consultant's actual cost structure

## Attribution to tasks

The Internal Panel's task tracker shows AI cost attributed to each task. Attribution is done via the `ai_attribution_pct` field on each task in `tasks.json`:

```json
{
  "id": "t-001",
  "name_es": "Some task",
  "ai_session_ids": ["session-uuid-1"],
  "ai_attribution_pct": 100
}
```

The renderer takes the session telemetry totals and multiplies by `ai_attribution_pct / 100` to attribute that share of the cost to the task. If multiple tasks share a session, split the percentages so they sum to 100. If a task had no AI session, set `ai_attribution_pct: 0` and only its human time appears.

This is honest but coarse. A more granular approach would tag every assistant turn with a current task ID, possible if the consultant marks task switches in chat with a recognizable token. For now, per-session attribution is the working model.

## Limitations & honesty

- **Active time is estimated, not measured.** It's the sum of inter-turn gaps under 30 minutes. If you stepped away mid-thread for 5 minutes and came back, that 5 minutes is counted as "active". This over-estimates slightly but is close enough.
- **Token cost is API-list price.** If the consultancy is on a flat-rate subscription, the marginal cost is effectively zero, but the list-price comparison is still the honest baseline for value reporting.
- **The human multiplier is an estimate.** Be conservative when reporting to clients. The point isn't the precise multiplier, it's that AI-assisted delivery costs less than the human-only alternative by a factor large enough to matter, and the dashboard shows it.

## When the math gets political

Some clients (or some teams within them) react badly to "AI is doing the work" framing. Two ways to soften without misrepresenting:

1. Reframe as **leverage** rather than replacement. The AI doesn't eliminate the consultant; it multiplies the consultant. The savings number is "value created beyond what the budget could otherwise produce".
2. Attribute the AI cost as a **methodology line item** in the engagement, not as a separate vendor cost. The consultancy is still the responsible party; the AI is a tool the consultancy chose to use.

The template's framing is the second approach. The Internal Panel says "Cuánto tiempo, cuántos tokens, cuánto valor", about the work, not about who did it.
