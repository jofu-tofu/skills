# Combined deterministic checks for companion skills

When the changed scope includes these companion skills, run their compatible native tests in one Bun invocation from the shared skills repository root:

```powershell
bun test ./Prompting/Tools/RenderTemplate.test.ts ./Prompting/Tools/ValidateTemplate.test.ts ./ClarityEngine/Tools/MeasureDraft.test.ts ./ClarityEngine/Tools/ScorePlainness.test.ts ./WebDesign/Tools/VerifyDesign.test.ts
```

This retains each test name, failure and assertion: Prompting rendering/validation, ClarityEngine extraction/scoring, and WebDesign PNG validation. The verified run passed 75 tests and 185 assertions. Run only relevant files for a narrower change. It replaces repeated invocations, not test cases; no model-token reduction has been measured for this command.

Use the skills' declared locked dependencies. Missing packages are setup failures, not target regressions or permission to skip tests. Do not install dependencies merely to rerun already sufficient evidence.

Browser's server/browser integration suite remains separate. CodeReview's historical model cases already use batches. ClarityEngine's cold-reader questions can share one artifact assessment, but keep blind readers, author contexts, comparison arms and independent draws separate. Do not feed answer keys into reader prompts or rewrite historical suites/results.

SkillForge's [consolidation rule](../Procedures/ConstructCases.md#consolidating-model-checks) governs future model-suite changes for every target skill. This recipe is optional reuse when these files exist, not a dependency on companion skills or a requirement to test unrelated skills.
