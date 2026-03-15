# AGENTS.md

## Repo purpose

This repo stores shared LLM skills.

## Skill layout

- The repo root contains the active skill directories for this repo.
- `skill-index.json` is also stored at the repo root.
- `Prompting/` is a promoted root-level copy of the former `Utilities/Prompting` sub-skill.
- `ResearchLegacy/Research` remains as a nested skill.
- `Thinking/` and `Utilities/` were intentionally removed from this repo during the split from PAI.

## Current caveat

- Some imported skills still contain `$PAI_DIR` and other PAI-specific references.
- This repo now intentionally diverges from `/home/joshua-fu/projects/pai/skills`.
- The remaining intentional overlap with PAI is `Prompting`.

## Useful verification

- Run `bun /home/joshua-fu/projects/skills/PAI/Tools/GenerateSkillIndex.ts` after changing the repo's skill layout.
- Run `devin skills paths` from the repo root to confirm project skill locations.
- Run `devin skills list` from the repo root to inspect discovered skills.
