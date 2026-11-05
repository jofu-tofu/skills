# Bundled example contracts

The renderer's documented Voice command used VoicePresets.yaml, whose preset/reference schema has neither agents nor archetypes. Actual execution returned empty voice mappings despite the apparent configuration example. Agents.yaml is the supported input and produces all3 supplied voices and archetypes. A separate header example used nonexistent Data/Gates.yaml; Data/ValidationGates.yaml executes and retains the supplied gates. Roster/Agents behavior was preserved.

Corrected help/comments and the template/data mapping; Voice's input documentation now describes its actual archetype fields, not an unsupported presets mapping. The separate VoicePresets reference catalogue remains available. Named output examples explicitly require an existing parent directory; relative Templates output semantics and actionable missing-directory errors remain unchanged.

Evidence: RemainingSkills20261104/deep/reasoning/bundled-examples/results.json and captured actual CLI outputs. Old Voice example produced0 rather than3 voices; corrected pairing preserves actual configured values. Old Gate path failed; corrected path succeeds. These are documentation-to-consumer contract repairs, not new provider integration or voice-quality claims. Placeholder voice IDs remain example data.
