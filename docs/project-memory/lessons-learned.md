# Lessons learned, Rockcrete USA Website Rebuild

Append-only retrospective log. Run at the end of every phase, every major milestone, and at engagement close. Captures what worked, what didn't, and what would change. Each entry is a few paragraphs, not a wall.

The lessons in this file are the engagement's most valuable export to future engagements. When a v0.X+1 of `project-blueprint-template` is cut, the recurring lessons here get backported.

**Last updated:** 2026-05-15

## How to write a good lesson

Each lesson covers four parts:

1. **What we tried.** The concrete thing the team did.
2. **What happened.** The observable outcome.
3. **What we learned.** The generalized takeaway.
4. **What we'd change.** The specific behavior to adopt or drop next time.

Keep each lesson to a small paragraph or two. If a lesson sprawls into 10 paragraphs, it's actually two or three lessons; split them.

Skip these traps:

- Lessons that are platitudes ("communicate more"). Bad. Be specific.
- Lessons that blame people. Bad. Frame structurally.
- Lessons that have no behavior change. Bad. If nothing changes, it's not a lesson.

## Categories

Tag each lesson with one or more category to help the next engagement find them:

`process`, `client`, `team`, `tech`, `tooling`, `delivery`, `scope`, `time`, `money`, `risk`, `communication`, `tooling/ai`, `closeout`.

## Lessons

### {{LESSON_DATE_1}} · {{LESSON_TITLE_1}}

**Tags:** {{LESSON_TAGS_1}}

**What we tried:** {{WHAT_WE_TRIED_1}}

**What happened:** {{WHAT_HAPPENED_1}}

**What we learned:** {{WHAT_WE_LEARNED_1}}

**What we'd change:** {{WHAT_WED_CHANGE_1}}

---

<!--
Append additional lessons below in the same format. Reverse-chronological is fine
(newest at top) so this file pairs with session-log.md. Either order works as
long as you're consistent.

## YYYY-MM-DD · <title>

**Tags:**

**What we tried:**

**What happened:**

**What we learned:**

**What we'd change:**

---
-->

## End-of-engagement retrospective

When the engagement closes, run a final retrospective and append it here. Use the four standard prompts:

- **What worked?** (List 3-5 things that worked well and we'd repeat.)
- **What didn't?** (List 3-5 things that didn't work and we'd avoid.)
- **What surprised us?** (List 3-5 things that were unexpected, regardless of valence.)
- **What would we change?** (List 3-5 specific behaviors / processes / tools to change next time.)

Include the team in this retrospective; multiple voices catch lessons one person would miss. If the client is comfortable, invite them too for a separate joint retrospective.

## Backport candidates

A subset of lessons here belong upstream in `project-blueprint-template`. Mark those explicitly:

| Lesson date | Title | Why it should be backported | Owner | Backport status |
|---|---|---|---|---|
| {{BACKPORT_DATE_1}} | {{BACKPORT_TITLE_1}} | {{BACKPORT_REASON_1}} | {{BACKPORT_OWNER_1}} | pending / submitted / merged |

When a backport is merged into the template, mark `merged` and link the PR.

## Anti-patterns surfaced

A short table of recurring "don't do this" lessons. Keep this short; quality over quantity.

| Anti-pattern | What it costs | What to do instead |
|---|---|---|
| {{ANTI_PATTERN_1}} | {{COST_1}} | {{ALTERNATIVE_1}} |

## Maintenance

- Append, never edit past lessons. If a lesson turns out to be wrong, add a new lesson that supersedes (and reference the old one).
- Run a retrospective at every phase close, not just engagement close. Catching lessons earlier means applying them mid-engagement.
- Surface backport candidates as PRs to `github.com/newmindsgroup/project-blueprint-template` when the engagement closes. Future engagements benefit.
