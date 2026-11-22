# Review a proposed interface

Use this route for a concrete API or module sketch in chat or a document. Anchor findings to quoted calls, signatures or stated obligations. Describe design consequences as inferences.

1. Read the Structure dimension. Trace an ordinary caller and a supported extension or replacement through the interface. Identify who owns naming, identity, timing and policy where relevant. Check which details a caller must learn or repeat and which can change inside one module.
2. Try a concrete substitution the proposal promises. Identify which public calls or extensions would need edits and why. A string or distinct method alone is insufficient evidence. Preserve choices with different domain meanings and public identifiers intentionally shared across systems.
3. For each finding, show the caller obligation, the change it propagates and the smallest correction that hides that knowledge. Show the resulting caller expression when helpful. Check that the correction actually removes the obligation from ordinary callers.
4. Separate observations about the sketch from unknown implementation details. Report scope and uncertainty even when no change is warranted. Verify actual code through the diff or audit workflow once available.
