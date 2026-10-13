# RepurposeDocument Workflow

> **Trigger:** "convert presentation", "html to ppt", "ppt to html", "html to powerpoint", "powerpoint to html", "turn into powerpoint", "change format", "convert format"

## Reference Material

- `../Philosophy.md` — Meaning and hierarchy preservation
- `../PersonalStyleGuide.md` — Prose revision preferences
- `../FormatAdapters.md` — Source and target format handling
- `../ReaderCheck.md` — Independent comprehension test

## Purpose

Convert a document without losing its meaning. Explain anything the conversion changes or leaves out. Support HTML and PPT equally. Other formats need a supported adapter. Converting back may not reproduce the original layout exactly.

## Workflow Steps

1. Read the references and record the source's content and structure: section/slide purpose, claims, figures and units, evidence links, qualifications, actions, visuals, and speaker notes. Preserve quotations and required wording.
2. Choose the requested target adapter and its installed specialist skill. Honor templates, editability, and offline needs. Do not select a conversion tool merely because it is first in a fixed fallback list.
3. Rebuild for the target format. Preserve the reasoning and message hierarchy, including the relationship between rules, supporting details, and examples. Apply PersonalStyleGuide.md to prose actually being revised; a format-only conversion is not permission to change claims or tone wholesale.
4. Compare the original and converted content. Record omitted/moved material, changed chart meanings, layout drift, font substitutions, and notes-transfer gaps in a Fidelity Risk Log. Move essential caveats into visible content when the destination lacks notes.
5. Run the target adapter's file and rendered checks. Inspect the whole output, repair material issues, and re-render affected content.
6. Run ReadabilityGate with the target artifact, inherited content type (or `general`), target format, and reconstructed brief. Include its independent reader test. Use at most two review/repair cycles across this workflow.
7. Deliver the artifact, conversion method, Fidelity Risk Log, and readiness/comprehension/verification statuses. State what is still missing or changed.
