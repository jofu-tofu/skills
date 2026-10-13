# Personal Writing Style

Write like a knowledgeable colleague explaining the work: plain, direct, and connected. Simplify the wording while keeping the reasoning. Apply this guide to ClarityEngine's instructions and its output. Follow explicit audience and template requirements, and preserve quotations, required terms, and source meaning.

## Writing

- **Name the subject and say what it does.** Use familiar words and concrete verbs. Give each sentence one main point; keep a longer sentence when it makes a condition or relationship clearer.
  - Example: Write “This can happen when” instead of “Circumstances required for this problem,” and “without changing the group” instead of “without mutation.”
- **Explain why the point follows.** Include the facts, definitions, conditions, and uncertainty the reader needs to understand or act. Use “because,” “so,” and “when” to connect the reasoning.
- **Use plain language whenever it preserves the meaning.** Never use technical jargon when you do not have to. Jargon includes specialist terms, acronyms, implementation labels, and investigation shorthand that make the reader translate the wording to understand the point. A phrase made of ordinary words, such as "checked sender code" or "receiver path," can still be jargon.
  - Keep a technical term only when the reader needs it to identify something, perform the task, or understand a distinction that plain wording would lose. Being accurate, familiar to the author, or defined in a glossary does not by itself make the term necessary. Explain necessary terms on first use and preserve exact API names, commands, identifiers, and quotations when they are needed.
  - Example: In a kickoff summary, replace "The checked export sender code excludes draft invoices" with "The export API does not currently send draft invoices." Keep the evidence limit nearby: "Based on a code review; this still needs testing in a running system." Keep version or environment limits with the claim when they affect its meaning.
- **Write engineering changes as instructions.** Explain the current problem briefly, then state what to change with direct action verbs. Keep the exceptions and mechanisms needed to implement or review it.
  - Example: “Limit each member workspace to 25 open referrals.”
- **Let the design stand on its own.** Leave out conversation history, personal approval attributions, commentary about the document, and labels such as “Planned behavior.” Keep one concise status note when needed to distinguish proposed work from verified behavior. Put investigation detail elsewhere unless it affects a decision.
  - In designs and other documents for reviewers who know the product, state its current behavior as fact. Put verification caveats about that behavior, such as "based on a code review," in author notes or the QA instructions. Keep a caveat inline only when the uncertainty could change the decision.
- **Keep claims accurate when simplifying.** Performance, release scope, and verification statements need evidence. Retain uncertainty that affects scope or correctness, without repeating the same disclaimer throughout.
  - Example: “The local tests passed. Browser behavior still needs verification.”

## Organization

- **Lead with the main point.** Follow it with the explanation, related details and examples, then exceptions or status notes. Keep each topic with its details so the reader can follow the section from top to bottom.
- **Give each section one job.** Keep the existing problem in Problem Summary and the changes in Changes for Users or the technical design. Preserve required template headings while using natural wording within them.
- **Use hierarchy to show how ideas relate.** When using a list, state each rule in a main bullet. Nest its examples and supporting details where that relationship helps the reader. Label concrete illustrations “Example:”. Keep independent requirements at the main level.
  - Example of the structure, not a verified product requirement:
    - **Limit each group to 25 referrals.** Count each referral once, including the source and referrals hidden by security. Apply the limit across repeated additions.
      - Example: Allow five additions to a group of 20, but reject ten additions.
- **Choose structure to suit the content.** Use connected paragraphs for explanations, bullets for parallel rules, numbered steps for sequences, and tables for comparisons. Add headings at meaningful topic changes. Keep related conditions together instead of turning every sentence into a separate bullet.
- **Repeat only when it helps.** A summary or independently read section may need the same key fact. Remove repetition that adds no meaning or orientation. Brevity follows from precise writing; it is not a word-count target.

## Formatting and Copying

- **Make the reading order visible.** Use meaningful subheadings, short paragraphs, comfortable line lengths, and space between groups of ideas. Use bold sparingly for the facts a scanning reader needs.
- **Keep copied content readable on its own.** Preserve headings, list hierarchy, and explicit blank lines between sections and subsections in both rich-text and plain-text copies. Do not rely only on page CSS margins to carry that spacing into another editor.
- **Preserve meaningful message formatting.** In HTML or other deliverables with copy controls, provide a suitable rich-HTML or image copy option when a mock message or callout must be copied. Keep its text available and label what the button copies. Check the destination app's paste behavior when accessible; copying successfully does not prove that app preserves the styling.
- **Check the actual output.** Inspect rendered content, including narrow-screen and print layouts when applicable and available. Report Content, File, Rendered, and Target app checks separately, using the names in FormatAdapters.md. State any check that could not run.

## Revision Check

Can the intended reader identify the subject and main point, understand why it follows, and identify the next step without filling in a missing premise? Can they scan the main points and read examples only when needed? Restore any explanation or material uncertainty lost during revision.

These examples illustrate wording, not verified product requirements:

| Problem | Instead of | Write |
|---|---|---|
| Abstract wording | “The proposed approach supports enforcement of the capacity threshold to optimize operational efficiency.” | “The editor allows up to 25 open referrals. Opening more can slow the workspace, so users must close one before opening another.” |
| Too compressed | “Cap opens at 25 for performance.” | “Opening many referrals can slow the workspace. Limit the number open at once to 25 to reduce that slowdown.” |
| Vague status | “The change has been successfully validated.” | “The local tests passed. Browser behavior still needs verification.” |
