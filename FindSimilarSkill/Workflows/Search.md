# FindSimilarSkill — Search Workflow

Search for existing skills similar to what the user wants, checking both PAI internals and community sources online.

---

## Step 1: Extract the Search Query

Identify the user's intent from their request. Extract 2-4 key terms that describe what capability they're looking for.

Example: "Is there a skill for resizing images?" → query: `image resize`

---

## Step 2: Search PAI Internal Skills

Run the internal skill search using `SkillSearch.ts`:

```bash
bun $PAI_DIR/skills/PAI/Tools/SkillSearch.ts "<query terms>"
```

If `skill-index.json` does not exist (not yet generated), fall back to scanning SKILL.md files:

```bash
grep -rl "<query terms>" $PAI_DIR/skills/*/SKILL.md 2>/dev/null | head -10
```

Collect any matches and their descriptions.

---

## Step 3: Search Community / Online Sources

Search these **known registries and collections** for skills matching the query. Use WebSearch for live results.

### 3a — Curated Community Lists (search these first)

These are the primary community skill collections. WebSearch each for the topic:

| Source | What It Contains | Search Strategy |
|--------|-----------------|-----------------|
| `github.com/hesreallyhim/awesome-claude-code` | Primary curated Claude Code skills, hooks, commands | WebSearch: `site:github.com/hesreallyhim/awesome-claude-code <topic>` |
| `github.com/VoltAgent/awesome-agent-skills` | 300+ agent skills (Claude, Codex, Gemini compatible) | WebSearch: `site:github.com/VoltAgent/awesome-agent-skills <topic>` |
| `github.com/rohitg00/awesome-claude-code-toolkit` | 135 agents, 35+ skills, 42 commands, plugins, hooks | WebSearch: `rohitg00 awesome-claude-code-toolkit <topic>` |
| `github.com/wshobson/commands` | 57 production-ready slash commands (15 workflows, 42 tools) | WebSearch: `site:github.com/wshobson/commands <topic>` |
| `github.com/danielrosehill/Claude-Slash-Commands` | Personal reusable slash commands collection | WebSearch: `site:github.com/danielrosehill/Claude-Slash-Commands <topic>` |

### 3b — Official & Verified Registries

| Source | What It Contains | URL |
|--------|-----------------|-----|
| **Vercel Agent Skills** | Official agent skills (React, web, deploy) + `npx skills` discovery CLI | `github.com/vercel-labs/agent-skills` |
| **GitHub Topic: claude-code** | All repos tagged with the claude-code topic | `github.com/topics/claude-code` |
| **GitHub Topic: claude-commands** | Repos focused on slash commands | `github.com/topics/claude-commands` |
| **Tessl Registry** | Indexed Claude Code skills from GitHub repos | `tessl.io/registry` |

### 3c — MCP Servers & Tools (if query relates to tools/integrations)

If the user is looking for tools, integrations, or server capabilities (MCP = Model Context Protocol):

| Source | What It Contains | URL |
|--------|-----------------|-----|
| **Official MCP Registry** | Canonical source, Anthropic-backed, API-stable v0.1, community-owned | `registry.modelcontextprotocol.io` |
| **PulseMCP** | Largest active directory — 8,380+ servers, updated daily | `pulsemcp.com/servers` |
| **mcp.so** | Call-volume ranked leaderboard, featured/latest/official filters | `mcp.so` |
| **Smithery** | MCP server discovery and integration hub | `smithery.ai` |
| **punkpeye/awesome-mcp-servers** | Most-referenced GitHub curated MCP list | `github.com/punkpeye/awesome-mcp-servers` |
| **wong2/awesome-mcp-servers** | Widely cited second curated list | `github.com/wong2/awesome-mcp-servers` |
| **GitHub Topic: mcp-server** | All repos tagged mcp-server | `github.com/topics/mcp-server` |

### 3d — Broad GitHub Search (fallback)

If the above don't yield results, run a general search:
- WebSearch: `"claude code" skill "<topic>" site:github.com`
- WebSearch: `"claude code" command "<topic>" github 2025`

Collect up to 5 relevant external results with URLs and brief descriptions.

---

## Step 4: Present Results

Output results in two clearly labeled sections:

```
## 🔍 Search Results for: "<query>"

---

### 📦 PAI Internal Skills

[List any matching PAI skills found, with name + brief description + how to invoke]

If none: "No internal skills found matching this query."

---

### 🌐 Community / External Skills

[List up to 5 external GitHub repos or skill collections found, with URL + description]

If none: "No community skills found for this query."

---

### 💡 Recommendation

[Based on what was found:]
- If internal match exists: "Use the [SkillName] skill — invoke with `/skill-name`"
- If external match exists: "Consider adapting [repo name] for PAI"
- If nothing found: "No existing skill found — you may want to create one with the CreateSkill skill"
```

---

## Notes

- Always show internal results first, external results second
- Keep external results to a maximum of 5 to avoid overwhelming output
- If the user seems to want to CREATE a skill rather than find one, suggest the CreateSkill skill
- The search is fuzzy — show results that are conceptually related, not just exact keyword matches
- **Vercel has a `find-skills` skill itself** — if the user has Node.js, `npx skills` can discover Vercel-compatible agent skills from the CLI
- **URL caution:** AI-generated URLs can be wrong. Always present URLs as "reported" and suggest the user verify them before use
- MCP servers are different from Claude Code skills — MCP adds tools/capabilities at the protocol level, while skills are workflow prompts. Clarify which the user wants if ambiguous
