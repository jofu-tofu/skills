# PNG evidence metadata

Outcome WD15: malformed, unreadable or truncated PNG evidence must not be reported as a verified screenshot. The tool measures container metadata; browser inspection owns rendered quality and behavior.

Observed baseline: a real browser screenshot passed, but its24-byte header, body missing IEND, wrong first chunk and corrupted bytes also passed. Three of seven external controls passed. Candidate checks signature, complete chunk framing, checksums, first IHDR/dimensions, IDAT presence and final IEND; all seven controls pass. Output now explicitly says pixels and screenshot provenance remain unverified.

Portable regression suite:5/5. Its initial presumed-gold base64 PNG had an invalid checksum and failed4/5; it was replaced with an actual local Chromium1×1 screenshot, not by weakening the checksum check. The larger real screenshot passed throughout. This is fixture correction, not an additional target improvement.

Limits: the checker does not decompress image data, validate all PNG semantic constraints, establish screenshot origin, judge visual quality or test interactions. Valid container metadata is only one input to verification. Raw evidence: RemainingSkills20261104/deep/reasoning/png-checks/{baseline,candidate}.json; actual browser reference under web-baseline-evaluation; portable tests Tools/VerifyDesign.test.ts. Evidence is external to this skill repository.
