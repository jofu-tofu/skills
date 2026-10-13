# RepurposeDocument Workflow

> **Trigger:** "convert presentation", "html to ppt", "ppt to html", "html to powerpoint", "powerpoint to html", "turn into powerpoint", "change format", "convert format"

## Reference Material

- `../Standards/FormatAdapters.md` — Source and target format handling
- `ReadabilityGate.md` — The review panel

## Purpose

Convert a document without losing its meaning, and explain anything the conversion changes or leaves out. HTML and PPT are equal options; other formats need a supported adapter. Converting back may not reproduce the original layout.

## Workflow Steps

1. Record the source's content and structure: each section or slide's purpose, claims, figures and units, evidence, qualifications, actions, visuals, and speaker notes. Preserve quotations and required wording.
2. Choose the target adapter and its installed specialist skill. Honor templates, editability, and offline needs.
3. Rebuild for the target format, keeping the reasoning and the message hierarchy. A format-only conversion is not permission to change claims or tone. Run the target format's file check.
4. Compare the original and converted content. Record omitted or moved material, changed chart meanings, layout drift, font substitutions, and notes-transfer gaps in a Fidelity Risk Log. Move essential caveats into visible content when the target has no notes.
5. Run ReadabilityGate with the target artifact, the inherited content type, the target format, the reconstructed brief, the original document as the source, the file check result as `verification_evidence`, and `edit_scope: conversion`.
6. Deliver the artifact, the conversion method, the Fidelity Risk Log, and the gate's statuses. State what is still missing or changed.
