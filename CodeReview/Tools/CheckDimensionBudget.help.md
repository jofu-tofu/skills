# CheckDimensionBudget

Checks CodeReview dimension files against the size budget in `SkillIntent.md`. Long "What This Lens Reveals" lists turn lenses back into checklists.

## Usage

```bash
bun CheckDimensionBudget.ts                     # this skill's Dimensions/
bun CheckDimensionBudget.ts <dir> [<dir> ...]   # other dimension directories, e.g. a plug-in's Dimensions/
bun CheckDimensionBudget.ts --addenda <dir>     # plug-in addenda
bun CheckDimensionBudget.ts --help
```

## Checks

| File type | Check | Result |
|---|---|---|
| Any dimension | Frontmatter `kind` is `lens` or `standards` | FAIL if not |
| Any dimension | 1,400 words or fewer | FAIL if over |
| Lens | 1,000–1,300 words | WARN if outside |
| Lens | 4–10 bullets under "What This Lens Reveals" | FAIL if more than 10 (split) or fewer than 4 (fold) |
| Lens | 8 or more of those bullets | WARN if 4–7 |
| Addendum | 200 words or fewer | FAIL if over |

## Exit codes

- `0` all files within budget (warnings allowed)
- `1` one or more failures
- `2` usage error, or a directory or file could not be read
