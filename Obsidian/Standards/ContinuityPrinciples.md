# Continuity Principles

## Working Memory Is The Bottleneck

**WHY:** Long-running project work fails when the human has to remember which notes are raw inputs, which are agent guesses, which are source-backed, and which are actual decisions. The continuity system exists to reduce restart cost by making authority visible in the file structure, properties, backlinks, and project `AGENTS.md` rules.

**WHAT:** Capture sessions into durable artifacts with explicit summary, decisions, open questions, next actions, and source links. Separate evidence from working judgment and decisions. Retrieval should prefer accepted decisions and final artifacts first, then source-backed notes, then working notes, then raw captures.

**ANTI-PATTERN:** Memory soup: all notes are stored together, so every resumed session requires human re-interpretation.

**TEST:** Can an agent resume the project and identify the authoritative decision without asking the user to reconstruct history?

**Sources:** User research brief, "Continuity Systems for Working With AI Agents"; user design direction in this session.

## Trust Means Authority To Act

**WHY:** Confidence is not the same as authority. Agent research can be careful and still be low-trust because no human accepted it; a short decision record can be high-trust because it controls what future agents may do.

**WHAT:** Assign trust levels by what an agent may do without asking or re-verifying. Use this rubric:

| Level | Name | Meaning | Agent May Use It To | Agent Must Not Do |
|---|---|---|---|---|
| T0 | Raw Capture | Unprocessed input: pasted text, transcript, screenshot, log, source dump | Preserve, quote, extract, summarize with citation | Treat as interpreted or decided |
| T1 | Agent Research | Agent-generated findings, web research, synthesis, hypotheses | Inform analysis, propose options, surface uncertainty | Treat as fact without source check or human confirmation |
| T2 | Source-Backed Note | Claims tied to identifiable source material | Cite as evidence, compare sources, support recommendations | Treat as a project decision |
| T3 | Working Judgment | Current plan, draft spec, analysis, open design direction | Continue work, draft artifacts, identify likely next steps | Override accepted decisions |
| T4 | Decision | Human-confirmed decision with rationale, date, and status | Act as authoritative, resolve conflicts, guide implementation | Override without explicit supersession |
| T5 | Final Artifact | Published or delivered output derived from decisions | Reuse as canonical deliverable or external-facing artifact | Modify casually without checking decision/source basis |
| T9 | Archived | Retained history, inactive or superseded | Use for historical context only | Use as current guidance unless restored |

**ANTI-PATTERN:** Confidence laundering: a polished research note becomes authoritative because it sounds complete.

**TEST:** Does the artifact's trust level say what an agent can safely do next?

**Sources:** User trust-rubric discussion in this session.

## Promotion Adds Structure Or Authority

**WHY:** Agents can safely add structure, provenance, and synthesis, but only the user can grant project authority. This keeps the system useful without making every note movement require manual approval.

**WHAT:** Apply this promotion authority:

| Promotion | Agent Authority | Required Condition |
|---|---|---|
| T0 -> T1 | Allowed | Link back to raw source |
| T1 -> T2 | Allowed | Claims have identifiable provenance or citations |
| T2 -> T3 | Allowed | Mark assumptions and open questions |
| T3 -> T4 | Ask first | User explicitly confirms the decision |
| T4 -> T5 | Allowed when direct | Artifact implements accepted decisions and links back to them |
| Any current artifact -> T9 | Ask for important material | Add archive reason or supersession link |

Use the action rule: T0/T1 are inputs, T2 is evidence, T3 is working direction, T4 is authority, T5 is deliverable, and T9 is history.

**ANTI-PATTERN:** Silent authority escalation: an agent writes `accepted` or `decision` because a plan seems reasonable.

**TEST:** Would a promotion change what future agents are allowed to do? If yes, did the user authorize it?

**Sources:** User promotion-authority discussion in this session.

## Stable Layers, Flexible Subfolders

**WHY:** Projects vary in weight. A small project may not need meeting-note folders; a large project may need meetings, interviews, source documents, exports, and presentations. The first layer should remain stable so agents do not relearn the model for every project.

**WHAT:** Use stable first-class folders by workflow/trust layer, then add project-specific second-layer folders only when useful. Recommended first layer:

```text
<Project>/
  AGENTS.md
  _index.md
  00-inbox/
  10-sources/
  20-working/
  30-decisions/
  40-artifacts/
  90-archive/
```

Examples of second-layer folders include `10-sources/meetings/`, `10-sources/research/`, `20-working/session-recaps/`, `20-working/open-questions/`, `30-decisions/accepted/`, `30-decisions/superseded/`, `40-artifacts/drafts/`, and `40-artifacts/final/`.

**ANTI-PATTERN:** Taxonomy sprawl: every project invents unrelated top-level folders, so agents cannot infer trust or workflow stage.

**TEST:** Can an agent identify artifact authority from the top-level folder and project specifics from the second layer?

**Sources:** User folder-flexibility discussion in this session.

## Context Layer Owns Routing

**WHY:** A reusable Obsidian skill cannot know which folders a specific project needs. The nearest project `AGENTS.md` is the right place to tell agents where to put project artifacts, which subfolders exist, and what promotion authority applies locally.

**WHAT:** The skill provides the rubric and templates. The project `AGENTS.md` declares actual folders, project profile, artifact routing, promotion authority, canonical files, and maintenance rules. Agents without the skill should still be able to follow the project `AGENTS.md` and avoid trust-level mistakes.

**ANTI-PATTERN:** Skill-owned taxonomy: a global skill leaks one project's folder structure into unrelated vault projects.

**TEST:** If an agent never loads this skill but reads the project `AGENTS.md`, can it still route research, decisions, and artifacts correctly?

**Sources:** Obsidian SkillIntent routing boundary; user request to put rubric and promotion authority in the context layer.
