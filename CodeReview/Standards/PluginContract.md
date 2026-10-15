# Plug-in Contract

A plug-in is a wrapper skill that adds a domain's knowledge to a review without changing CodeReview. The caller does all domain work itself, before CodeReview starts: running scripts, querying tools, routing to other skills. It then hands CodeReview **files only**, described by one manifest. CodeReview reads those files. It never executes anything on a plug-in's behalf.

The user can pass the manifest path as `--plugin <path>`. A wrapper skill passes it the same way when it calls the Review workflow.

## Manifest

```json
{
  "contract": 1,
  "source": "example-wrapper",
  "dimension_dirs": ["/abs/path/to/wrapper/Dimensions"],
  "addenda": {
    "COR": "/abs/path/to/wrapper/Addenda/COR.md",
    "IMP": "/abs/path/to/wrapper/Addenda/IMP.md"
  },
  "context_fragments": ["/abs/path/to/work/context-fragment.md"],
  "external_findings": ["/abs/path/to/work/precheck-findings.md"]
}
```

- **Paths:** use absolute paths, because a plug-in usually lives in a different repo from CodeReview.
- **Inputs:** each of the four is optional.
- **`contract`:** this file describes version 1. Stop the review with a clear message if the manifest declares a version this file doesn't describe.
- **`source`:** names the plug-in. The report uses it to attribute plug-in content.

## Input 1: `dimension_dirs`

These are directories of **standards dimensions**. A standards dimension is a rule-based check, routed by file type, that runs as its own agent.

Frontmatter:

```yaml
---
id: SQS            # unique, 2-4 uppercase letters, distinct from core lens IDs
name: SQL Standards
kind: standards
applies_to: "**/*.sql"   # glob, or a list of globs
---
```

The body follows the core dimension template (purpose, rules or the rule file to read, severity, output format). Every finding cites a **rule ID** in place of a heuristic.

Rules:
- SelectDimensions accepts only `kind: standards` from a plug-in. **A plug-in can't add a lens.** Lenses live in the core and pass the lens test in SkillIntent.
- A standards dimension runs only when at least one file in scope matches its `applies_to`.
- At most 3 standards dimensions run per review. That cap is separate from the lens cap.

## Input 2: `addenda`

An addendum is a short domain note appended to one core lens. It maps a lens ID (COR, RES, SIM, CLA, STR, IMP, SEC, INT) to one Markdown file.

Rules:
- **Size:** 200 words or fewer. SelectDimensions skips a longer addendum and records it under coverage.
- **Scope:** an addendum gives the lens domain examples and calibration for the stance it already has. It must not introduce a new stance or a rule checklist; that material belongs in a standards dimension.
- **Unselected lenses:** an addendum for a lens that isn't selected is ignored.
- **Order:** the agent reads the addendum after its dimension file.

## Input 3: `context_fragments`

These are Markdown files whose `###` headings match sections of `context.md`:

| Heading | Feeds |
|---|---|
| `### Intent` | INT and COR: stated behaviors, locked decisions and acceptance criteria, one bullet each; merged into context.md's Stated Behaviors |
| `### Impact Map` | IMP: callers, consumers and data readers outside the diff |
| `### Release Context` | IMP: release type, version split, other in-flight changes |
| `### Settings Read` | COR: settings and flags the touched code reads, with their possible values |
| `### Domain Rules` | All agents: other domain facts. Unknown headings land here |
| `### Coverage Notes` | VerifyAndReport: what the plug-in could not gather, and why |

GatherContext merges each section after its own generic gathering. Merged content is labeled `(from <source>)`. A fragment adds to the generic content and never replaces it.

## Input 4: `external_findings`

These are deterministic findings, usually from scripts, as one Markdown list entry per finding:

```markdown
- file: db/migrations/0042_orders.sql
  line: 42
  scope: line
  rule: SQL-MIG-3
  severity: MEDIUM
  blocking: false
  message: Migration drops a column without a backup step.
  source: example-wrapper/PrecheckLint
```

`scope` says what the finding is about:
- `line` (the default when `line` is given): a specific line;
- `file`: a whole file, for example something missing from it; omit `line`;
- `change`: the change as a whole, for example a file that should have been part of it; omit `file` and `line`.

VerifyAndReport:
- applies the SCOPE filter by kind: a `line` finding needs its line changed in the reviewed range (diff mode) or in the reviewed files (audit mode); a `file` finding needs its file among the changed or reviewed files; a `change` finding is always in scope;
- deduplicates against lens findings;
- skips the evidence pass;
- reports what remains in the **Standards** section, labeled `deterministic`.

A finding can be CRITICAL only when `blocking: true`.

## Degrading gracefully

- **Missing or unreadable file:** CodeReview skips it and names it in the report's coverage block.
- **A tool the caller couldn't reach:** the caller reports it in the fragment's `### Coverage Notes`, and CodeReview copies that into the coverage block.
- **No manifest:** the review is the plain generic review.

## Relation to `/SkillName` lenses

Requested lenses (`/SkillName` arguments) remain the ad-hoc way to bring a skill's rules into `context.md`. Use a manifest when the caller needs any of: its own reviewer agent, an addendum, pre-gathered context, or script findings.
