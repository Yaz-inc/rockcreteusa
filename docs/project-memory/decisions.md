# Decisions, Rockcrete USA Website Rebuild

Append-only log of meaningful decisions. Newest entry at the **bottom**. Never edit past entries. If a past decision is reversed, add a new entry that supersedes; do not rewrite history.

Entries are short by design. If a decision is architecturally significant (changes the system's shape, the team's process, or a non-negotiable constraint), also write a full ADR in `../decision-records/` and link it from the entry here.

---

## 2026-05-15 · Use the project-blueprint-template scaffold for Rockcrete USA Website Rebuild

**Decision:** Rockcrete USA Website Rebuild is initialized from `project-blueprint-template`, with the Blueprint Dashboard, project-memory knowledge base, deploy pipeline, and Drive folder-structure starter all enabled.

**Rationale:** Every engagement needs a place where the client, the team, and any reviewers can see the same project state at the same time, plus a portable AI-readable knowledge base, plus a Git scaffold that survives across tools and teammates. The template provides all of that on day zero, so we start at a known, documented baseline instead of cobbling each surface together from scratch.

**Alternatives considered:** (a) start from a blank repo, rejected because each engagement loses the prior one's improvements; (b) start from a project-type-specific starter elsewhere, rejected because we want one template that works for software, branding, website, and AI-implementation projects.

**How to apply:** Read `docs/project-memory/instructions.md` and paste it into your AI tool's project-instructions field. Read `docs/project-types/website.md` for the type-specific lifecycle.

---

<!--
Add new entries below this line in this format:

## YYYY-MM-DD · Title

**Decision:** What was decided, in one or two sentences.

**Rationale:** Why. The constraint or insight that drove the decision.

**Alternatives considered:** What we did not pick, and why.

**How to apply:** What anyone reading this should do differently because of this decision. (Optional but useful for decisions that change behavior.)

**Linked ADR:** docs/decision-records/NNNN-title.md (if architecturally significant)

---
-->
