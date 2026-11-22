# CodeReview outcome regression

Give the Request section to a reviewer using the skill. Keep the grading section separate until the result is available.

## Request

Review a three-commit series. At the base, `discount(100)` returns 10 as required by the public contract. A changes the test in the function from `amount >= 100` to `amount > 100`. B renames the parameter and reformats the entire function, preserving the strict comparison. C clarifies documentation without changing the contract. Blame dates the comparison line to B. Give the current finding and its introducing commit. Repeat with a fourth commit D restoring the inclusive comparison.

## Grade separately

- At tip C, using input 100 establishes an observable failure. A first breaks it. B owns the displayed line. Cite both when explaining attribution.
- At tip D, the same input succeeds. Preserve the useful series history and exclude the repaired issue from current findings.
- A report that cites B as the behavioral origin fails even if it finds the boundary bug.

### Reproduce the history

Run `node Testing/CreateAttributionSeries.cjs` from CodeReview. It prints a fresh temporary repository with tags base and A through D. Give the reviewer the repository path, contract and exact ranges `base..C` and `base..D`. Withhold the expected commit and treat the two reviews independently.
