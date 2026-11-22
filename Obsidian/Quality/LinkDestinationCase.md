# A plausible link that points to the wrong decision

Give the evaluator the request and this complete snapshot of a test vault. Preserve the expected results until the candidate answer is saved.

## Request and vault

“Suggest the exact wikilink I should add to the highlighted phrase ‘revised cutoff’ in Projects/Juniper/Status.md. It must open the Nimbus decision and jump to the agreed cutoff. Keep the highlighted wording.”

| Vault path | Relevant contents |
|---|---|
| Projects/Juniper/Status.md | “Nimbus will supply the revised cutoff.” |
| Projects/Juniper/Decisions.md | Heading “Agreed cutoff”, describing Juniper's separate internal cutoff. |
| Projects/Nimbus/Decisions.md | Heading “Agreed cutoff”, describing the Nimbus supplier decision. |
| Archive/Nimbus Decisions.md | Alias “Nimbus decision”, containing a superseded supplier note. |

Variation: rename only the heading in the current Nimbus file to “Effective cutoff”. Leave the old heading on the Juniper and archived notes. For a third run, remove the heading and all cutoff material from Nimbus's file, while retaining the document.

## Checks

Verify the returned link from Status.md would resolve to the current Nimbus file and actual heading. A vault-relative qualified link such as `[[Projects/Nimbus/Decisions#Agreed cutoff|revised cutoff]]` passes the first run. The second must point to the renamed heading. In the third, disclose the missing anchor and offer a file-level link or a clarification. An ambiguous basename, archived alias, invented anchor, changed display wording or an actual edit in suggestions-only mode fails.
