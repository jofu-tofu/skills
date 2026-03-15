# ValidateOutput Workflow

> **Trigger:** "validate design output", "check output quality", "run output validation"

## Reference Material

- **Output Quality:** `../OutputQuality.md` — Format selection, density, anti-AI patterns.

## Purpose

Self-validation mini-workflow for design artifacts. Auto-chained by CreateDesign and RecordDecision. Also user-triggerable directly.

The same agent that generated the document runs this as a self-check. On FAIL, revise the document inline before delivering.

## Input Interface

- `artifact` (string) — The completed design document or ADR to validate
- `scale` (quick | standard | full) — Controls which checks run

---

## Workflow Steps

### Step 1: Load Rules

Read `../OutputQuality.md`. Internalize format selection, density principles, and banned patterns before evaluating.

### Step 2: Run Checks

Seven binary checks. Each check produces PASS or FAIL.

| Check | What It Tests | PASS Criteria |
|-------|--------------|---------------|
| **Section-Relevance** | Every section carries specific, non-obvious information | No section could be swapped into a different design doc without anyone noticing. No "Could" section (per OutputQuality.md §3) is present without specific content. |
| **Layer-Cake** | Headers tell a coherent story alone | Headers form a standalone narrative (not generic labels like "Overview" or "Details") |
| **Format-Shape** | Each section uses correct format per OutputQuality.md | Every section matches its data shape per the Section Format Defaults |
| **Density** | No paragraph compressible without meaning loss | No hedging, throat-clearing, or compressible paragraphs found |
| **AI-ism** | No banned vocabulary or structural patterns | Zero banned terms or patterns from the Banned Vocabulary section |
| **Compression** | No sentence fails the Signal Tests (falsifiability, one-new-fact, prediction, state-once) | Zero sentences that are unfalsifiable, predictable from heading, or duplicate |
| **Coherence** | Adjacent paragraphs have logical flow | Every paragraph pair can accept 'because', 'therefore', 'however', or 'for example' between them |

### Step 3: Scale Calibration

| Scale | Checks Applied | Enforcement |
|-------|---------------|-------------|
| **Quick** (ADR) | Format-Shape, Density, AI-ism, Compression (4 checks) | Fix before delivery |
| **Standard** | All 7 checks | Fix before delivery |
| **Full** | All 7 checks | Fix before delivery; higher scrutiny |

For Quick scale, skip the Section-Relevance, Layer-Cake, and Coherence checks entirely.

### Step 4: Fix Failures

On any FAIL result:
1. Identify the specific violation (section, paragraph, or term)
2. Revise the artifact inline to fix it
3. Note what was found and what was changed

Do not deliver an artifact with known FAIL results. Fix first, then deliver.

### Step 4.5: Run Compression Protocol

Run the four-level Compression Protocol from `../OutputQuality.md` Section 5:

1. **Lexical**: Replace wordy phrases per the Wordy Phrase Table
2. **Sentential**: Delete sentences that fail Signal Tests (Section 4)
3. **Structural**: Remove template-filler sections with no specific content
4. **Conceptual**: Collapse repeated case descriptions into pattern + table

Then run the Coherence Gate from `../OutputQuality.md` Section 8. Fix any paragraph pairs that lack logical connectives.

### Step 5: Append Self-Check Summary

After the design artifact, append this summary:

```markdown
### Self-Check Summary
| Check | Result | Notes |
|-------|--------|-------|
| Section-Relevance | PASS/FAIL | [generic section found + removed, or "—"] |
| Layer-Cake | PASS/FAIL | [brief finding or "—"] |
| Format-Shape | PASS/FAIL | [section name + issue, or "—"] |
| Density | PASS/FAIL | [paragraph cited + fix applied, or "—"] |
| AI-ism | PASS/FAIL | [term/pattern found + replacement, or "—"] |
| Compression | PASS/FAIL | [sentences removed + reason, or "—"] |
| Coherence | PASS/FAIL | [paragraph pair fixed + connective added, or "—"] |
```

For Quick scale, omit the Section-Relevance, Layer-Cake, and Coherence rows.

---

## Override Policy

Format and vocabulary rules allow justified exceptions. If an agent intentionally uses prose where the guide says table (e.g., a narrative Approach section that genuinely needs prose flow), it may do so with a brief inline justification. The rule is "match data shape" — when the data shape genuinely IS narrative, prose is correct.
