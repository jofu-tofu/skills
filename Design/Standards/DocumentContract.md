# Document Contract (format 1)

A document contract is a Markdown section that travels with a document and holds what the document must keep: what each section is for, what the author has locked, and the checks every later edit must keep passing. Any skill, agent, or person can read and write it. A tool that edits the document reads the contract first and treats it as binding, so one pass can't undo the standard another pass already met.

## Where It Lives

Keep it inside the document, as a `Document Contract` section in the author notes or wherever the document keeps material that isn't reviewer-facing, so the rules sit with the revision history and decisions are recorded once. Nest its subsections one heading level below it, and replace the frontmatter with a first line giving the format and the date. Use a separate file only when the document can't hold the section, such as a Track SmartText or a Word document: name it `document-contract.md`, or `<document file name> - contract.md` when several documents share a folder, and link it from the document.

Find it by looking for a `Document Contract` heading in the document, then for a contract file beside it. A pass that hands the contract to reviewers who must not see the author's rationale copies only this section, never the rest of the author notes.

Without a contract, work from your own defaults, and create one when you finish so later passes inherit your standard.

## Format

As a separate file; inside a document, drop the frontmatter and shift the headings down.

```markdown
---
contract_format: 1
document: <path or record ID>
updated: YYYY-MM-DD
---

# Document Contract

## Roles

| Concern | Owner pass |
|---|---|
| Template: sections, headings, prompts, option lines, emphasis convention | template |
| Content: what's included, decisions, scope, evidence, risks, positions on open items | reasoning |
| Prose: wording, sentence structure, order within a section, skim layer within the emphasis convention | prose |

## Sections

### <Template heading when a template applies, otherwise the document's heading>
- Document heading: <the heading the document uses now, when it differs>
- Covers: <what this section is for, as a short list>
- Excludes: <what must not appear here, and where it goes instead>
- Emphasis: <the bold convention for this section, or "default" (the prose pass's own emphasis rules apply)>

## Locks

| ID | Locked span or rule | Why | Set by | Date |
|---|---|---|---|---|
| L1 | <quoted text, or a rule such as "Background explains the feature's purpose"> | <author's reason> | author | YYYY-MM-DD |
| L2 | <an author confirmation, such as a template option the author chose> | <author's reason> | author | YYYY-MM-DD |

## Checks

| ID | Check (pass/fail from the document alone) | Owner pass | Last result |
|---|---|---|---|
| C1 | <e.g. "Every sentence in Background maps to a Covers item"> | template | pass |
| P1 | <a check against a posted copy, such as "The Track copy matches the draft"> | template | not run |

## Decisions

| Date | Decision | Replaces | Sweep done |
|---|---|---|---|
| YYYY-MM-DD | <current position> | <earlier position, or none> | yes / no |
```

The Decisions table is the document's decision log. When the document also keeps narrative history, link each row to its entry instead of retelling the rationale.

## Rules for any pass that edits the document

1. **Read the contract before editing.** Name your pass (template, reasoning, or prose) from the Roles table.
2. **Edit only the concerns your pass owns.** A change to another pass's concern is a proposal: write it down with its reason and leave the text alone. Where the split is unclear: deleting a repeat is prose when the claim stays stated once in the section its contract assigns; adding, removing, or moving a claim, an owner, or a position is reasoning; changing a heading, prompt, option line, or section order is template.
3. **Locks outrank every pass.** A change to a locked span or rule goes to the author as a question, never into the document. Only the author adds or removes a lock. Record each cut the author accepted as its own lock quoting the removed text, so no pass restores it; a general rule like "cut what reviewers won't read" does not protect a specific cut.
4. **Rerun every check before keeping an edit.** Record each result in the Checks table. If an edit turns a passing check into a failing one, undo that edit or send it to the author as a proposal. Report a check that was already failing; you may fix it if your pass owns it. "Not run" is not a baseline: a check regresses only from a recorded pass.
5. **Add checks for the standard you enforced,** written so a later pass can test them from the document alone. Never delete or weaken another pass's check; propose it to the author.
6. **When a decision changes, sweep.** Add the new row to Decisions, search the document and any posted copy for every statement of the old position, rewrite or remove each hit, then mark the sweep done. Author notes and other history may keep the old position only when it is marked superseded.
7. **When a posted copy is better than the draft,** for example when it passes a lock the draft breaks, fix the draft before re-posting. Never copy a lock violation over a compliant copy.
8. **Section contracts replace word budgets.** A sentence fails its section when it maps to no Covers item, maps to an Excludes item, or repeats a claim made in another section. Word counts are reported as a signal only.
