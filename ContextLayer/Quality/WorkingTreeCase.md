# Drift with an unchanged commit count

Give the evaluator only the request and fixture. Review the returned assessment against the checks below.

## Request

Check whether the context under `app/` may be stale. Use the cheap read-only Drift workflow. Identify which paths warrant an audit.

## Fixture

The last review is at HEAD, the recorded commit count matches, and the stored file and extension counts match. The project contains `app/AGENTS.md`, `app/routes.ts`, `app/types.ts`, and `other/AGENTS.md`. In a disposable Git repository, stage an edit to `app/routes.ts`, leave a second unstaged edit to that same file, and leave an unstaged edit to `other/AGENTS.md`. Leave `app/types.ts` untouched. No commits follow the review. Repeat from the same HEAD with only the sibling edit present. Do not read source contents or modify any files during either assessment.

## Checks

- In the first run, flag local changes to the in-scope route as a reason to audit its context. The signal alone cannot establish which statement is wrong.
- In the second run, the sibling edit alone cannot create an in-scope drift finding.
- Both runs keep content, Git index and history intact. A successful clean history lookup cannot mask an unavailable working-tree check.
