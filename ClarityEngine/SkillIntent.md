# Why ClarityEngine Exists

Read this file before changing the skill. It explains the choices that future edits should preserve.

## Problem This Skill Solves

A document can look polished while leaving the reader unsure what happened, why it matters, or what to do. It can also be accurate and still too long for the reader to finish. ClarityEngine helps the author answer the reader's questions in the reading time the reader has. It plans the explanation before generating the file, then checks whether the result communicates the intended meaning.

## First Principles

1. **Help the reader understand.** Preserve the evidence and reasoning needed to assess the main point.
2. **Put the point first.** Follow it with support and background. Give each section enough context to make sense when read separately.
3. **Explain unfamiliar relationships.** Start from what the audience knows, and state the links between ideas.
4. **Cut what does not serve the reader; keep what connects.** Remove tangents, restatement, and weak points. Keep causes, caveats, actions, and the words that link them.
5. **Plan the content before rendering.** Honor the requested format. If none is specified, choose one after understanding how the reader will use the document.
6. **Let format skills handle files.** Keep HTML and PPTX as peer options. Add other formats through FormatAdapters.md without changing the writing principles.

## Design Decisions

| Choice | Reason |
|---|---|
| One creation workflow | The same audience and content decisions apply across formats. |
| Four principles, stable RC IDs | Principles guide judgment; checks make specific problems easier to find. An RC ID keeps its topic and is never reused for a different one. |
| Each RC lives in exactly one lens file | One home per rule removes repetition, and each reviewer grades only the rules it owns. Philosophy.md keeps the principles and an index. |
| Separate lens reviewers, run in parallel | A reviewer that reads only its own rules and never sees other findings gives independent evidence. Agreement between lenses then means something. |
| Opposing pressures go to different lenses | The Cutter argues for removal and the Logician and Reader for explanation, so neither pushes the document to an extreme. |
| Reviewers grade pass/fail with quoted evidence, never scores | Model judges favor longer text, and holistic scores are where that bias acts most. Additions must name the reader question they answer. |
| A separate Verifier decides which findings stand | The author tends to favor its own draft, so it applies fixes but does not adjudicate them. |
| Mechanical checks are a script | Word counts, first sentences, emphasis, truncation, and lost connectives need counting, not judgment. |
| A brief with a reading-time budget comes before writing | It gives the author an audience, purpose, main point, evidence needs, and a length target derived from the reading rate. |
| Readability scores are optional diagnostics | Formula scores predict comprehension poorly and do not apply to code or tables. |
| A fresh reader answers questions from the document | This tests what the document communicates without the author's explanation. |
| Plain wording is generated and selected, not only flagged | Reviewers who know the subject read its terms as plain, so findings quoted one at a time leave most jargon in place. Three rewrites with different strategies, scored by fixed meaning gates and plainness signals, give a repeatable choice, and a fresh reader checks what the gates can't see. |
| Content and rendering checks stay separate | Correct text does not prove a slide is legible. A good preview does not prove the file opens in the target app. |
| Philosophy.md can be used on its own | Other skills can read the principles and the check index without running ClarityEngine; the full checks are in the lens files. |

The research behind these choices is summarized in each lens file's sources. [Anthropic doc-coauthoring](https://github.com/anthropics/skills/blob/main/skills/doc-coauthoring/SKILL.md) provides the fresh-reader pattern. The CodeReview skill provides the lens, contract, and verifier structure.

## Success Criteria

- [ ] A Document Brief with a reading-time budget exists before rendering.
- [ ] Every RC ID appears in exactly one lens file.
- [ ] Each lens agent's inputs exclude other lens files and other reviewers' output.
- [ ] The Reader never receives the brief or the answer key.
- [ ] Every verified finding cites a quote, an RC, and a reader harm.
- [ ] Every addition finding names a reader question.
- [ ] The Verifier, not the author, records which findings stand.
- [ ] Revisions preserve meaning, caveats, required actions, and stated links.
- [ ] PlainRewrite never applies a candidate that failed a gate or the meaning check.
- [ ] Reported readiness matches the evidence, as Verify.md defines it.
- [ ] New formats can be added without rewriting the philosophy.

## Explicit Out-of-Scope

ClarityEngine does not replace a graphic design service, provide unavailable proprietary templates, or promise pixel-identical HTML/PPT conversions. Use a research skill for deep investigations, DocPhilosophy for document placement, and ContextLayer for instructions intended for agents. Other skills are free to use Philosophy.md; they are not required to load it.

## Constraints

Keep Philosophy.md self-contained and under 200 lines. Preserve four principles, RC IDs 1–30 and their topics, HTML/PPTX support, and existing PresentationForge trigger phrases. Keep workflow triggers natural and distinct. Prefer few dependencies for portable HTML. Length budgets are diagnostics: they must not force out missing reasoning or useful repetition. A rule moves between lenses only by updating both the lens files and the Philosophy.md index together.
