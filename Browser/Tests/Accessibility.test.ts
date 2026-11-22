import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

test('explicit snapshot reports a capture error and distinguishes an empty rendered tree', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'browser-snapshot-'))
  let snapshot = { success: false, error: 'snapshot timed out', data: { tree: '' } }
  const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(req.url === '/health'
      ? { success: true, data: { status: 'ok', sessionId: 'fixture' } }
      : req.url === '/click' ? { success: true, data: {} } : snapshot))
  })
  try {
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const address = server.address() as { port: number }
    await writeFile(join(directory, 'browser-session.json'), JSON.stringify({ port: address.port, sessionId: 'fixture' }))
    const run = (...args: string[]) => promisify(execFile)(process.execPath, [fileURLToPath(new URL('../Tools/Browse.ts', import.meta.url)), ...args], {
      env: { ...process.env, TEMP: directory, TMP: directory, TMPDIR: directory }, windowsHide: true, timeout: 5000
    })
    await assert.rejects(run('a11y'), /snapshot timed out/)
    const action = await run('click', '#save')
    assert.match(action.stdout, /Clicked: #save/)
    assert.match(action.stderr, /snapshot timed out/)
    snapshot = { success: true, error: '', data: { tree: '' } }
    assert.match((await run('a11y')).stdout, /empty/i)
    snapshot.data.tree = '- heading "Current result"'
    assert.match((await run('a11y')).stdout, /Current result/)
  } finally {
    server.closeAllConnections()
    await new Promise<void>(resolve => server.close(() => resolve()))
    await rm(directory, { recursive: true, force: true })
  }
})
