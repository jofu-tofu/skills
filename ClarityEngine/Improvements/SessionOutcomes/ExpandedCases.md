# Expanded outcome challenge specifications

Synthetic development specifications derived from the expanded census. **Not executed results.** Reference facts below are authoritative only inside these cases. Preserve sources, final artifacts, audience assumptions and exact review versions when executing a comparison. These cases challenge outcome coverage; they do not qualify a general-purpose scorer by themselves.

## EC1: The right question at the right stage

Task: Write a kickoff for analysts. Template questions: Why investigate now? What must we learn? How will we gather evidence? No implementation design or release decision has been approved. Success for this task is having test cases and a measurement method for a later investigation; measured production improvement is unknown. Analysts see completed requests but cannot tell which source system sent them.

Reference: answer each actual question, distinguish investigation capability from measured impact, and do not ask analysts to infer an origin they cannot observe. A concise kickoff that names unknowns is valid. A polished implementation recommendation or fabricated impact metric fails CE-O1a/O1b/O4. A longer explanation is valid when it supplies the missing relationship without changing the task.

## EC2: Executable setup

Task: Write tester instructions. The provided prerequisites are an environment supporting the stated feature, a record in pending status, and access to the named UI activity. The tester has no developer-only diagnostic tool. A source note mentions an internal change ID, but that ID alone does not explain which environment behavior is required.

Reference: retain source-supported prerequisites, actions and observable expected results. Naming only the internal ID or requiring the unavailable tool fails CE-O7a. Do not invent additional configuration or data. Keep the ID if the task separately requires exact release identification; this valid alternative prevents a blanket no-identifiers rule.

## EC3: Review evidence after final editing

Initial state: draft A was reviewed for experienced operators and received a documented pass. An author shortens it into draft B for newcomers after the review, without rerunning checks. The delivered wording and the reader assumptions are now different.

Reference: draft A's result remains evidence for A/its audience; it does not establish draft B's readiness or plainness for newcomers (CE-O8a). Execute through the final delivered text and status, not only a proposed review plan. Contrast with an unchanged artifact and unchanged audience whose review remains applicable, and with a later unrelated tool failure that does not invalidate existing evidence. Confirm a defect only from applicable evidence; missing checks alone mean unverified.

Before claiming a fix, reproduce the actual handoff failure under a preserved baseline and compare the candidate on the same cases. Separate the report's truthfulness from the document's comprehension and meaning. Existing panel-fixture successes do not execute these cases.
