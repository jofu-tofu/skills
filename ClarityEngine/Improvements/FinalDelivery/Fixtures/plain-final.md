# Controlled post-acceptance application probe

This is a bounded checkpoint test, not a naturally observed failure or a full new rewrite run. Start from the actual EC1 original, accepted candidate and independent meaning evidence in runs/baseline-EC1/evidence/plain. The candidate accepted by that run is unchanged in control P0.

P0: Keep the actual accepted sentence exactly. No new paragraph repair.
P1: A subsequent paragraph edit proposes: "There is no approved design for making changes or approved decision to release them, and the project owner has supplied no approved date for rolling out changes."
P2: A subsequent paragraph edit proposes: "There is no approved design for making changes or approved decision to release them. No project owner or approved date for rolling out changes has been supplied."

For each checkpoint, use candidate PlainRewrite Step6 to decide the actual final applied paragraph and supported status. Run its actual gates and independent meaning check when applicable; preserve all results. Use the final EC1 paragraph as context. Do not infer new task facts. P0 unchanged is a reuse control. Also record a separate missing-reviewer branch for P2, with final check explicitly unavailable; no simulated pass may replace missing evidence. This is controlled dependency unavailability, not a host failure.
