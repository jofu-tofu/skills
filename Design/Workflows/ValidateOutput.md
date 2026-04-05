# ValidateOutput Workflow

> **Trigger:** "validate design output", "check output quality", "run output validation"

## Reference Material

- **Output Quality:** `../OutputQuality.md` — Format selection, density, anti-AI patterns.
- **Design Principles:** `../Principles.md` — Foundation qualities, guardrails.
- **Layer Toolbox:** `../Standards/LayerToolbox.md` — Situational tools (for checking layer appropriateness).

## Purpose

Self-validation mini-workflow for design artifacts. Auto-chained by CreateDesign and RecordDecision. Also user-triggerable directly.

The same agent that generated the document runs this as a self-check. On FAIL, revise the document inline before delivering.

## Input Interface

- `artifact` (string) — The completed design document or ADR to validate
- `scale` (quick | standard | full) — Controls which checks run

---

## Workflow Steps

### Step 1: Load Rules

Read `../OutputQuality.md` and `../Principles.md`. Internalize format selection, density principles, banned patterns, foundation qualities, and guardrails before evaluating.

### Step 2: Run Gate 1 — Substance Gate

The Substance Gate holds veto power. If the document fails substance checks, it cannot proceed to the Acceptance Gate. Process these as a batch.

Eight binary checks. Each produces PASS or FAIL.

| Check | What It Tests | PASS Criteria |
|-------|--------------|---------------|
| **Section-Relevance** | Every section carries specific, non-obvious information | No section could be swapped into a different design doc without anyone noticing. No "Could" section (per OutputQuality.md §3) is present without specific content. |
| **Layer-Cake** | Headers tell a coherent story alone | Headers form a standalone narrative (not generic labels like "Overview" or "Details") |
| **Format-Shape** | Each section uses correct format per OutputQuality.md | Every section matches its data shape per the Section Format Defaults |
| **Density** | No paragraph compressible without meaning loss | No hedging, throat-clearing, or compressible paragraphs found |
| **AI-ism** | No banned vocabulary or structural patterns | Zero banned terms or patterns from the Banned Vocabulary section |
| **Compression** | No sentence fails the Signal Tests (falsifiability, one-new-fact, prediction, state-once) | Zero sentences that are unfalsifiable, predictable from heading, or duplicate |
| **Coherence** | Adjacent paragraphs have logical flow | Every paragraph pair can accept 'because', 'therefore', 'however', or 'for example' between them |
| **Evidence-Grounding** | Claims of superiority trace to evidence | Every claim that one option is better than another traces to precedent, metric, or citation |

### Step 3: Run Gate 2 — Acceptance Gate

Runs only after Gate 1 passes. Process these as a batch: verify foundation qualities, then check guardrails and reviewer fit together.

| Check | What It Tests | PASS Criteria |
|-------|--------------|---------------|
| **Foundation Coverage** | All 6 foundation qualities are present | Narrative framing (compelling opening), honest trade-offs (genuine alternatives), evidence hierarchy (claims traced to sources), co-creation tone ("we" language, no adversarial framing), visual element (at least one diagram/table/chart), explicit ask (specific decision request at end) |
| **Guardrail Compliance** | The 5 guardrail rules are satisfied | Urgency is earned, momentum tools within scale limit, concessions are genuine, dominant type leads for hybrids, scaffolding is invisible |
| **Concern Coverage** | Each reviewer's blocking concerns are addressed | When reviewers are identified in the document, each blocking concern is addressed with evidence matched to that reviewer's trust profile. SKIP if no reviewer information is available. |
| **Reactance Check** | No passage feels like visible persuasion | Re-read as a skeptical outsider. Does any passage feel like it's trying to sell rather than inform? Flag any passage where the persuasion technique is detectable. |

### Step 4: Scale Calibration

| Scale | Gate 1 Checks | Gate 2 Checks | Enforcement |
|-------|--------------|---------------|-------------|
| **Quick** (ADR) | Format-Shape, Density, AI-ism, Compression (4 checks) | None | Fix before delivery |
| **Standard** | All 8 checks | Foundation Coverage, Guardrail Compliance (2 checks) | Fix before delivery |
| **Full** | All 8 checks | All 4 checks | Fix before delivery; higher scrutiny |

For Quick scale, skip Section-Relevance, Layer-Cake, Coherence, and Evidence-Grounding from Gate 1, and skip Gate 2 entirely.

Standard scale runs 10 checks total. This is the practical ceiling — do not add more checks at this scale.

### Step 5: Fix Failures

On any FAIL result:
1. Identify the specific violation (section, paragraph, or term)
2. Revise the artifact inline to fix it
3. Note what was found and what was changed

Do not deliver an artifact with known FAIL results. Fix first, then deliver.

### Step 5.5: Run Compression Protocol

Run the four-level Compression Protocol from `../OutputQuality.md` Section 6:

1. **Lexical**: Replace wordy phrases per the Wordy Phrase Table
2. **Sentential**: Delete sentences that fail Signal Tests (Section 5)
3. **Structural**: Remove template-filler sections with no specific content
4. **Conceptual**: Collapse repeated case descriptions into pattern + table

Then run the Coherence Gate from `../OutputQuality.md` Section 9. Fix any paragraph pairs that lack logical connectives.

### Step 6: Append Self-Check Summary

After the design artifact, append this summary:

```markdown
### Self-Check Summary

**Gate 1 — Substance:**
| Check | Result | Notes |
|-------|--------|-------|
| Section-Relevance | PASS/FAIL | [generic section found + removed, or "—"] |
| Layer-Cake | PASS/FAIL | [brief finding or "—"] |
| Format-Shape | PASS/FAIL | [section name + issue, or "—"] |
| Density | PASS/FAIL | [paragraph cited + fix applied, or "—"] |
| AI-ism | PASS/FAIL | [term/pattern found + replacement, or "—"] |
| Compression | PASS/FAIL | [sentences removed + reason, or "—"] |
| Coherence | PASS/FAIL | [paragraph pair fixed + connective added, or "—"] |
| Evidence-Grounding | PASS/FAIL | [ungrounded claim found + fix, or "—"] |

**Gate 2 — Acceptance:**
| Check | Result | Notes |
|-------|--------|-------|
| Foundation Coverage | PASS/FAIL | [missing quality + fix, or "—"] |
| Guardrail Compliance | PASS/FAIL | [violation found + fix, or "—"] |
| Concern Coverage | PASS/FAIL/SKIP | [unaddressed concern + fix, or "—"] |
| Reactance Check | PASS/FAIL | [visible scaffolding found + rewrite, or "—"] |
```

For Quick scale, show only the 4 applicable Gate 1 checks and omit the Gate 2 table.
For Standard scale, show all Gate 1 checks and the 2 applicable Gate 2 checks.

---

## Override Policy

Format and vocabulary rules allow justified exceptions. If an agent intentionally uses prose where the guide says table (e.g., a narrative Approach section that genuinely needs prose flow), it may do so with a brief inline justification. The rule is "match data shape" — when the data shape genuinely IS narrative, prose is correct.

Guardrail violations (Gate 2, Guardrail Compliance) cannot be overridden. If a guardrail is triggered, the passage must be revised.
