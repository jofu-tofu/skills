---
name: FindSimilarSkill
description: Search for existing skills similar to what you want. USE WHEN user wants to find a skill, discover existing skills, search for capabilities, check if a skill exists, find similar tools, look for commands, OR wants to know what skills are available for a specific task.
compatibility: Designed for Claude Code and Devin (or similar agent products). Benefits from internet access for external skill discovery.
metadata:
  author: pai
  version: "1.0.0"
---

# FindSimilarSkill

Searches for skills and capabilities that match what you're looking for — both inside PAI and across the community online.

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Search** | any search for existing skills | `Workflows/Search.md` |

## Examples

**Example 1: Find an internal skill for a task**
```
User: "Is there a skill for resizing images?"
→ Invokes Search workflow
→ Searches PAI internal skills via SkillSearch.ts
→ Searches GitHub for Claude Code community skills
→ Returns: Internal matches + External community results
```

**Example 2: Discover what capabilities exist before creating**
```
User: "Find a similar skill to what I want to build for note-taking"
→ Invokes Search workflow
→ Queries: "note-taking notes writing"
→ Returns PAI skills + GitHub repos matching the intent
```

**Example 3: Check if skill already exists**
```
User: "Does PAI have anything for web scraping?"
→ Invokes Search workflow
→ Returns internal scraping/browser/web skills
→ Returns external community scraping skill repos
```
