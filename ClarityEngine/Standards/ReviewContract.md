# Review Contract

Every lens reviewer follows this contract, and the Verifier applies its evidence standard and severity scale. It defines what counts as a finding, how severe it is, and how to report it. The rules being checked live in each lens file; this file holds only what all reviewers share.

## Stay Inside Your Inputs

As a lens reviewer, read only the files the orchestrator lists in your prompt: your lens file, this contract, and your inputs. Do not read other lens files, other reviewers' output, the author's rationale, or earlier review results. Independence is what makes agreement between reviewers meaningful. The Verifier's inputs are listed in Verify.md.

## Grade Each Check, Not the Document

For every RC in your lens, record one status with one line of evidence:

- **PASS:** The artifact meets the check. Quote or point to where.
- **FAIL:** The artifact breaks the check. Report a finding.
- **N/A:** The check does not apply to this artifact, with the reason. A check that could not run is NOT VERIFIED, not N/A.
- **NOT VERIFIED:** The check applies but you could not run it, such as a layout check on unrendered output.

Do not give numeric scores, an overall rating, or praise. A longer or more complete-seeming version is not evidence of quality.

## Evidence Standard

A finding requires all three:

1. **Location:** the section heading or slide number, plus a quote of at most two sentences from the artifact.
2. **Check:** the RC ID from your lens, or `Rendered` for a rendered defect the Visual lens reports.
3. **Reader harm:** which reader misunderstands, slows down, or acts wrongly, and why this passage causes it.

A finding that asks to add content must also name the reader question the addition answers and show that the artifact does not already answer it. "Add more context," "be more complete," and "elaborate" without a named question are not findings. Model reviewers favor longer text, so this rule applies to every lens.

**Sources:** Saito et al. 2023; Dubois et al. 2024; Steyvers et al. 2025 (longer explanations raise confidence without raising accuracy).

## Severity

- **Blocker:** Essential content is false, missing, inaccessible, or unusable.
- **Major:** The finding materially impairs understanding or use, such as an ambiguous action, a missing causal step, a lost qualification, or a buried ask.
- **Polish:** An improvement with no material effect on understanding or use.

Choose the lower severity when the reader harm is speculative. Choose the higher one when the passage sits on the reader's main path: the opening, the decision, or the ask.

## Finding Format

Write your output to the file the orchestrator names, in this format:

```markdown
# [Lens name] Review

## Check Results
| RC | Status | Evidence |
|---|---|---|
| RC-n | PASS / FAIL / N/A / NOT VERIFIED | [one line] |

## Findings

### [Short title] — [section or slide]
**Check:** RC-n
**Severity:** Blocker / Major / Polish
**Quote:** "[at most two sentences from the artifact]"
**Reader harm:** [who is affected and how]
**Fix:** [the specific change: delete, move, reword to "...", or add the answer to "[reader question]"]
```

Write only the check table and findings. When you finish, return the path to the file you wrote.
