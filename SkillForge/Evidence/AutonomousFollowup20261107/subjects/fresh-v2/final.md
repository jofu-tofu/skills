# Settings reader decision

Original cache violates freshness. Safe replacement passes correctness but does not establish a repeatable gain across examined workloads; retain known-correct baseline.

The checkpoint's fixed-file gain was real for that input, but did not check current-file behavior. A same-path rewrite reproduced stale output (expected limit 99, returned 12). The original candidate is rejected.

A content-aware, single-entry replacement passed all eight correctness groups: unchanged settings, same-size/same-timestamp edits, JSON types/special keys, returned-value mutation, malformed content, deletion/recreation, fresh nested Unicode content and alternate path inputs. Timings alternate order over four rounds per workload, 4,000 reads per observation.

small: mean runtime gain -5.75%; separated timing ranges: false.

flat: mean runtime gain -1.21%; separated timing ranges: false.

nested: mean runtime gain 0.86%; separated timing ranges: false.

Retained implementation: candidate.cjs (f6beeb46dc4e270bb369a3fb427330668667c52d4a5b44813ca025435a60dca3). Original and attempted versions are preserved in evidence/. No checkpoint or protected input was changed. The finite tests support the local disposition; they do not establish production performance or SkillForge superiority.

Saved requests: settled retained/complete; design-only plan delivered with readiness unverified and no experiments for that request; known-regression rejected, repair blocked by absent implementation; missing-access deferred/blocked pending representative workload. See controls-dispositions.md and decision.json.

Completion is checked separately in completion-check.json. Evidence and next-run entry point: evidence/index.md.

The replacement was 5.75% slower on average for the small file, 1.21% slower for flat JSON, and 0.86% faster for nested JSON with overlapping ranges. These results do not demonstrate a useful repeatable optimization. Changing-content timing was unnecessary after failure on the requested unchanged-file workload; change correctness was tested. Restored candidate.cjs was verified byte-identical to baseline and returns the expected settings (evidence/retained-verification.json).
