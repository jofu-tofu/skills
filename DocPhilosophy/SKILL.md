---
name: DocPhilosophy
description: Philosophical framework for documentation placement decisions. USE WHEN deciding where documentation belongs OR evaluating doc placement strategy OR discussing context rot OR signal-to-noise in docs OR AI context file design OR docs going unread OR codebase vs knowledge base OR doc placement architecture OR ADR placement OR docs-as-code philosophy. Contains 7 principles from authoritative sources for documentation that survives and serves.
compatibility: Designed for Claude Code and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.0.0"
---

# DocPhilosophy

> Documentation fails not because it's poorly written, but because it's poorly placed.

7 principles for deciding *where* docs belong — not how to write them. Reference skill; no workflows. Invoke principles directly from `Rules/`.

---

## The Placement Principle

Place documentation where it will be **maintained** and **consumed**. Two forces govern survival:

| Force | Mechanism | When Misaligned |
|-------|-----------|-----------------|
| **Maintenance proximity** | Docs near their subject get updated when the subject changes | Docs drift into fiction |
| **Consumption context** | Docs in the reader's workflow get read | Docs go unread regardless of quality |

When both forces align, documentation thrives. When they diverge, it rots. Every placement decision optimizes for this alignment.

---

## The Three Laws

| Law | Statement | Consequence |
|-----|-----------|-------------|
| **Proximity** | Docs near code survive; distant docs decay | Prefer inline > repo > wiki > external |
| **Ownership** | Every doc needs exactly one accountable owner | Ownerless docs die within months |
| **Signal Density** | Small, dense docs outperform large, comprehensive ones | Cognitive load kills consumption |

Every placement decision satisfies all three. When tensions arise — e.g., Proximity pushes toward inline comments but Signal Density warns against bloat — resolve in favor of the law whose violation causes faster decay. Proximity violations rot in months; Signal Density violations reduce consumption immediately. Judge by the specific scenario.

**Signal Density for AI context files:** Root-level files are always-on — permanent token cost per interaction. Directory-level files are on-demand — cost paid only during scoped work. Apply a stricter density and falsifiability bar to root content than to directory-local content.

---

## Decision Tree

Route documentation to its correct location:

```
Who is the primary audience?
│
├─ AI AGENTS (Claude, Copilot, etc.)
│  └─ AI Context Files
│     CLAUDE.md, AGENTS.md, skill files
│     See: Rules/AIContextLayers.md
│
├─ FUTURE DEVELOPERS (including future-you)
│  │
│  ├─ Is this a WHY decision?
│  │  ├─ YES, architectural → Architecture Decision Records
│  │  │  Immutable, append-only, in repo
│  │  │  See: Rules/WhyNotWhat.md
│  │  │
│  │  └─ YES, code-level → Inline Code Comments
│  │     Why this approach, not what it does
│  │     See: Rules/WhyNotWhat.md
│  │
│  └─ Is this onboarding/reference?
│     └─ YES → Project Documentation
│        README, docs/, API reference
│        See: Rules/ProximityPreventsRot.md
│
├─ ONLY ME (personal learning, insights)
│  └─ Personal Knowledge Base
│     Obsidian vault, personal notes
│     See: Rules/KnowledgeIsPerishable.md
│
└─ EVOLVING TEAM UNDERSTANDING
   └─ Living Design Docs
      Design docs that evolve with the system
      See: Rules/ContextRotIsReal.md
```

---

## Placement Categories

### 1. Inline Code Comments

Capture intent behind non-obvious decisions. The *why*, never the *what*.

```
// BAD: Increment counter by one
counter += 1;

// GOOD: Offset by 1 because the API uses 1-based indexing
// while our internal model is 0-based (see ADR-0012)
counter += 1;
```

**Test:** Would deleting this comment lose information the code itself cannot convey? If no, delete it.

### 2. AI Context Files

Instructions shaping AI agent behavior: CLAUDE.md, AGENTS.md, skill files, system prompts.

These are documentation *for* agents operating within the system — not documentation *about* the system. Different audience, different density requirements.

**Constraint:** Context windows are finite. Every low-value token displaces a high-value one. See `Rules/AIContextLayers.md` for the full context layer model, writing constraints (tool-use filter, multi-agent isolation), and budget guidance.

### 3. Architecture Decision Records (ADRs)

The *why* behind architectural choices. Immutable once written — record a new ADR to supersede, never edit the old one.

| Field | Content |
|-------|---------|
| **Status** | Accepted, Superseded, or Deprecated |
| **Context** | Forces that led to this decision |
| **Decision** | What was chosen |
| **Consequences** | Tradeoffs accepted |

**Placement:** In the repository near the code they govern. `docs/adr/` or `docs/decisions/`.

### 4. Project Documentation

Onboarding material, API reference, contribution guides, deployment procedures — anything a new team member needs to become productive.

**Test:** If the code moves, does this doc move with it? If yes → repo. If no → reconsider whether it belongs at all.

### 5. Personal Knowledge Base

Human-readable insights, learning notes, cross-project patterns, personal reflections.

**Rule:** Personal insights go to personal KB; codebase knowledge stays in the codebase. See `Rules/KnowledgeIsPerishable.md` for the Obsidian Principle and externalization guidance.

### 6. Living Design Docs

Design documents that evolve as understanding deepens. Unlike ADRs (immutable records), these track *current* design thinking.

**Warning:** Most susceptible to context rot. Require active ownership and review on the cadence defined in `Rules/ContextRotIsReal.md` (fresh <3 months, aging 3-6, stale 6-12, rotten 12+) to survive.

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Place Here Instead |
|--------------|-------------|-------------------|
| **Monolithic wiki** | No ownership, no proximity, infinite scope | Docs in repo near code |
| **README that explains everything** | Cognitive overload, stale within weeks | Thin README pointing to specific docs |
| **Comment every line** | Noise destroys signal, maintenance cost explodes | Comment only non-obvious *why* |
| **Documentation sprint** | Creates docs nobody maintains after sprint ends | Continuous docs alongside code changes |
| **Duplicating across locations** | One copy rots, contradictions emerge | Single source of truth, link elsewhere |
| **Template-driven docs** | Fills sections for compliance, not communication | Write what the reader needs to know |

---

## Examples

**Example 1: New API endpoint**
```
User: "I added a new /users/export endpoint. Where should I document it?"
→ API reference in docs/ (Project Documentation — consumed by developers)
→ Inline comment on rate limit decision (Why, not What)
→ ADR if the export format was a contested decision
→ NOT in Obsidian (it's for the team, not personal learning)
```

**Example 2: Choosing a database**
```
User: "We picked PostgreSQL over MongoDB. Where does this go?"
→ ADR in docs/decisions/ (immutable why-record)
→ Brief mention in README's tech stack section
→ Obsidian note on the evaluation process (personal learning)
→ NOT as inline comments (architectural, not code-level)
```

**Example 3: AI agent instructions**
```
User: "Claude keeps formatting PRs wrong in this repo"
→ CLAUDE.md with PR formatting rules (AI Context File)
→ Dense, scannable, no prose — context window is finite
→ NOT in README (humans don't need this; agents do)
→ NOT in wiki (agents can't read your wiki)
```

---

## Rule File Index

| File | Principle | Read When |
|------|-----------|-----------|
| `Rules/ProximityPreventsRot.md` | Docs near code survive; distant docs decay | Choosing between repo, wiki, or external |
| `Rules/OwnershipIsNonNegotiable.md` | Ownerless docs die | Setting up documentation governance |
| `Rules/SignalOverNoise.md` | Cognitive load theory applied to docs | Docs are too long or going unread |
| `Rules/WhyNotWhat.md` | Document intent, not mechanics | Writing comments or ADRs |
| `Rules/ContextRotIsReal.md` | Documentation decays in code and AI contexts | Evaluating doc freshness strategy |
| `Rules/AIContextLayers.md` | How AI agents consume documentation | Writing CLAUDE.md, AGENTS.md, or skill files |
| `Rules/KnowledgeIsPerishable.md` | Organizational forgetting; externalize or lose | Deciding what to capture and where |

---

## Authoritative Sources

| Source | Author(s) | Year | Key Contribution |
|--------|-----------|------|------------------|
| Software Engineering at Google | Winters, Manshreck, Wright | 2020 | Documentation ownership, freshness, proximity principles |
| Diataxis Framework | Daniele Procida | 2017 | Four documentation types: tutorials, how-to, explanation, reference |
| Documenting Architecture Decisions | Michael Nygard | 2011 | ADR format and immutable decision records |
| Cognitive Load Theory | John Sweller | 1988 | Extraneous load reduces learning; signal density matters |
| The Software Engineer's Guidebook | Gergely Orosz | 2023 | Practical documentation culture in engineering teams |
| An Empirical Study of Documentation Decay | Wen Tan et al. | 2023 | Measured rates of doc-code inconsistency in real projects |
| GitHub Developer Survey | GitHub | 2023 | 93% say docs are important; 60% say docs are inadequate |
| 18F Documentation Guide | 18F (US Government) | 2020 | Docs-as-code principles and ADR adoption |
| Organizational Forgetting | Argote, Beckman, Epple | 1990 | Knowledge depreciation curves in organizations |
| Knowledge Management in Project-Based Organizations | Klammer, Gueldenberg | 2019 | Externalization prevents knowledge loss |
| Agent READMEs: Grounding LLM Agents | Kaushik Gopal et al. | 2024 | How AI agents consume repository-level documentation |
| Chroma Research: Context Window Decay | Chroma | 2024 | Token position effects on retrieval accuracy in LLM contexts |
