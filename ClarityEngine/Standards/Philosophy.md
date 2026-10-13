# Comprehension Principles

Help the reader understand, decide, or act. Use familiar words and explain how each conclusion follows. Keep what the reader needs and remove what they do not: missing steps make readers piece the explanation together, and extra passages cost time and push the important parts out of reach.

These four principles explain why the checks exist. Any agent producing content for people can apply them without running ClarityEngine. The checks themselves, with their rules, tests, examples, and sources, live in the lens files listed in the Readability Contract below.

---

## The Core Principles

### 1. Layman First, Expert Second

Readers decide from the first words whether to keep going, and they read closely only what serves their task. So the point, the ask, and the context come first, and the reader can find each part without reading everything. Depth follows what this audience already knows.

**Test:** Pick a section at random. Can an unfamiliar reader identify its point from the heading and first sentence, and find the context needed to understand it?

### 2. Evidence Over Assertion

Readers can only weigh a conclusion they can trace. So each material claim shows its evidence, says whether it was observed, inferred, or proposed, and carries the uncertainty that could change a decision.

**Test:** For each material claim, can the reader tell how it is known and what would change it?

### 3. Bridge to the Known

Readers follow logic they can see and words they already use. So the document starts from the reader's question, states how each step leads to the next, and explains the unfamiliar in familiar terms.

**Test:** Can the reader explain how the unfamiliar parts relate using only the document?

### 4. Meaning Before Brevity

Reading costs time, and extra words get far less attention than they need. So every passage earns its place, and cutting removes tangents and restatement, never the reasoning that connects the claims.

**Test:** Delete a passage hypothetically. If nothing the reader needs is lost, delete it; if the reader can no longer say why the conclusion follows, restore the missing step.

---

## The Readability Contract

Each check has a stable RC ID and exactly one owning lens. This table is the index. Apply only relevant checks and record `N/A` with a reason. Numeric guidelines are diagnostics, not pass/fail limits, unless the brief or an accessibility requirement makes them binding.

| ID | Check | Principle | Lens |
|---|---|---|---|
| RC-1 | Summary prose suits the intended reader | 3 | `Lenses/AudienceFit.md` |
| RC-2 | Plain language replaces unnecessary jargon | 3 | `Lenses/AudienceFit.md` |
| RC-3 | Headings mark real topic changes; each section has one job | 1 | `Lenses/Navigator.md` |
| RC-4 | Long artifacts provide navigation | 1 | `Lenses/Navigator.md` |
| RC-5 | Sections and paragraphs open with their point, not background | 1 | `Lenses/Navigator.md` |
| RC-6 | Headings predict what their section concludes | 1 | `Lenses/Navigator.md` |
| RC-7 | Examples clarify claims; uncertainty is marked | 2 | `Lenses/Logician.md` |
| RC-8 | Related ideas are grouped; structure fits the content and task | 1 | `Lenses/Navigator.md` |
| RC-9 | Skimmers and early leavers still get the main argument | 1 | `Lenses/Navigator.md` |
| RC-10 | Bold forms a skim layer that summarizes the document | 1 | `Lenses/Navigator.md` |
| RC-11 | Diagram labels use verified identifiers or defined groups | 2 | `Lenses/Visual.md` |
| RC-12 | Diagrams explain their purpose and notation | 3 | `Lenses/Visual.md` |
| RC-13 | Material claims are traceable; inference is distinguished | 2 | `Lenses/Logician.md` |
| RC-14 | Contrast and color meet accessibility needs | 1 | `Lenses/Visual.md` |
| RC-15 | Code is accurate and legible | 2 | `Lenses/Visual.md` |
| RC-16 | Each passage survives the deletion test | 4 | `Lenses/Cutter.md` |
| RC-17 | Supporting sentences add substance | 4 | `Lenses/Cutter.md` |
| RC-18 | No accidental duplication | 4 | `Lenses/Cutter.md` |
| RC-19 | The main path fits its reading-time budget | 4 | `Lenses/Cutter.md` |
| RC-20 | Sentences state who does what, directly | 3 | `Lenses/AudienceFit.md` |
| RC-21 | Depth matches the reader's expertise | 1 | `Lenses/AudienceFit.md` |
| RC-22 | Examples and analogies bridge a real gap | 3 | `Lenses/Logician.md` |
| RC-23 | The question being answered is explicit | 1 | `Lenses/Navigator.md` |
| RC-24 | Interesting but off-argument material is cut or fenced | 4 | `Lenses/Cutter.md` |
| RC-25 | Links between claims are stated, not left to inference | 3 | `Lenses/Logician.md` |
| RC-26 | The opening states the ask, the stakes, and what to look at | 1 | `Lenses/Navigator.md` |
| RC-27 | Decision and customer documents open with a labeled decision block | 1 | `Lenses/Navigator.md` |
| RC-28 | Caveats travel with the summary | 2 | `Lenses/Logician.md` |
| RC-29 | Register is plain but not casual, and fits the genre | 3 | `Lenses/AudienceFit.md` |
| RC-30 | Slide text fits how the deck is delivered | 1 | `Lenses/Visual.md` |

Comprehension (`Lenses/Reader.md`) has no RC ID. A fresh reader checks it by answering questions from the document.

---

## How to Use This File

Read these principles before writing, then read the lens files for the checks the draft will face. Correctness and necessary reasoning take priority over brevity. ClarityEngine's ReadabilityGate workflow runs the lenses as separate reviewers, and its Verify workflow decides which findings stand.
