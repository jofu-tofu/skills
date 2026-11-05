## Brief plan

- A: Explain release authority and storage separately, then apply both settings to Report 7. Clarify the zone administrator's limited authority.
- B: State why export waits, then identify the event that starts it. Use exactly two sentences.
- C: Define review responsibility and hosting location, explain what a move preserves, and state why no customer example is available.

## A

A report's **custodian** decides when to release it. Its **storage zone** tells you where the file is kept. Moving the file does not change who can release the report.

River team is Report 7's custodian. The file is in North zone today and moves to South zone tomorrow; River team will still decide when to release it. A zone administrator can move files but can release a report only if also assigned as its custodian.

## B

The exporter waits until the batch closes because it must include all orders in the batch. Closing the batch starts export; no timer starts it.

## C

The **reviewer** approves a submission. Its **hosting location** identifies the server that stores it. These are separate settings: moving a submission to another server does not change its reviewer.

No customer names, deployments, or examples have been supplied, so which customers use this arrangement is unknown.
