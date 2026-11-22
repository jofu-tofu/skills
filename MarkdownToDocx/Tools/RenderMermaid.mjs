import { readFileSync, writeFileSync, mkdirSync, existsSync, openSync, closeSync, rmSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'

// Top-level Markdown fences. Keep examples inside longer or different fences literal.
export async function replaceDiagrams(content, render) {
  const lines = content.match(/[^\n]*(?:\n|$)/g) ?? []
  let output = ''
  let count = 0
  for (let i = 0; i < lines.length; i++) {
    const start = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)\r?\n?$/.exec(lines[i])
    if (!start || (start[1][0] === '`' && start[2].includes('`'))) {
      output += lines[i]
      continue
    }
    const endPattern = new RegExp('^ {0,3}' + start[1][0] + '{' + start[1].length + ',}[ \\t]*\\r?\\n?$')
    let end = i + 1
    while (end < lines.length && !endPattern.test(lines[end])) end++
    if (end === lines.length || start[2].trim().split(/\s+/)[0] !== 'mermaid') {
      output += lines.slice(i, end + 1).join('')
    } else {
      count++
      const filename = await render(lines.slice(i + 1, end).join(''), count)
      output += '![Diagram ' + count + '](' + filename + ')' + (lines[end].match(/\r?\n$/)?.[0] ?? '')
    }
    i = end
  }
  return output
}

async function main() {
  const [inputMd, outputMd, imageDir] = process.argv.slice(2)
  if (!inputMd || !outputMd || !imageDir) throw new Error('Usage: node RenderMermaid.mjs <input.md> <output.md> <image-output-dir>')
  if (resolve(inputMd) === resolve(outputMd) || existsSync(outputMd)) throw new Error('Use a new temporary Markdown output path')
  const content = readFileSync(inputMd, 'utf8')
  const created = []
  function writeNew(path, data) {
    const fd = openSync(path, 'wx')
    created.push(path)
    try {
      writeFileSync(fd, data)
    } finally {
      closeSync(fd)
    }
  }
  let browser
  try {
    const transformed = await replaceDiagrams(content, async (code, index) => {
      const filename = 'mermaid' + index + '.png'
      mkdirSync(imageDir, { recursive: true })
      const target = join(imageDir, filename)
      if (existsSync(target)) throw new Error('Diagram destination already exists: ' + target)
      if (!browser) {
        const { chromium } = await import('playwright')
        browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE })
      }
      const page = await browser.newPage()
      try {
        await page.setContent('<div id="diagram"></div>')
        await page.addScriptTag(process.env.MERMAID_SCRIPT ? { path: process.env.MERMAID_SCRIPT } : { url: 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js' })
        await page.evaluate(async source => {
          window.mermaid.initialize({ startOnLoad: false, theme: 'default' })
          const { svg } = await window.mermaid.render('diagram-svg', source)
          document.getElementById('diagram').innerHTML = svg
        }, code)
        const png = await page.locator('#diagram > svg').screenshot()
        writeNew(target, png)
      } finally {
        await page.close()
      }
      return '<' + resolve(target).replaceAll('\\', '/').replaceAll('>', '%3E') + '>'
    })
    await browser?.close()
    browser = undefined
    writeNew(outputMd, transformed)
  } catch (error) {
    for (const path of created) rmSync(path, { force: true })
    throw error
  } finally {
    await browser?.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}
