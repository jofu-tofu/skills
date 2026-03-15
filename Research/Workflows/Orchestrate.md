# Orchestrate Workflow

> **Trigger:** "literature review", "find papers", "what does the research say",
> "academic research", "evidence map", "survey the literature"

## Reference Material

- **Landscape Scan:** `LandscapeScan.md`
- **Deep Expansion:** `DeepExpand.md`
- **Evaluate:** `Evaluate.md`
- **Synthesize:** `Synthesize.md`
- **Evidence Standard:** `../Standards/EvidenceStandard.md`

## Purpose

Orchestrate the multi-step literature review pipeline. Creates the output
directory, dispatches agents with file paths, parses seed papers between
waves, and checks artifacts exist. Heavier than a thin orchestrator — it
does question decomposition and seed extraction — but never edits agent
output content.

## Workflow Steps

### Step 0: Frame the Question + Create Output Directory

```bash
RESEARCH_DIR=_output/research/[YYYYMMDD-HHMMSS]-[topic-slug]
mkdir -p $RESEARCH_DIR
```

Decompose the user's research question:

1. State the core question in one sentence
2. Identify 3-5 key concepts (noun phrases that must appear in relevant papers)
3. Generate synonym sets for each concept
4. Determine the native field
5. Identify 2-3 adjacent fields that might study similar problems

**Check local knowledge first.** Before launching any agents, search the
local codebase and any prior research artifacts for relevant prior work:
- Search `_output/research/` for past research on related topics
- Search the working directory for related code, skills, or documentation
- If relevant local context exists, include it in `question.md`

Write `$RESEARCH_DIR/question.md`:

```markdown
# Research Question

## Core Question
[one sentence]

## Key Concepts
- [concept]: [synonym1, synonym2, synonym3]
- [concept]: [synonym1, synonym2, synonym3]

## Native Field
[field name]

## Adjacent Fields
- [field]: [why it might study this]
- [field]: [why it might study this]

## Local Context Found
[any relevant prior work, existing code, or past research artifacts]
[or "None found"]
```

### Step 1: Landscape Scan (3 Parallel Agents)

Spawn 3 agents. Each reads `question.md` and writes to its own output file.

```
Agent A (keyword):
  Read Workflows/LandscapeScan.md. You are Agent A (keyword).
  Read $RESEARCH_DIR/question.md for context.
  Write results to: $RESEARCH_DIR/landscape-keyword.md

Agent B (semantic):
  Read Workflows/LandscapeScan.md. You are Agent B (semantic).
  Read $RESEARCH_DIR/question.md for context.
  Write results to: $RESEARCH_DIR/landscape-semantic.md

Agent C (reviews):
  Read Workflows/LandscapeScan.md. You are Agent C (reviews).
  Read $RESEARCH_DIR/question.md for context.
  Write results to: $RESEARCH_DIR/landscape-reviews.md
```

**Wait for all three.** Verify each file exists and is non-empty.

**Fallback:** If web search fails for any agent, the agent should fall back
to training knowledge with explicit confidence markers:
`[FROM TRAINING — verify via web search]` for each paper.

### Orchestrator: Parse + Build Seed Context

The orchestrator reads all three `landscape-*.md` files (this is the one
step where the orchestrator reads agent output). Extract and deduplicate:

1. Papers found by 2+ agents → highest relevance
2. New vocabulary discovered
3. Existing systematic reviews flagged
4. Preliminary landscape assessment

**Saturation check format** — count unique papers per agent:

```markdown
## Saturation Check
- Agent A unique papers: [N]
- Agent B unique papers: [N]
- Agent C unique papers: [N]
- Overlap (found by 2+): [N]
- Total unique: [N]
```

**Thin-evidence gate:** If total unique papers < 5, switch to thin-evidence
path — run a single targeted expansion agent instead of full Wave 2. Note
the evidence limitation prominently.

Write `$RESEARCH_DIR/seed-papers.md`:

```markdown
# Seed Papers

## Papers (ranked by relevance)

### 1. [Author (Year)] "Title"
- **Venue:** [journal/conference]
- **Type:** [empirical / review / meta-analysis]
- **Found by:** [agents A, B, C]
- **Key terms:** [terms from this paper]
- **Relevance:** [one sentence]

[continue for all unique papers]

## Vocabulary Discovered
- [term]: [meaning, which agent found it]

## Existing Reviews Found
- [review paper, with notes on recency/quality]

## Saturation Check
[from above]

## Landscape Assessment
- Major schools of thought: [list]
- Key debates: [list]
- Apparent gaps: [list]
```

### Step 2: Deep Expansion (4 Parallel Agents)

Spawn 4 agents. Each reads `seed-papers.md` and writes to its own file.

```
Agent D (backward citations):
  Read Workflows/DeepExpand.md. You are Agent D (backward citations).
  Read $RESEARCH_DIR/seed-papers.md for seeds.
  Write results to: $RESEARCH_DIR/expansion-backward.md

Agent E (forward citations):
  Read Workflows/DeepExpand.md. You are Agent E (forward citations).
  Read $RESEARCH_DIR/seed-papers.md for seeds.
  Write results to: $RESEARCH_DIR/expansion-forward.md

Agent F (cross-domain):
  Read Workflows/DeepExpand.md. You are Agent F (cross-domain).
  Read $RESEARCH_DIR/seed-papers.md for seeds.
  Read $RESEARCH_DIR/question.md for adjacent fields.
  Write results to: $RESEARCH_DIR/expansion-crossdomain.md
  Note: Also discover your own adjacent fields beyond what question.md lists.

Agent G (adversarial):
  Read Workflows/DeepExpand.md. You are Agent G (adversarial).
  Read $RESEARCH_DIR/seed-papers.md for seeds.
  Write results to: $RESEARCH_DIR/expansion-adversarial.md
```

**Wait for all four.** Verify each file exists and is non-empty.

**Saturation check:** The orchestrator scans expansion files for overlap
with seed-papers.md.

```markdown
## Wave 2 Saturation
- Papers already in seeds: [N]
- New unique papers: [N]
- Saturation ratio: [overlap / total]
- Assessment: [saturated (>80% overlap) | moderate | unsaturated (<50% overlap)]
```

If unsaturated and the user hasn't constrained time, consider running a
second expansion round using newly discovered seeds.

### Step 3: Evaluate (1 Agent)

Spawn one agent to triage and assess the evidence.

```
Read Workflows/Evaluate.md.
Read ALL files in $RESEARCH_DIR/:
  - question.md
  - seed-papers.md
  - expansion-backward.md
  - expansion-forward.md
  - expansion-crossdomain.md
  - expansion-adversarial.md

Write evaluation to: $RESEARCH_DIR/evaluation.md
```

**Wait for completion.** Verify file exists.

### Step 4: Synthesize (1 Agent)

Spawn one agent to produce the final evidence map.

```
Read Workflows/Synthesize.md.
Read $RESEARCH_DIR/evaluation.md
Read $RESEARCH_DIR/seed-papers.md
Read $RESEARCH_DIR/question.md

Write final evidence map to: $RESEARCH_DIR/evidence-map.md
```

**Wait for completion.** Read and present `evidence-map.md` to the user.

### Step 5: Deliver + Persist

1. Present the evidence map to the user
2. Include pipeline metadata (papers per wave, unique contributions, saturation)
3. Note the output directory path so artifacts persist for future sessions
4. Recommend next steps (papers to read in full, searches not performed)

### Adaptation Rules

- **Existing systematic review found:** Flag prominently. Frame Wave 2
  results as "beyond what the existing review covers."
- **Thin evidence (<5 papers in Wave 1):** Skip full Wave 2. Run one
  targeted expansion agent. Set expectations in the evidence map.
- **Low saturation in Wave 2 (>50% new):** Note that coverage may be
  incomplete. Recommend further expansion if time allows.
- **Web search fails:** Agents fall back to training knowledge with
  `[FROM TRAINING — verify]` markers. The evidence map flags unverified
  papers in its systematic risk assessment.
