# PromoteArtifact Workflow

> **Trigger:** "promote this artifact", "make this a decision", "mark as source backed", "archive this note"

## Reference Material

- **Continuity Principles:** `../Standards/ContinuityPrinciples.md` — trust rubric, promotion authority, and anti-patterns
- **Properties:** `../Properties.md` — YAML/frontmatter and property types
- **Syntax:** `../Syntax.md` — wikilinks and backlinks

## Purpose

Move or relabel an artifact across trust levels without silently changing authority. Promotions that add structure may proceed when requirements are met; promotions that add authority require explicit user confirmation. After promotion, prune duplicate active lower-trust material so the workspace keeps one clear active artifact.

## Workflow Steps

### Step 1: Read local authority

Read the nearest project `AGENTS.md` first. Its routing and authority rules override generic examples in this workflow.

### Step 2: Identify current and target trust/status

Determine current `trust_level`, `status`, `artifact_type`, source links, and folder location. If missing, infer cautiously and report the inference. Trust is authority/evidence level; status is lifecycle state such as `active`, `draft`, `accepted`, `final`, `superseded`, or `archived`.

Use the action rule:

```text
T0/T1 = inputs
T2 = evidence
T3 = working direction
T4 = authority
T5 = deliverable
```

### Step 3: Check promotion authority

Agents may perform these promotions when conditions are met:

| Promotion | Allowed Condition |
|---|---|
| T0 -> T1 | Link back to raw source |
| T1 -> T2 | Add provenance or citations for claims |
| T2 -> T3 | Mark assumptions and open questions |
| T4 -> T5 | Link final artifact to accepted decisions |

Agents must ask before:

- promoting anything to T4 decision
- marking an accepted decision as superseded
- setting active project material to `status: archived`
- resolving conflicting decisions

If the user has already said "this is the decision", "lock that in", "treat this as accepted", or equivalent, that counts as explicit confirmation for T4.

### Step 4: Preserve provenance

Promotion should link, copy, or summarize with backlinks rather than overwrite lower-trust material. Keep source notes and raw captures available for audit.

Required fields for promoted artifacts:

```yaml
trust_level:
artifact_type:
status:
created:
updated:
source:
human_confirmed:
related_decisions:
supersedes:
superseded_by:
```

### Step 5: Prune old active material

After the promoted artifact exists and provenance links are preserved, remove duplicate active material.

Agents may delete the old artifact when it is:

- scratch or inbox material whose content was fully captured elsewhere
- a duplicate working draft replaced by the promoted artifact
- temporary agent research fully represented in a source-backed note, decision, or final artifact
- an empty shell left behind by move/merge work

Agents should archive or mark superseded instead of deleting when the old artifact has:

- unique source quotes, links, or evidence
- rationale not copied into the promoted artifact
- historical context needed to understand a decision
- prior accepted authority, such as an old decision

Preserve raw sources, source-backed notes, accepted decisions, and final artifacts unless the project `AGENTS.md` explicitly allows deletion. If deletion would break the provenance chain, archive and backlink instead.

### Step 6: Apply target template

For T2 source-backed notes, include:

```markdown
## Source

## Claims

## Evidence

## Uncertainties

## Related Decisions
```

For T4 decisions, include:

```markdown
## Context

## Decision

## Rationale

## Alternatives Considered

## Consequences

## Supporting Sources

## Supersession
```

For T5 final artifacts, include links to the accepted decisions and source-backed notes it depends on.

### Step 7: Update backlinks and index

Update `_index.md` or suggest the exact update when a canonical decision, final artifact, or supersession changes.

### Step 8: Report

Return:

- source artifact and target artifact
- promotion performed or confirmation needed
- trust-level and status change
- provenance links retained
- old active artifact deleted, archived, superseded, or retained with reason
- conflicts or missing evidence
