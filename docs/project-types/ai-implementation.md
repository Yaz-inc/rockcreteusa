# AI implementation

Use this guide when the engagement is designing and shipping AI capabilities (LLM workflows, RAG, agents, evals, ops). The work is half product and half experiment, which is why it deserves its own type rather than being lumped into software-app.

## Typical lifecycle

| Phase | Duration | Goal | Output |
|---|---|---|---|
| Use-case discovery | 2 to 4 weeks | Identify which use cases are worth building. | Use-case shortlist with value, feasibility, risk per case. |
| Prototype + eval setup | 2 to 4 weeks | Stand up the eval harness alongside the first prototype. | Working PoC + baseline eval scores. |
| Iteration | 4 to 12 weeks | Drive eval scores up to a "ship" bar. | Production-ready prompt / pipeline / model. |
| Deployment | 2 to 4 weeks | Wire into the surrounding product, ops, monitoring. | Production traffic flowing; cost dashboard live. |
| Operations handover | 2 to 4 weeks | Transfer to the team that runs it day-to-day. | Runbook, on-call rotation, eval refresh schedule. |

Two characteristics make this lifecycle different from generic software:

1. **Evals are infrastructure, not a "phase."** They exist from day 1 and are versioned alongside the prompt / pipeline.
2. **Iteration is open-ended.** You stop when scores cross a threshold, not when a sprint ends.

## Standard deliverables

Use-case discovery:

- Inventory of candidate use cases with `value`, `feasibility`, `risk` columns.
- Shortlist of 1 to 3 use cases to prototype.
- Per-use-case spec: input, expected output, success criteria, failure modes, off-limits behavior.
- Risk register including hallucination, bias, PII, prompt injection, dependency risks.

Prototype + eval setup:

- Eval dataset (golden inputs + expected outputs or scoring rubric).
- Eval harness that runs the dataset and produces a score table.
- Baseline scores for the simplest prompt / pipeline you can stand up.
- ADR on model choice (provider, model name, fallback).

Iteration:

- Versioned prompts (every change in Git, semantic versioning of prompts).
- Eval-score history.
- "Ship" criteria documented and met.
- Cost-per-call estimate.
- Latency budget met.

Deployment:

- Production wiring (auth, rate limits, retries, fallbacks).
- Observability (logs, latency, cost, error rate, eval drift detection).
- A/B or shadow deploy if user-facing.
- User-facing safety: opt-in, human-in-the-loop, escalation path.

Operations handover:

- Runbook (what to do when scores drop, when costs spike, when a provider has an outage).
- Eval refresh schedule (weekly? quarterly? on-incident?).
- On-call rotation (or escalation path).
- Cost monitoring with alerts.

## Top-level folders to keep

```
use-cases/                    one folder per use case
  └── {{USE_CASE_SLUG}}/
      ├── spec.md             input/output, success criteria, failure modes
      ├── prompts/            versioned prompt files
      ├── pipeline/           code (Python or TypeScript)
      └── eval/               eval dataset and harness for this use case
models/                       cross-cutting model evaluation
prompts/                      shared prompt fragments
evals/                        shared eval datasets and harnesses
deployment/                   production wiring
research/
  ├── papers/                 relevant research papers (links + summaries)
  └── prior-art/              competitor / industry analysis
```

## Typical tech-stack categories

| Layer | Common picks |
|---|---|
| LLM provider | OpenAI · Anthropic · Google (Gemini) · xAI (Grok) · Mistral · open weights via vLLM / Ollama / Together |
| Orchestration | Direct API · LangChain · LlamaIndex · DSPy · Haystack · Mastra · custom |
| Embeddings | OpenAI · Cohere · BGE · open-source SentenceTransformers |
| Vector store | pgvector (Postgres) · Pinecone · Weaviate · Qdrant · Chroma · Milvus |
| Retrieval | hybrid (BM25 + vector) · pure vector · graph-augmented |
| Eval | Inspect AI · braintrust · Promptfoo · custom Python · RAGAS |
| Observability | Langfuse · Helicone · Phoenix · custom OpenTelemetry |
| OCR / vision | AWS Textract · Google Document AI · Azure AI · Mistral Document AI · open (Tesseract, PaddleOCR) |

## Common risks

1. **Eval set drift.** Production data shifts; the eval set captures last quarter's distribution. Refresh on a schedule.
2. **Provider outage.** Single-provider deployments break when the provider does. Build a fallback path on day 1.
3. **Cost explosion.** A retry loop in production calls $1 per request 1,000 times. Set hard budget caps; alert on spend velocity.
4. **Prompt injection.** User-controllable inputs reach the LLM. Use system prompts that explicitly state untrusted-content rules; never let user content control system behavior. See OWASP LLM Top 10.
5. **Hallucination at the seam.** The model is correct in isolation but wrong when wired to real product flows. Eval the **end-to-end** behavior, not just the prompt.
6. **Compliance and PII.** Logs include user data. Redact at the boundary; review retention policies; review provider DPA terms.
7. **The "demo plateau."** First prompt scores 70%; sixth prompt also scores 70%. Switch from prompt-tuning to data-tuning (better examples, better retrieval) when this happens.

## Eval discipline

A useful eval has four properties:

1. **Reproducible.** Same inputs, same outputs (set temperature 0, pin model version).
2. **Aligned to user value.** Scoring measures what users care about, not what is easy to score.
3. **Spans the failure modes.** Includes adversarial inputs, edge cases, the cases that matter operationally.
4. **Cheap to run.** If running it costs $50, you will not run it. Cache aggressively.

Track eval scores over time. Plot them in the dashboard.

## Dashboard customization for AI projects

The dashboard's `blueprint-dashboard/telemetry/` already tracks AI session telemetry (tokens, cost, time). For AI-implementation projects, extend it to track:

- Eval-score history per use case.
- Cost per call over time.
- Latency P50 / P95 over time.
- Production error rate.

Categories for `tasks.example.json`:

- `use-case-research`
- `prompt-engineering`
- `eval-harness`
- `pipeline-development`
- `integration-and-deployment`
- `operations-and-monitoring`
- `meetings-and-reviews`
- `documentation`

## Safety and ops checklists

Before going to production:

- [ ] Rate limits set per user / per endpoint.
- [ ] Cost cap per user / per day with circuit breaker.
- [ ] Fallback path tested (provider down, model deprecated).
- [ ] Logs redact PII.
- [ ] Provider DPA in place; data residency confirmed.
- [ ] Output filter (toxicity / PII) for user-facing responses.
- [ ] Human-in-the-loop where stakes are high.
- [ ] Incident playbook covers: eval drift, cost spike, provider outage, security finding.

## Pointers

- `../project-memory/` for use-case discovery and decisions.
- `../decision-records/` for model-choice and architecture ADRs.
- `../architecture/` for pipeline diagrams.
- `blueprint-dashboard/` for telemetry and cost transparency.
