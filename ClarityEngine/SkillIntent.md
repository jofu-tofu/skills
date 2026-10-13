# Why ClarityEngine Exists

Read this file before changing the skill. It explains the choices that future edits should preserve.

## Problem This Skill Solves

A document can look polished while leaving the reader unsure what happened, why it matters, or what to do. ClarityEngine helps the author answer those questions. It plans the explanation before generating the file, then checks whether the result communicates the intended meaning.

## First Principles

1. **Help the reader understand.** Preserve the evidence and reasoning needed to assess the main point.
2. **Put the point first.** Follow it with support and background. Give each section enough context to make sense when read separately.
3. **Explain unfamiliar relationships.** Start from what the audience knows. Use examples, diagrams, or analogies when they clarify the subject.
4. **Preserve meaning when shortening.** Remove filler while keeping causes, caveats, and actions. Repeat a fact when the reader needs it in a summary or another section.
5. **Plan the content before rendering.** Honor the requested format. If none is specified, choose one after understanding how the reader will use the document.
6. **Let format skills handle files.** Keep HTML and PPTX as peer options. Add other formats through FormatAdapters.md without changing the writing principles.

## Design Decisions

| Choice | Reason |
|---|---|
| One creation workflow | The same audience and content decisions apply across formats. |
| Four principles and 23 stable RC checks | Principles guide judgment; checks make specific problems easier to find. Keep one current contract in Philosophy.md. |
| PersonalStyleGuide.md applies throughout | Creation, revision, and conversion should use the user's plain, direct, connected style. |
| A brief comes before rendering | It gives the author an audience, purpose, main point, and evidence needs to work from. |
| Readability scores are optional diagnostics | Sentence length and Flesch scores can flag difficult prose. They cannot prove understanding, and do not apply meaningfully to code or tables. |
| Text and visuals explain the same subject | Choose the combination that makes a relationship clear. Group ideas by meaning rather than fixed counts. |
| A fresh reader answers questions from the document | This tests what the document actually communicates without help from the author's explanation. |
| Content and rendering checks stay separate | Correct text does not prove a slide is legible. A good preview does not prove the file opens in the target app. |
| Philosophy.md can be used on its own | Other skills can read the principles without running ClarityEngine. |
| One adapter index names supported formats | Workflows accept those identifiers; `ppt` and `pptx` select the same PPTX adapter. |

[Anthropic doc-coauthoring](https://github.com/anthropics/skills/blob/main/skills/doc-coauthoring/SKILL.md) provides the fresh-reader pattern. [Impeccable critique](https://github.com/pbakaus/impeccable/blob/main/skill/reference/critique.md) informs the separation of independent judgment and technical evidence. Model reviewers provide useful evidence, but cannot establish human comprehension.

## Success Criteria

- [ ] A Document Brief exists before rendering.
- [ ] Each section provides or links to the context needed to understand it.
- [ ] The reader can follow the assumptions and causal steps.
- [ ] Revisions preserve meaning, caveats, and required actions.
- [ ] Applicable RC checks have recorded results.
- [ ] An automatically selected format has a recorded reason.
- [ ] The selected format has an adapter and verification steps.
- [ ] New formats can be added without rewriting the philosophy.
- [ ] Other skills can use Philosophy.md on its own.
- [ ] Reported readiness matches the evidence.

Use `NeedsRevision` when any Blocker or Major finding remains. Otherwise use `Unverified` when required evidence is missing, and `Ready` only when all required checks pass. Report missing evidence even when a known defect already requires revision.

## Explicit Out-of-Scope

ClarityEngine does not replace a graphic design service, provide unavailable proprietary templates, or promise pixel-identical HTML/PPT conversions. Use a research skill for deep investigations, DocPhilosophy for document placement, and ContextLayer for instructions intended for agents. Other skills are free to use Philosophy.md; they are not required to load it.

## Constraints

Keep Philosophy.md self-contained and under 200 lines. Preserve four principles, all 23 RC IDs, HTML/PPTX support, and existing PresentationForge trigger phrases. Keep workflow triggers natural and distinct. Prefer few dependencies for portable HTML. Length checks must not force missing reasoning, unnecessary analogies, or removal of useful repetition.
