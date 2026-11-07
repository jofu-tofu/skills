# Renderer optimization decision

Retain the revision in target/Tools/RenderTemplate.ts. 10.09% lower median elapsed time on the supplied 240-render benchmark (2075.55 ms to 1866.17 ms); exact outputs matched and measured compilation calls fell from 480 to 0.

The parent cache retains up to 64 compiled templates and checks source contents on every call. Partial entries reuse source and compiled delegates when file identity, size, permissions and nanosecond modification/change/birth timestamps match. Each call still scans the directory and registers its owned names, so removals and caller overrides follow the prior lifecycle. Data remains freshly loaded and output is never cached.

## Timing evidence

Unchanged benchmark.ts ran on disposable copies, using Bun 1.3.5. Each process warmed up five times, then measured 240 renders with 64 profiling partial files. Baseline/candidate order alternated; all outputs matched the benchmark's expected string.

| Pair | Baseline ms | Candidate ms | Reduction |
|---|---:|---:|---:|
| 1 | 2163.98 | 1904.68 | 11.98% |
| 2 | 2075.55 | 1866.17 | 10.09% |
| 3 | 1956.08 | 1684.35 | 13.89% |

Median reduction 10.09% meets the frozen 10% local retention rule. All three pairs favored the candidate. The margin over the rule is small; these runs do not establish a general speedup. Raw process outputs are in timings.json.

## Preservation and qualification

Both versions passed 37 existing tests (95 assertions) and all 16 supplemental probe groups. Probes covered alternate data; same-size parent/partial edits with restored mtime; replacement, deletion and recreation; nested/dynamic and inline partials; caller registrations; malformed-unused partial laziness; JSON/YAML freshness and override; missing/syntax error recovery; removed directories; escaping; cache eviction; API errors; preview/output and actual CLI execution. A separate open-handle write probe also passed both versions. The assertion checker rejected a deliberately wrong string. Baseline comparisons and literal expected values support these executable contracts; they do not constitute hidden or model-based evaluation. See *-tests.txt, *-probe.json and *-open-handle.json.

## Attempts and failures

Candidate 1 cached compiled delegates but reread all partial contents. Its median improvement was only 1.83%, so it failed the benefit gate despite passing all 37 tests. Preserve candidate1-RenderTemplate.ts, candidate1-timings.json and candidate1-tests.txt. Candidate 2 adds metadata-guarded partial source reuse under the unchanged scoring rule (plan.md amendment). No target correctness failures were observed. Two preliminary documentation-read errors are retained in plan.md; neither executed the renderer. Standard Handlebars prototype-access warnings remain in both test logs.

## Scope and decision

Only the allowed target renderer implementation changed. Existing tests, benchmark, dependencies and public interfaces were not edited. All generated fixtures and evidence stayed in this workspace. No agents, network, installs, Git, publication, personal notes or installed skills were used. identities-final.json links exact source/benchmark/probe hashes and the target comparison; review.md records the affected design review.

ApproveSkill decision: retain_candidate; required benefit and preservation gates pass for this bounded task. Completion is separately checked with method/Tools/CheckCompletion.cjs against the pre-edit contract and hashed evidence. This is one local renderer improvement, not evidence that SkillForge outperforms another method.

## Limits and reuse

- Three paired runs on this Windows/Bun 1.3.5 environment; local benchmark evidence, not a statistical population estimate or universal speedup.
- Metadata-guarded partial reuse assumes the filesystem exposes writes through identity, size, mode or nanosecond modification/change/birth timestamps. Byte changes invisible to all these fields can evade invalidation; concurrent edits are not a transactional snapshot.
- Parent cache is bounded to 64 entries; partial cache scales with the current local partial library. Memory and cold-start performance were not measured.
- Added probes are author-visible diagnostic checks, not supplied hidden evaluation or independent downstream model judgments. No claim about general prompt quality.

Revisit if production timing differs, the partial library becomes much larger, or filesystem behavior differs. A safe fallback is the preserved baseline. Reproduce with node evidence/run.cjs (mutates only disposable copies); probe commands are bun evidence/probe.ts evidence/baseline and bun evidence/probe.ts evidence/candidate. Timing reproduction should use clean copies, because supplementary probes add fixtures.
