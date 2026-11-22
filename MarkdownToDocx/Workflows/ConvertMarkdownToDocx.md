# Convert Markdown to DOCX

1. Map every requested source to its destination. Default to the source directory and base name. Check for colliding destinations before starting. Keep unrelated files and the original Markdown intact.
2. Check for Pandoc and Python with `python-docx`. Resolve the two helpers under this skill's own `Tools` directory. Use the available Python interpreter.
3. For each source, make a fresh temporary directory. For top-level Mermaid fenced diagrams, run the helper below. A file containing only literal diagram examples can pass through the helper without Playwright. Real diagrams need a locally resolvable Playwright and Chromium. The helper loads Mermaid from its CDN by default. Set `MERMAID_SCRIPT` to an available local browser bundle for offline use and `BROWSER_EXECUTABLE` to select an existing Chromium. Inspect any nested list or blockquote diagrams separately and disclose unsupported rendering.

   ```text
   node "<skill-dir>/Tools/RenderMermaid.mjs" "<source.md>" "<temp>/rendered.md" "<temp>"
   ```

4. Convert the original or prepared Markdown into a new staged DOCX. Run Pandoc from the original source directory or pass that absolute directory as the resource path so relative images still resolve. Prepared Markdown references its generated diagrams by absolute path.

   ```text
   pandoc "<input.md>" -f gfm -t docx --resource-path="<source-directory>" -o "<temp>/output.docx"
   python "<skill-dir>/Tools/PostProcessDocx.py" "<temp>/output.docx"
   ```

5. Inspect converter warnings, including missing resources even on exit zero. Reopen the staged DOCX, compare its headings, text, links, table associations and media against the source, and inspect rendered pages when claiming layout or diagram legibility. Report any unchecked feature. A stale destination or nonzero file size cannot establish a successful conversion.
6. Deliver each verified file to its mapped destination. Unless the request specifies otherwise, open the delivered output using the helper below. Keep the conversion result and app launch result separate.

   ```text
   python "<skill-dir>/Tools/PostProcessDocx.py" --open-only "<delivered.docx>"
   ```

7. Clean up only the temporary files made by this run. Report each source and destination, conversion and opening results, missing or unsupported content, and any stage that failed. Continue with other independent batch members.
