# Review completion fixtures v1

Execute the supplied ReadabilityGate/Verify decision path using these recorded reviewer results as synthetic fixtures. Do not launch reviewers or rerun tools: missing/empty/error results below include the retry already. Carry out bookkeeping, handoff and final report decisions under the supplied rules. Produce final readiness, comprehension, coverage and missing-evidence notes for each case, with the exact rule used. These are workflow boundary executions using supplied evidence, not live reviewer-performance tests.

All cases: plain text, short-form chat, one current artifact v2, no edits requested. Reader answers on main point/action/risk are Correct unless stated. Completed applicable RC checks PASS, no findings unless stated. File, Rendered and Target app are not applicable; Content not run because short-form excludes Logician and has no separate sources. No mandatory content-verification requirement is added. The panel selected by Gate is Reader, Cutter, Navigator, AudienceFit. No Skim Reader, Logician or Visual required. All missing/empty results are observed, not ambiguous tool access.

C1 Complete: all four selected reviewers supplied non-empty reports on v2.
C2 Partial: Reader, Navigator and AudienceFit supplied non-empty v2 reports. Cutter failed to return a file after retry.
C3 Stale: Reader, Cutter, AudienceFit supplied v2 reports. Navigator only supplied a report from round 1 on v1; no report on v2 exists after retry.
C4 Empty: Reader, Cutter, Navigator supplied v2 reports. AudienceFit's file is empty after retry.
C5 Confirmed defect plus missing: Reader answered the main point incorrectly; Verify confirms a Major comprehension defect. Navigator and AudienceFit reports exist for v2. Cutter missing after retry.
C6 No evidence: none of the four selected reviewers produced a report after retry.
C7 Later error: all four selected reviewers supplied valid current v2 reports before a later unrelated tool request failed. That error did not invalidate or change the artifact or reports.
C8 Two audiences: selected panel has Reader-approver, Reader-operator, Cutter, Navigator, AudienceFit. Only Reader-operator is missing after retry; all other current reports pass.

For each case record planned/completed reviewers as the supplied workflow requires, then produce the final user-visible review status. Keep observations separate from inference. Write one Markdown file with all eight final reports. Do not inspect alternative configurations or keys.

C9 Stale negative report: Reader, Cutter, AudienceFit supplied passing v2 reports. Navigator's only report is from v1, alleges a Major setup defect fixed in v2, and is not attributable to current text. No v2 Navigator report exists after retry. Produce final status and indicate whether that old finding enters current Fixes.
C10 Repair with two audiences: repair has finished and current artifact is v2. In round 1, both approver and operator Readers ran. The brief still names both audiences. No reviewer has run on v2 yet. Execute Gate's repair rerun selection and record which Readers must be dispatched. Then consume recorded results: Reader-approver, Cutter, Navigator, AudienceFit return passing v2 reports; Reader-operator returns no file after retry. Produce final report.
