# Obsidian Syntax Reference

Reference documentation for Obsidian-specific markdown syntax.

---

## Wiki Links
```markdown
[[Note Name]]                    # Link to note
[[Note Name|Display Text]]       # Link with alias
[[Note Name#Heading]]            # Link to heading
[[Note Name#^block-id]]          # Link to block
```

## Tags
```markdown
#topic                           # Inline tag
#topic/subtopic                  # Nested tag
tags: [topic1, topic2]           # Frontmatter tags
```

## Embeds (Transclusion)
```markdown
![[Note Name]]                   # Embed entire note
![[Note Name#Heading]]           # Embed specific section
![[Note Name#^block-id]]         # Embed specific block
![[image.png]]                   # Embed image
![[image.png|300]]               # Embed with width
![[image.png|300x200]]           # Embed with dimensions
![[file.pdf]]                    # Embed PDF (first page)
![[file.pdf#page=5]]             # Embed specific PDF page
```

## Block References
```markdown
This is a paragraph. ^my-block   # Create block ID (at end of line)
[[Note#^my-block]]               # Link to block
![[Note#^my-block]]              # Embed block
```

## Text Formatting
```markdown
**bold**                         # Bold text
*italic* or _italic_             # Italic text
~~strikethrough~~                # Strikethrough
==highlighted text==             # Highlight (yellow background)
`inline code`                    # Inline code
> blockquote                     # Blockquote
```

## Comments
```markdown
%%This is a comment%%            # Obsidian comment (hidden in preview)
<!-- HTML comment -->            # HTML comment (also hidden)
```

## HTML Support
Obsidian supports sanitized HTML:
```markdown
<sub>subscript</sub>             # Subscript text
<sup>superscript</sup>           # Superscript text
<mark>marked text</mark>         # Highlighted text
<u>underlined</u>                # Underlined text
<br>                             # Line break
```

## Math/LaTeX (KaTeX)
```markdown
Inline: $E = mc^2$

Display block:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

Common symbols:
$\alpha, \beta, \gamma$          # Greek letters
$\sum_{i=1}^{n} x_i$             # Summation
$\frac{a}{b}$                    # Fraction
$\sqrt{x}$                       # Square root
$x^2, x_n$                       # Superscript/subscript
$\pm, \times, \div, \neq$        # Operators
```

## Callouts
```markdown
> [!note] Title
> Content here

> [!tip] Pro Tip
> Helpful advice

> [!warning] Watch Out
> Important warning

> [!question] Open Question
> Something to explore

> [!info]- Collapsed by default
> Hidden content (note the minus sign)

> [!success]+ Expanded by default
> Visible content (note the plus sign)
```

**Available callout types**:
- **Information**: note, abstract, summary, info, tip, hint, important
- **Success**: success, check, done
- **Questions**: question, help, faq
- **Warnings**: warning, caution, attention
- **Errors**: failure, fail, missing, danger, error, bug
- **Other**: example, quote, cite

## Task Lists
```markdown
- [ ] Unchecked task
- [x] Completed task
- [/] In progress (Tasks plugin)
- [-] Cancelled (Tasks plugin)
```

## Footnotes
```markdown
Here's a statement[^1].
Another claim[^note].

[^1]: This is the footnote content.
[^note]: Footnotes can have any identifier.
```
