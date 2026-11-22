import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const renderer = fileURLToPath(new URL('../Tools/RenderMermaid.mjs', import.meta.url))

test('literal diagram examples survive byte for byte without a browser dependency', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'markdown-example-'))
  try {
    const source = ['Example', '````markdown', '```mermaid', 'graph TD', 'A-->B', '```', '````', ''].join('\r\n')
    const input = join(directory, 'in.md')
    const output = join(directory, 'out.md')
    await writeFile(input, source)
    execFileSync(process.execPath, [renderer, input, output, directory], { windowsHide: true })
    assert.equal(await readFile(output, 'utf8'), source)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

import { replaceDiagrams } from '../Tools/RenderMermaid.mjs'

test('CRLF and tilde fences render in order while literal examples and neighboring text survive', async () => {
  const source = ['# Title', '````md', '```mermaid', 'literal', '```', '````', '~~~mermaid', 'graph TD', 'A-->B', '~~~', '```mermaid', 'sequenceDiagram', '```', 'end'].join('\r\n')
  const captured = []
  const result = await replaceDiagrams(source, async (code, index) => {
    captured.push(code)
    return 'diagram-' + index + '.png'
  })
  assert.deepEqual(captured, ['graph TD\r\nA-->B\r\n', 'sequenceDiagram\r\n'])
  assert.equal(result, ['# Title', '````md', '```mermaid', 'literal', '```', '````', '![Diagram 1](diagram-1.png)', '![Diagram 2](diagram-2.png)', 'end'].join('\r\n'))
})

test('refuses to overwrite a source asset before attempting a render', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'markdown-collision-'))
  try {
    const image = join(directory, 'mermaid1.png')
    const input = join(directory, 'in.md')
    const output = join(directory, 'out.md')
    await writeFile(image, 'existing source image')
    await writeFile(input, '```mermaid\ngraph TD\nA-->B\n```')
    assert.throws(() => execFileSync(process.execPath, [renderer, input, output, directory], { stdio: 'pipe', windowsHide: true }), /destination already exists/)
    assert.equal(await readFile(image, 'utf8'), 'existing source image')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('real renderer embeds a PNG for a CRLF diagram in a spaced staging path', { skip: !process.env.MERMAID_SCRIPT }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rendered diagram '))
  try {
    const input = join(dir, 'in.md')
    const out = join(dir, 'out.md')
    await writeFile(input, ['Before','~~~mermaid','graph TD','A-->B','~~~','After'].join('\r\n'))
    execFileSync(process.execPath, [renderer, input, out, dir], { windowsHide: true, timeout: 30000 })
    const png = await readFile(join(dir, 'mermaid1.png'))
    assert.deepEqual([...png.subarray(0, 8)], [137,80,78,71,13,10,26,10])
    assert.equal(await readFile(out, 'utf8'), 'Before\r\n![Diagram 1](<' + join(dir, 'mermaid1.png').replaceAll('\\','/') + '>)\r\nAfter')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('a later collision preserves the existing image and allows a retry', { skip: !process.env.MERMAID_SCRIPT }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'diagram-retry-'))
  try {
    const input = join(dir, 'source.md')
    const output = join(dir, 'prepared.md')
    const first = join(dir, 'mermaid1.png')
    const second = join(dir, 'mermaid2.png')
    const diagram = ['~~~mermaid', 'graph TD', 'A-->B', '~~~'].join('\n')
    const source = [diagram, diagram].join('\n\n')
    const run = () => execFileSync(process.execPath, [renderer, input, output, dir], { windowsHide: true, timeout: 30000, stdio: 'pipe' })
    await writeFile(input, source)
    await writeFile(second, 'pre-existing image')
    assert.throws(run, /destination already exists/)
    assert.equal(await readFile(second, 'utf8'), 'pre-existing image')
    assert.equal(await readFile(input, 'utf8'), source)
    await assert.rejects(readFile(first), { code: 'ENOENT' })
    await assert.rejects(readFile(output), { code: 'ENOENT' })
    await rm(second)
    run()
    assert.match(await readFile(output, 'utf8'), /!\[Diagram 2\]/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
