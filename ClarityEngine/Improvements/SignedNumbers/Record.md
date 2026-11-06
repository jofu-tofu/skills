# Preserve signed numeric markers

2026-11-04. Baseline: ClarityEngine 1.5.0 at repository commit bc0ac365b860893c83971ebae69d3f7b37a78068. Candidate: 1.5.1-rc.1. Method: SkillForge UpdateSkill, bounded deterministic tool comparison. No installation/publication performed by this attempt.

## Intended outcome and mechanism

PlainRewrite must preserve quantities while making wording familiar. Its numeric gate contributes a mechanical rejection signal; the later meaning reader remains responsible for errors beyond such markers. The gate, ranker and meaning reader are complementary, not proof of complete semantic equivalence. Other outcomes remain audience comprehension, coherent reasoning, usable navigation/rendering and evidence-calibrated readiness; this change does not test those outcomes.

Baseline numeric extraction discarded signs. Direct calls admitted -5→5, +2→-2 and -0.5→0.5. The actual `decide` consumer selected “The threshold is 5 degrees after setup.” over “The threshold is -5 degrees after initialization.” The source meaning changed even though wording became plainer. A later meaning reader might catch it; that stage was not tested here.

Repair: keep unary signs and scientific exponent signs in numeric markers, including leading-dot decimals; normalize Unicode minus, redundant plus signs and omitted leading zeroes; preserve ordinary range separators. Shared extraction remains the sole owner; callers and fresh-reader requirements are unchanged.

## Evidence and qualification

Exact fixture quantities supply the reference, independently of model judgment. Qualification contrasts include faithful negative quantities, Unicode minus, positive +2/2, comma grouping, 5-10/5–10, spaced ranges, word hyphens and signed lists. A positive/negative sign flip changes the stated quantity; notation-only alternatives need not. Numeric-marker checks are separated from other conservative gates when testing scientific spelling.

- Baseline existing suite: 23 tests pass with the dependency available.
- Baseline: all three signed-decimal corruptions pass the gate; the ranker selects the demonstrated corrupt rewrite.
- Candidate: all three corruptions fail; the ranker keeps the original. Valid decimal/range contrasts remain accepted.
- Follow-up scientific probe found + exponent→− exponent also passed the baseline. This same-outcome gap was included before retention. Candidate rejects it and faithful scientific text remains accepted.
- Initial candidate suite: 26 tests, 70 assertions passed. Independent spotcheck then found that `-.5` and `−.5` still lost their signs; the selector could still choose the corrupt leading-dot rewrite. That candidate and its observations are preserved, not counted as complete protection.
- Final candidate includes leading-dot decimals. Four corruptions now fail (`-.5`→`.5`, `−.5`→`.5`, `.5`→`5`, and negative→positive exponent on `-.5e-2`); four valid notation contrasts pass, including `-.5`/`-0.5`. The leading-dot selector now keeps the original. Final suite: **28 tests, 80 assertions pass**.

The first test attempts lacked the optional NLP dependency in the fresh worktree (21 passed, two POS-dependent tests failed). Reusing the existing installed dependency through an ignored worktree junction resolved that environment issue without changing the skill or installed dependency. Those failures are not attributed to baseline behavior.

## Decision and limits

Retain the bounded checker repair: reproduced false acceptance resolved, actual selector consequence prevented, ordinary notation contrasts and existing tests preserved. Design review found no changed caller schema or competing numeric rule; the independent meaning check remains required. No model task or document-rendering comparison ran, so broader workflow improvement remains unverified.

This is not a complete number-language parser. Existing term/content gates can reject equivalent scientific spellings; the numeric gate accepts e/E and Unicode-minus equivalents, but whole-gate equivalence is not claimed. Number reassignment, units, accounting parentheses and semantic relationships still need the meaning reader. No universal quality score or human comprehension gain is inferred.

External evidence: RemainingSkills20261104/authoring contains Plan.md, preserved baseline/first-candidate sources, plainness-baseline-with-deps.json, plainness-candidate.json, scientific-baseline.json, scientific-candidate.json, leading-dot-baseline.json, leading-dot-candidate1.json, leading-dot-candidate2.json, clarity-tests.txt, clarity-tests-final.txt and report.md. These are provenance, not runtime dependencies. Revisit with an observed quantity corruption or false rejection; preserve both final artifact and gate/reader handoff evidence.
