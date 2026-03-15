# ConvertMarkdownToDocx Workflow

> **Trigger:** "convert markdown to docx", "md to docx", "markdown to word", "make docx from markdown"

## Reference Material

- None.

## Purpose

Convert one or more Markdown files to `.docx` with clear preflight checks, Mermaid diagram rendering, stronger table visibility, automatic output opening, and verifiable output.

## Workflow Steps

### Step 1: Confirm Inputs and Outputs

Identify:
1. Source markdown file(s) or directory.
2. Requested destination `.docx` path(s).
3. Whether this is single-file or batch conversion.

If output path is not provided, default to the same directory and same base filename.

### Step 2: Run Preflight Checks

Check converter availability:
```bash
pandoc --version
```

Check post-processing dependency:
```bash
python -c "import docx; print('python-docx OK')"
```

If unavailable, stop and provide install guidance (`python -m pip install python-docx`), then wait for user direction.

### Step 3: Render Mermaid Diagrams (if present)

Check whether the source markdown contains `` ```mermaid `` code blocks. If none are found, skip to Step 4 using the original markdown as input.

If mermaid blocks exist, check Playwright availability:
```bash
node -e "require('playwright')"
```

If unavailable, install: `npm install -g playwright`.

Run the bundled renderer to pre-render diagrams to PNG and produce a modified markdown with image references:

```bash
node "$PAI_DIR/skills/MarkdownToDocx/Tools/RenderMermaid.mjs" "<input.md>" "<temp.md>" "<output-dir>"
```

Arguments:
- `<input.md>` — original source markdown
- `<temp.md>` — temporary markdown with mermaid blocks replaced by image references (use a temp directory)
- `<output-dir>` — directory where rendered PNG files are written (use the same directory as the final `.docx` output so pandoc can find them via `--resource-path`)

Use `<temp.md>` as the pandoc input in Step 4 instead of the original. After successful conversion, delete `<temp.md>` and the generated PNG files.

### Step 4: Convert Markdown to DOCX

Use the original markdown (or the temp markdown from Step 3 if mermaid blocks were rendered).

Single file pattern:
```bash
pandoc "<input.md>" -f gfm -t docx --resource-path="<image-dir>" -o "<output.docx>"
```

Batch pattern:
1. Enumerate `*.md` inputs.
2. Build matching `.docx` output paths.
3. Run one `pandoc` command per input and collect results.

When mermaid images were rendered, pass `--resource-path="<image-dir>"` so pandoc can resolve the image references.

### Step 5: Harden Table Visibility

Run the bundled post-processor on generated files:

Single file:
```bash
python "$PAI_DIR/skills/MarkdownToDocx/Tools/PostProcessDocx.py" "<output.docx>"
```

Batch:
```bash
python "$PAI_DIR/skills/MarkdownToDocx/Tools/PostProcessDocx.py" "<output1.docx>" "<output2.docx>" ...
```

This step applies:
1. `Table Grid` styling when available.
2. Explicit cell borders for all table cells.

### Step 6: Verify Output

For each expected output file:
1. Confirm file exists.
2. Confirm file size is greater than zero.

Report any failed file with the exact command and error text.

### Step 7: Open Output Automatically

After successful verification, open generated `.docx` files with the system default app:

Single file:
```bash
python "$PAI_DIR/skills/MarkdownToDocx/Tools/PostProcessDocx.py" --open-only "<output.docx>"
```

Batch:
```bash
python "$PAI_DIR/skills/MarkdownToDocx/Tools/PostProcessDocx.py" --open-only "<output1.docx>" "<output2.docx>" ...
```

### Step 8: Cleanup and Return Summary

1. Delete temporary markdown and rendered PNG files from Step 3 (if any).
2. Provide:
   - Input and output path mapping.
   - Success/failure per file.
   - Whether mermaid rendering, table visibility hardening, and auto-open completed.
   - Next-step options when failures occur (retry, install/repair pandoc, install `python-docx`, install `playwright`, or adjust source markdown).
