# Reader outcomes

Version 1, 2026-11-05. Applies to creation, rewriting, review, and conversion. These are results for the reader and author, not a requirement to run more agents or produce more files. Use the rows relevant to the request. Existing RC rules retain their owners; this profile maps their contributions rather than redefining them.

## Purpose and sources

Help the intended reader understand the subject, follow its reasoning, and decide or act without reconstructing the author's investigation. Preserve meaning and deliver the requested usable result. Sources: [SkillIntent](../SkillIntent.md), existing lens rules, and a targeted review of prior authoring sessions summarized in [SessionOutcomes](../Improvements/SessionOutcomes/Record.md). Historical corrections identify needs; they do not prove that the current version still fails.

## Outcomes and contributions

| ID | Reader or author result | Consequential failure | Contributors and distinct roles |
|---|---|---|---|
| CE-O1 | The reader identifies the main point and the requested decision, action, or understanding. | A polished summary leaves the reader unsure what is being requested; an informative explanation invents an action. | Navigator arranges the point and skim path; Reader supplies answers; Verify checks them against sources. |
| CE-O2 | The reader can explain causes and sequence, and distinguish concepts that would change their answer in a concrete situation. | A reader repeats a definition but confuses responsibility with location, or must look ahead to understand an event. | Logician checks reasoning; Navigator checks setup before use; AudienceFit explains necessary terms; Reader tests use of the explanation. |
| CE-O3 | The reader understands the wording without translating unnecessary internal shorthand. | Accurate prose still reads like investigation notes, compressed labels, or disconnected slogans. | AudienceFit owns RC-2/20/29; PlainRewrite proposes alternatives; the meaning check protects substance. |
| CE-O4 | Material facts, actors, conditions, quantities, exceptions, causal links, uncertainty, and source limits survive editing and conversion. | A shorter sentence changes who acts or makes a proposed behavior sound tested. | Logician checks claims and evidence; PlainRewrite checks meaning; conversion checks fidelity; contract gates protect explicit constraints. |
| CE-O5 | The reader reaches the necessary information without repeated claims or detail below their decisions. | Several sentences restate one point; a high-level review becomes an implementation inventory. | Cutter removes duplication and summarizes detail; Reader and Logician protect necessary explanation. RC-32 governs companion-document handoff. |
| CE-O6 | The result honors the author's scope, locked wording, template, and emphasis convention. | A prose pass changes the design, rewrites a locked paragraph, or bolds a category the template keeps plain. | DocumentContract defines constraints; Verify separates fixes from proposals; repair checks prevent regressions. |
| CE-O7 | The delivered artifact is usable in the requested format and destination; procedural instructions name executable steps, expected results, and tools available to their reader. | Good prose cannot be pasted, opened, read, or edited where needed; a procedure relies on unavailable tools or leaves actions implicit. | FormatAdapters and specialist skills build/check files; Visual inspects renders; target-app evidence supports destination claims. |
| CE-O8 | The author can tell what was checked on the delivered version and what remains unknown. | A missing reviewer or stale render is described as a completed review. | ReadabilityGate records execution; Verify owns readiness and coverage; delivery reports limits. |

CE-O4 and CE-O6 constrain every editing outcome. CE-O8 constrains every verification claim. Better brevity cannot compensate for lost meaning; a completed panel cannot compensate for poor explanation. A fresh model reader is a proxy, not a human comprehension study.

## Challenges and valid alternatives

- Plain words can still conceal a distinction: ask the reader to apply it, not merely repeat its label (O2).
- Longer can be better when a condition or cause becomes understandable (O3/O4). Word count is not the acceptance rule.
- A summary and a standalone section may repeat a point for navigation; repetition within one summary still needs a purpose (O5).
- Exact API names and familiar expert vocabulary may be necessary; replacing them can reduce usefulness (O3/O6).
- A truthful, useful unverified draft can satisfy delivery without supporting a Ready claim (O7/O8).
- An informative artifact need not invent a recommendation, and a small edit need not acquire a full document workflow (O1/O6).

These distinctions set the evaluation questions. See [Measurement](Measurement.md) for methods and evidence limits; do not turn the table into an aggregate quality score or another mandatory authoring pass.

## Workflow evidence and contribution mapping

The [workflow outcomes](WorkflowOutcomes.md) decompose these reader results into creation, conversion, audit, review, verification, repair, wording and format responsibilities. Preserve both ID sets: these are complementary views, not 28 independent scores or extra mandatory authoring passes. The recorded source-branch passes retain their original limits; combined-version evidence is recorded in [MergePreservation](../Improvements/MergePreservation/Record.md).

| Reader results | Main workflow contributors |
|---|---|
| CE-O1, CE-O2, CE-O3 | CE-CREATE, CE-REVIEW, CE-PLAIN |
| CE-O4, CE-O6 | CE-CREATE, CE-CONVERT, CE-REPAIR, CE-PLAIN |
| CE-O5 | CE-AUDIT, CE-REVIEW, CE-REPAIR; Cutter retains RC-32 ownership |
| CE-O7 | CE-CONVERT, CE-FORMAT |
| CE-O8 | CE-REVIEW, CE-VERIFY, CE-FORMAT |

## Specific distinctions from the broader session census

The [expanded census](../Improvements/SessionOutcomes/ExpandedCensus.md) adds the distinctions below without changing the eight parent outcomes or creating another mandatory authoring pass. These are evaluation criteria, not evidence that the writing workflows now perform better.

| ID | Parent | Specific reader/author result | Misleading pass to reject | Valid alternative to preserve |
|---|---|---|---|---|
| CE-O1a | O1 | Each section answers the question the requested artifact asks at its current stage. | A polished kickoff supplies an implementation design or invented success metrics while leaving its template questions unanswered. | A kickoff can identify what needs to be learned and how evidence will be gathered without promising a design or release. |
| CE-O1b | O1/O2 | The audience and requested action fit what those readers actually know, see, and control. | Familiar words assign a reader knowledge of a source or workflow they cannot observe. | State the evidence gap or address the person whose role is established; do not invent an audience or owner to complete the explanation. |
| CE-O6a | O6/O4 | A pass preserves the approved requirements owned by another contributing skill or template. | A wording pass silently replaces a design requirement, template answer, or previously protected meaning to satisfy its own preference. | Surface a conflict for the author while improving wording within scope; preserve distinct ownership without weakening either standard. |
| CE-O7a | O7 | A tester can identify the required environment, perform the steps with available tools, and recognize the result. | Setup names only an internal change ID or uses unavailable author-only tooling. | State observable required behavior or configuration when supported; keep an exact identifier when the tester genuinely needs it. |
| CE-O8a | O8/O3/O4 | A review claim applies to the delivered wording and the audience assumptions actually used for it. | A longer draft passes, then is manually shortened or aimed at a different audience while its old Ready/Pass label is retained. | Report which version and audience were checked; later edits may require renewed checks or an explicitly unverified delivery. |

These are not new RC owners. Navigator/Reader contribute to O1a, AudienceFit/brief/source checks to O1b, DocumentContract/Verify to O6a, procedural source and destination checks to O7a, and the author-to-review-to-delivery handoff to O8a. Existing rules may already cover parts of each distinction. Preserve that coverage and test the actual handoff before adding duplicate instructions.
