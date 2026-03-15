### AI Context Layers

**Source:** Kaushik Gopal et al., "Agent READMEs: Grounding LLM Agents" (2024); Chroma Research, "Context Window Decay" (2024); Anthropic, CLAUDE.md conventions (2024-2025)

**Impact: HIGH — AI agents consume documentation differently than humans; optimizing for agents requires different strategies**

> AI agents read through context windows with hard token limits. Every low-value token displaces high-value context. Write dense, scoped, layered documentation for agent consumption.

---

## The Context Layer Model

```
Layer 0: System prompt         (always loaded, highest priority)
Layer 1: Project context       (CLAUDE.md, AGENTS.md — loaded at session start)
Layer 2: Skill/tool context    (loaded on invocation)
Layer 3: File-level context    (loaded when reading specific files)
Layer 4: Retrieved context     (search results, fetched docs)
```

Each layer deeper is less reliably consumed. Place critical instructions in earlier layers.

---

## Evidence

| Source | Finding |
|--------|---------|
| **Gopal et al. (2024)** | Agents perform better with explicit, scoped instructions than comprehensive documentation. Layered context outperforms flat context. Instructions closer to point of use are followed more reliably. Contradictions across layers degrade performance unpredictably. |
| **Chroma Research (2024)** | Middle-positioned content suffers "lost in the middle" effects. Shorter high-density context outperforms longer low-density context. Duplicate or contradictory information amplifies retrieval errors. |

---

## Writing Constraints for AI Context Files

Two constraints govern what belongs in AI context files:

| Constraint | Rule | Rationale |
|------------|------|-----------|
| **Tool-use filter** | Only document what agents cannot discover via Glob, Grep, and Read in one tool call | Modern agents actively discover file structure and contents. Context files capture *why* a non-obvious structure exists, what to avoid, and which conventions are invisible in any single file. |
| **Multi-agent isolation** | Each context file must be interpretable in isolation — no assumed knowledge from sibling or parent files | Multiple agents work in different directories concurrently with no shared context. Design for independent consumption, not sequential reading. |

---

## Layer Strategy

### Layer 1: Project Context (CLAUDE.md, AGENTS.md)

Global rules for every interaction. **Density: Extreme** — every token competes.

| Include | Exclude |
|---------|---------|
| Build/test/deploy commands | General programming advice (agent already knows) |
| Project-specific coding conventions | Lengthy explanations of *why* (put in ADRs) |
| File structure orientation | Information that changes frequently (high rot risk) |
| Constraints and prohibitions | |

### Layer 2: Skill/Tool Context

Domain-specific instructions loaded on invocation. **Density: High** — more room for examples than Layer 1. Skills add expertise to context without consuming tokens when unused.

### Layer 3: File-Level Context

Instructions scoped to specific files or directories. Comments, docstrings, and inline instructions the agent encounters when reading code.

### Layer 4: Retrieved Context

On-demand information via search, tool calls, or explicit reads. **Reliability: Lowest** — agent must know to look for it.

---

## Writing for Agents vs. Humans

| Aspect | Human Reader | AI Agent |
|--------|-------------|----------|
| **Navigation** | Skims, searches, jumps | Linear context consumption |
| **Length tolerance** | Will skim long docs | Long context = diluted signal |
| **Contradictions** | Resolves with judgment | Follows whichever instruction it encounters |
| **Format preference** | Prose with headings | Tables, lists, explicit rules |
| **Persistence** | Remembers across sessions | Each session starts fresh |

---

## Anti-Patterns in AI Context

| Anti-Pattern | Effect | Instead |
|--------------|--------|---------|
| **Everything in CLAUDE.md** | Token bloat, key instructions lost in noise | Layer by importance; load on demand |
| **Prose paragraphs** | Agents extract rules less reliably from prose | Use tables, bullet lists, explicit rules |
| **"See also" references** | Agent may not follow the link | Include critical information inline |
| **Append-only updates** | Contradictions accumulate | Replace stale content entirely |
| **Duplicated across layers** | Contradictions when one copy rots | Single source, reference from other layers |

---

## The Context Budget

```
Total context window:   200,000–1,000,000 tokens (model-dependent)
System prompt:                    ~2,000 tokens
Project context:                  ~3,000 tokens  ← CLAUDE.md budget
Conversation history:           ~50,000+ tokens  ← grows during session
Working space:              remainder of window  ← code, search results, tool output
```

Larger context windows do not reduce the importance of density. Every token in CLAUDE.md permanently reduces working space for every interaction — and "lost in the middle" effects (Chroma, 2024) mean that mid-window content is retrieved less reliably regardless of total window size. Make each token earn its place.

---

## The Test Question

**"If I removed this line from the AI context file, would agent behavior degrade in a way I'd notice?"**

If no — the line consumes tokens without providing value. Remove it.
