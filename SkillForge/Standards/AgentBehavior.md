# Agent Behavior: Empirical Findings for Skill Design

> Calibrated for: 2024-2025 frontier models (Claude 4.x, GPT-4o, Gemini 2.x)
> Last reviewed: 2026-02-24
> Update trigger: Revisit when a new major model family ships or when findings are contradicted by 2+ subsequent studies

---

## Principles

### 1. Attention Is Finite

Every token of instruction dilutes attention to everything else. This is the mathematical reality of transformer attention — not a metaphor. The optimal instruction set is the **minimum viable set** that produces desired behavior.

Adding instructions has a cost (diluting attention to all other instructions), not just a benefit (adding guidance). Cut ruthlessly.

### 2. Lost in the Middle

Models perform best when relevant information is at the **beginning or end** of context. Performance **significantly degrades** for middle-positioned content — a U-shaped attention curve.

- Strongest recall: positions 1-3 and final positions
- Weakest recall: middle of long contexts
- Holds true even for models explicitly trained for long contexts

**Design implication:** Place critical instructions (routing tables, mandatory behaviors) at the top or bottom of files. Never bury important rules in the middle of a long document.

*Liu et al. 2024, TACL*

### 3. Context Rot

Performance degrades proportionally with token count, **even when the model perfectly retrieves the information**. More tokens = worse reasoning about those tokens.

- Position bias emerges strongly beyond ~2,500 tokens
- Effective context is approximately **50% of the advertised window**
- Irrelevant padding degrades performance proportionally — every unnecessary line costs you

**Design implication:** Shorter files aren't just easier to read — they produce measurably better agent compliance. A 400-line SKILL.md actively harms performance compared to a 100-line one.

*Chroma 2025; EMNLP 2025*

### 4. Multi-Turn Degradation

Agents exhibit a **39% average performance drop** across multi-turn conversations. Once they make a wrong decision, they do not self-correct — errors compound.

- Agents make assumptions in early turns and over-rely on those assumptions later
- Conversational context becomes a liability, carrying forward errors
- The "concat-and-retry" approach (fresh context with consolidated info) restores accuracy above 90%

**Design implication:** Sub-agents with fresh context windows outperform long-running agents following accumulated instructions. Design workflows to use focused sub-agents for discrete tasks rather than relying on a single agent across many turns.

*Microsoft Research & Salesforce Research 2025, arXiv 2505.06120*

### 5. Training Data Gravity

When instructions conflict with how the model was trained, **training patterns usually win**. This is structural, not a bug to be patched.

- Individual constraint accuracy: 74.8-90.8%
- When constraints **conflict** with training patterns: only 9.6-45.8% compliance
- Societal framings from pretraining override engineered hierarchies (47.5% → 77.8% with social consensus framing)
- Models rarely acknowledge the conflict (0.1-20.3% across models)

**Design implication:** Frame instructions to align with, not fight against, trained patterns. "Do Y" works better than "Never do X" because prohibitions fight the model's default behaviors. Use tooling enforcement for hard requirements.

*"Control Illusion" 2025, arXiv 2502.15851*

### 6. ~150-200 Reliable Instruction Slots

Frontier models reliably follow approximately 150-200 instructions. Claude Code's system prompt uses ~50, leaving **~100-150 for all loaded skills combined**.

- A 2,000-line CLAUDE.md can exhaust ~1.8% of available context before conversation starts
- Every skill loaded competes for the same budget
- Skill metadata alone (names + descriptions) has a ~16,000 character budget

**Design implication:** Skills must be token-efficient. SKILL.md is a routing document, not a reference manual. Move detailed content into Standards/ or Workflows/ loaded only when needed.

*Community empirical; alexey-pelykh skill budget research*

### 7. Progressive Disclosure Wins

Load only what's needed for the current task. Three tiers:

1. **Metadata** (always loaded): Skill name + description (~130-263 chars)
2. **SKILL.md** (on demand): Routing table + examples (<500 lines recommended)
3. **Helper assets** (during execution): Standards, workflows, tools — loaded only by the workflow that needs them

**Design implication:** A skill that front-loads all its reference material into SKILL.md wastes tokens on every invocation, even when only one workflow runs.

*Anthropic "Context Engineering" 2025; alexop.dev empirical*

### 8. Examples Beat Rules

Few-shot examples improve tool selection from **72% → 90%**. Models match against concrete patterns more reliably than they interpret abstract rule descriptions.

- Examples serve as "canonical patterns" the model can match against
- Lists of rules require interpretation; examples demonstrate directly
- Diverse examples covering common cases are more effective than exhaustive rule lists

**Design implication:** Every skill should include 2-3 realistic examples showing user input → expected behavior. A worked example in a workflow is worth more than a page of process rules.

*Anthropic "Context Engineering" 2025*

### 9. Tooling Beats Instructions

Automated enforcement (linters, validators, CI) is more reliable than asking agents to follow process rules. Micro-step disciplines ("build after every file change", "commit after every modification") are routinely violated without enforcement.

- "The tool enforces it" beats "the instruction requests it"
- One line (`Run pnpm lint:fix after changes`) replaces paragraphs of style guidance
- Process instructions without enforcement are treated as suggestions

**Design implication:** If compliance is critical, enforce it with tooling. Use instructions for judgment calls and heuristics; use tools for mechanical requirements.

*Community empirical; Anthropic best practices*

### 10. Positive Framing Beats Prohibition

"Do Y" is more effective than "Never do X." Models acknowledge prohibitions but default to trained patterns anyway.

- NEVER/ALWAYS rules are frequently violated despite being acknowledged
- Providing the positive pattern to follow gives the model a concrete target
- Context manipulation ("prune undesirable paths") outperforms prohibition lists

**Design implication:** Instead of "NEVER modify files directly — always use SkillForge", prefer "Modify skill files through SkillForge workflows, which handle validation and quality gates."

*GitHub issues #6120, #15443, #21119; "Control Illusion" 2025*

### 11. Brevity and Specificity

Short, command-like directives outperform verbose explanations. Quality and structure matter more than comprehensiveness.

- Shallow hierarchy (single H1, ~5 H2, ~9 H3) is the empirical norm for effective instruction files
- Deeper nesting (H4+) correlates with lower compliance
- Action-oriented focus outperforms explanatory prose

**Design implication:** Write instructions like commands, not documentation. Cut explanatory preamble. If a sentence doesn't change agent behavior, delete it.

*PROFES 2025 (253 CLAUDE.md analysis); Agent READMEs 2025 (2,303 files)*

### 12. Fresh Context Resets Compliance

Sub-agents with clean context windows avoid multi-turn degradation. The "concat-and-retry" pattern (consolidate context → fresh instance) restores accuracy above 90%.

- Compaction + memory tools: 39% performance boost, 84% token reduction
- Specialized agents with focused context outperform generalist agents with accumulated context
- Design for context resets, not context accumulation

**Design implication:** Workflows that spawn sub-agents for focused tasks will get better compliance than workflows that try to do everything in a single long conversation.

*Anthropic "Effective Harnesses" 2025; Microsoft/Salesforce 2025*

---

## Key Numbers at a Glance

| Metric | Value | Source |
|--------|-------|--------|
| Multi-turn performance drop | 39% average | Microsoft/Salesforce 2025 |
| Reliable instruction count | ~150-200 | Community empirical |
| System prompt slots used | ~50 | Community empirical |
| Effective context window | ~50% of advertised | EMNLP 2025 |
| Concat-and-retry recovery | >90% accuracy | Microsoft 2025 |
| Examples vs rules improvement | 72% → 90% | Anthropic 2025 |
| Conflicting instruction compliance | 9.6-45.8% | Control Illusion 2025 |

---

## Sources

Citations use "Name + year" format for brevity. Full references with URLs, DOIs, and additional context are in the research document:

`/home/fujos/projects/pai/_output/contexts/260224-1751-review-bigger-picture-than-smaller-turn-review-skill/notes/research-agent-instruction-behavior.md`
