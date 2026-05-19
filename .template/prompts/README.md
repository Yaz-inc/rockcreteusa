# Orchestration prompts

The two prompts in this folder turn the Project Blueprint Template into an autonomous (or semi-autonomous) project management system. Paste one of them into your orchestration agent at the start of a session and the agent handles the rest.

## The two prompts

| Prompt | When to use | Runtime | Cost |
|---|---|---|---|
| [`kickoff-orchestrator.md`](kickoff-orchestrator.md) | Starting a new client engagement. Run once per engagement. | 20-60 min | ~$5-15 |
| [`lifecycle-orchestrator.md`](lifecycle-orchestrator.md) | Any time after kickoff. Run per-task throughout the engagement. | 5-30 min per task | ~$0.50-3 per task |

## Recommended trigger surface

**Cowork** for both.

Why Cowork over Claude Code:

- Cowork's "select a folder" is the natural ingestion point. The new client's source-of-truth context lives in Drive on day one, and the orchestration agent reads markdown / Office docs / PDFs natively from a selected Drive folder.
- Cowork's session state (the conversation, AskUserQuestion answers, the running TodoList) is more visible to the supervising user.
- Cowork can delegate heavy CLI work (git operations, Vercel CLI calls, `init.sh` runs) to a Claude Code subagent when it needs the better shell posture, so you don't lose Claude Code's strengths.

Use Claude Code instead when:

- The kickoff is for an engagement with no Drive folder yet (Git-only / repo-only project).
- You want a one-shot autonomous run with no interactive prompting.
- You're at the closeout phase and the work is mostly Git operations + report generation.

## Operational model

```
Day 0: New client signed.
       ↓
Day 0: Open Cowork → select Drive folder → paste kickoff-orchestrator.md
       ↓
~30 min later: live repo + live dashboard + populated memory
       ↓
Day 1+: For every task (status update, weekly client update, interview synthesis,
        deliverable acceptance, risk review, etc.):
        → Open Cowork → select Drive folder OR open Claude Code in the repo
        → Paste lifecycle-orchestrator.md + the day's task
        → ~10 min later: state coherent across all surfaces
       ↓
Day N: Engagement closes.
       → "Closeout the engagement" task in lifecycle-orchestrator.md
       → archive repo / delete Vercel / final closeout report
```

## What the orchestration agent must already have

These prompts assume the agent has standing access to:

- **GitHub** as `newmindsgroup` (or whatever org you keep the template in). Token with `repo` and `workflow` scopes; for fine-grained PATs use `Administration: Read & write`, `Contents: Read & write`, `Metadata: Read`.
- **Vercel** team account with project create / deploy permissions.
- **Vultr** SSH key (only needed if any engagement uses Vultr hosting).
- **Cloudflare** zone-level API token (only if Vultr hosting + Cloudflare in front).
- **Google Drive** via the Cowork session's selected folder.
- **The Project Blueprint Template** repo URL.

If you don't have one of these set up yet, set it up before pasting the prompts. The kickoff prompt's Phase 0 verifies access and stops if any surface is missing.

## Tuning per organization

Both prompts use placeholders that match the template's defaults (`newmindsgroup` org, `{{client-slug}}-blueprint` Vercel naming). If your firm uses different conventions:

1. Open the prompt locally.
2. Search-and-replace the org name and Vercel naming pattern.
3. Save your tuned copy somewhere outside this template repo (your prompt library, your team's Notion, your secrets store).

Keep the original copies here as the canonical version; tune your copies separately.

## Pairing with project-memory

After kickoff, the per-engagement repo's `docs/project-memory/ai-playbook.md` becomes the project-specific tuning layer. The lifecycle prompt explicitly reads `ai-playbook.md` first and prefers prompts from there over its own generic patterns. This means:

- The kickoff prompt sets up the engagement.
- The lifecycle prompt + `ai-playbook.md` together drive ongoing work.
- Every novel pattern you discover during an engagement becomes a new entry in `ai-playbook.md`, so it carries forward to the next engagement (when you backport useful patterns to this template).

## Why two prompts and not one

A single mega-prompt would work but produce worse outcomes:

- The kickoff prompt's depth (deep ingestion, gap analysis, repo creation, deploy, mirror) is overkill for a 5-minute status update.
- The lifecycle prompt's brevity (read memory, do the task, write back) doesn't have enough scaffolding for a from-scratch kickoff.
- Two prompts let each be tuned for its workload.

The boundary between them is sharp: kickoff produces the repo + dashboard + populated memory; lifecycle assumes those exist.

## Safety

Both prompts include explicit "what you must NEVER do" sections. Before running either, scan that section. Common to both:

- Never commit secrets.
- Never send messages to the client (always output for the user to send).
- Never hallucinate names, dates, or amounts.
- Never skip lint before pushing.
- Never modify the template repo itself.

Per-engagement, the repo's `SECURITY.md` and `docs/project-memory/instructions.md` may add more constraints. The agent reads those at session start.

## Testing the prompts

Before using either on a real client engagement:

1. Pick a throwaway test client name (e.g. "test-client").
2. Make a private GitHub repo `newmindsgroup/test-client` to be the kickoff target.
3. Set up a small test Drive folder with 3-5 sample documents (a mock proposal, a mock contract, a mock briefing note).
4. Run kickoff-orchestrator.md against that folder.
5. Verify the output: repo populated, dashboard live, memory populated, lint green.
6. Throw the test repo away (`vercel projects rm test-client-blueprint`, archive the GitHub repo).

After the test, you'll know:

- How long kickoff takes for your typical folder size.
- Where the AskUserQuestion calls land.
- Where any tuning is needed for your org.

## Where to keep your tuned copies

Recommended:

- A private Notion or Google Doc your orchestration-agent operator keeps bookmarked.
- A `prompts/` folder in your firm-internal Git repo (separate from this template).
- 1Password / Bitwarden secure note (if you don't want them in plain Drive).

Do NOT keep tuned copies in the per-engagement repos. Those repos are subject to client visibility (audit, transfer at engagement end), and your firm's prompt library shouldn't be exposed there.
