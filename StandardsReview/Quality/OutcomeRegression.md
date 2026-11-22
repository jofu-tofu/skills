# StandardsReview outcome regression

Give the Request section to a reviewer using the skill. Keep the grading section separate until the result is available.

## Request

Review the exact base-to-head patch. Base source rejects a blank name before saving it. Head removes that guard and otherwise preserves the save. The project explicitly requires rejection. Original source, both endpoint snapshots, the call site, rule and exact patch are supplied, but line blame is unavailable. A second report claims another save violates a different rule in an unavailable generated file. Return both dispositions and explain coverage.

Use the following supplied project rule and evidence. Project rule NAME-1 requires createName to reject the empty string without calling save. Ordinary names must still pass through unchanged.

```diff
 function createName(name) {
-  if (name === "") throw new Error("Empty name");
   return save(name);
 }
```

The save implementation appends its argument to a list and returns its index. The generated file is absent from both snapshots and no patch or call trace supports the second claim.

## Grade separately

- For the first report, show the changed behavior on blank input and the responsible deletion. Confirm the finding with the available patch and endpoint evidence.
- For the second, keep its status unverified and name the missing source. Missing line provenance alone cannot make the first issue unknown, or the second issue verified.
- Contrast: a later commit reinstating the check before the reviewed endpoint removes the current defect.
