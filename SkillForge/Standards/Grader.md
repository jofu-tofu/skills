# Grader

Assess evidence under a frozen measurement specification. This procedure applies to executable checks, human adjudication and model judgments; it does not require an LLM judge. Critique weak checks separately from grading the target.

## Inputs and authority

Read the evaluation plan, measurement IDs/versions and qualification evidence, required check IDs, reference evidence, raw outputs/transcripts, and allowed scope. Canonical output is [results.json](Schemas.md#canonical-resultsjson). The legacy grading.json format is optional and subordinate.

## Process

1. Verify candidate, reference, checker and case versions. Establish what the measure is qualified to support. If required measurement evidence is missing or inapplicable, mark the affected target inference unverified and request DesignMeasurement through the owning procedure; do not repair the target or silently change the test.
2. Inspect the relevant outputs and execution evidence, not merely the executor's claim that work succeeded. Run only authorized checks. Use independent reference evidence suited to the outcome. Model agreement, personas and fresh contexts do not themselves qualify a measure.
3. Record raw observations first. For each check, give pass, fail or unverified using the rules below, with evidence links and limitations. Preserve unresolved disputes and findings missing from an incomplete key.
4. Record run completion/errors/timeouts separately from task results. Preserve all attempts and unavailable usage as unknown. A completed run may contain unverified checks; an errored run may still contain a separately established failed check.
5. Verify consequential claims against artifacts or independent sources. Distinguish task outcomes from routing, compliance and cost. Passing a structural requirement cannot certify downstream usefulness.
6. Critique checks that reward misleading passes, reject valid alternatives, omit important outcomes or require unavailable evidence. Propose a new measurement/suite version for changes; preserve existing observations and compare affected versions under one definition. A broken checker invalidates its inference, not automatically the target behavior.
7. Write canonical check records and a report with counts of pass/fail/unverified, coverage, regressions, cost and remaining uncertainty. Return them to EvaluateCandidate. ApproveSkill owns readiness; the grader does not edit target files or declare deployment.

## Verdict rules

| Verdict | Required evidence |
|---|---|
| pass | Adequate, applicable evidence supports the declared check under its qualified method. |
| fail | Adequate, applicable evidence contradicts the declared check. |
| unverified | Evidence is absent, inaccessible, incomplete, conflicting, outside qualified scope, or the checking method is not qualified for the claim. |

Missing evidence blocks a pass; it does not establish task failure. Distinguish **observed absence** from **absence of observation**: a completed, trustworthy artifact listing showing a required file is absent can fail that file-presence check; unavailable output storage cannot. A visible wrong answer may fail a correctness check; a missing or broken test runner leaves correctness unverified. A timeout is an execution status; it can also fail a separately declared, measured deadline check. Mere stylistic mismatch or difference from a reference is not proof of incorrectness.

Partial observations remain observations: split justified subchecks or use a predeclared graded metric, without inventing partial credit afterward. Numeric measurements can accompany tri-state judgments; every number needs its unit, denominator/scale, interpretation and uncertainty. Report undefined rates rather than treating zero denominators as perfect performance.

## Canonical record example

Each run in results.json includes checks such as:

```json
{
  "case_id": "example",
  "role": "development",
  "configuration": "candidate",
  "trial": 1,
  "execution_status": "completed",
  "checks": [
    {
      "id": "contract-behavior",
      "measurement_id": "behavior-v1",
      "status": "unverified",
      "observation": "Candidate output is available; independent expected-result evidence is missing.",
      "evidence": ["outputs/result.txt"],
      "reason": "Cannot establish correctness from the candidate's own assertion."
    }
  ]
}
```

The full canonical envelope and decision rules live in Schemas.md. Distinguish instrument qualification (designed/qualified/unqualified) from target verdict (pass/fail/unverified).

## Optional legacy grading.json

Existing viewers and aggregators may require expectations with a Boolean passed field. Export only when every check in the declared export scope has a verified pass/fail verdict and the consumer is appropriate for the measurement. If any scoped check is unverified, skip the Boolean export and explain why; never coerce unknown to false/true or silently omit it to inflate a rate. Preserve canonical results regardless. Do not treat numeric outcomes or dimension tradeoffs as a binary quality score merely to fit legacy tooling.

For a compatible export, map pass to true and fail to false, retain evidence and scope, and calculate counts over that exact scope. Unsupported claims likewise remain unverified in canonical records rather than becoming false factual claims through Boolean conversion.

## Acceptance examples

- Independent execution proves a required behavior: pass for that behavior only.
- Complete output inspection proves a required deliverable absent: fail for delivery.
- No access to the output: unverified, not fail.
- Three similar model judges agree, without independent qualification: unverified for the claimed outcome.
- Valid alternative conflicts only with an overly specific reference: flag the checker, preserve unresolved target status pending adjudication.
- Mandatory check unverified: no ready/pass decision, even if all observed scores are high.
