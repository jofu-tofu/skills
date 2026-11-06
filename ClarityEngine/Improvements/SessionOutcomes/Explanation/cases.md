# Explanation comparison fixtures v1

Execute only the explanation planning and drafting portion of the supplied workflow. Deliver final prose for each task, with a brief plan in a separate section. Do not run tools, review panels or format builders. This bounds the test to the changed explanation step and its prose output, not the full creation workflow. Do not read other configurations or any result/answer keys. Use only facts below. No reference to the evaluation in the final prose.

## A: Two independent concepts
User: Explain these settings to an operations coordinator unfamiliar with our reporting system. They must decide who can release a report and where its file is kept. Keep it concise.
Facts: A report's custodian chooses when to release it. Its storage zone identifies where its file is kept. Moving a file between zones does not change its custodian. River team is the custodian of Report 7. Report 7 is stored in North zone; tomorrow it moves to South zone. No other change is planned. A zone administrator moves files but cannot release reports unless also assigned as their custodian.

## B: Ordinary explanation
User: Explain the delay in two sentences to an experienced operator. No example or extra background needed.
Facts: The exporter waits until the batch closes because it must include all orders in the batch. Closing the batch starts export. No timer starts export.

## C: Unknown example
User: Explain review responsibility versus hosting location for a new coordinator. Include a known customer example if the facts support one; otherwise say what is unknown.
Facts: The reviewer approves a submission. Hosting location identifies the server that stores it. They are separate settings. Moving the submission does not reassign the reviewer. No customer names, deployments or examples have been supplied. Do not infer whether any named company uses this arrangement.
