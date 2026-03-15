/**
 * Pre-render Mermaid code blocks in a Markdown file to PNG images.
 *
 * Usage:
 *   node RenderMermaid.mjs <input.md> <output.md> <image-output-dir>
 *
 * Replaces ```mermaid ... ``` blocks with ![Diagram N](mermaidN.png)
 * and writes the rendered PNGs to <image-output-dir>.
 *
 * Requirements: playwright (npm install -g playwright)
 * A Chromium browser must be available via Playwright.
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';

const [inputMd, outputMd, imageDir] = process.argv.slice(2);

if (!inputMd || !outputMd || !imageDir) {
  console.error('Usage: node RenderMermaid.mjs <input.md> <output.md> <image-output-dir>');
  process.exit(2);
}

mkdirSync(imageDir, { recursive: true });

let content = readFileSync(inputMd, 'utf-8');
const mermaidPattern = /```mermaid\n([\s\S]*?)```/g;

const blocks = [];
let match;
while ((match = mermaidPattern.exec(content)) !== null) {
  blocks.push(match[1]);
}

if (blocks.length === 0) {
  writeFileSync(outputMd, content, 'utf-8');
  console.log('No mermaid blocks found. Output copied unchanged.');
  process.exit(0);
}

console.log(`Found ${blocks.length} mermaid block(s). Rendering...`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

let counter = 0;
for (const code of blocks) {
  counter++;
  const filename = `mermaid${counter}.png`;
  const outPath = resolve(join(imageDir, filename));

  const html = `<!DOCTYPE html>
<html><head>
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
</head><body>
<pre class="mermaid">${code}</pre>
<script>mermaid.initialize({startOnLoad:true, theme:'default'});</script>
</body></html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const el = await page.locator('.mermaid svg').first();
  await el.screenshot({ path: outPath });
  console.log(`  Rendered ${filename}`);
}

await browser.close();

// Replace mermaid blocks with image references
counter = 0;
content = content.replace(mermaidPattern, () => {
  counter++;
  return `![Diagram ${counter}](mermaid${counter}.png)`;
});

writeFileSync(outputMd, content, 'utf-8');
console.log(`Wrote ${outputMd} with ${counter} image reference(s).`);
