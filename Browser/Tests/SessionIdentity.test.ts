import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { execFile } from 'node:child_process'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

test('stop controls the recorded session and rejects foreign or malformed health responses', async () => {
  for (const mode of ['owned', 'foreign', 'invalid', 'stop-error', 'still-running']) {
    let stops = 0
    const dir = await mkdtemp(join(tmpdir(), 'browser-identity-'))
    const server = createServer((req, res) => {
      res.setHeader('content-type', 'application/json')
      if (req.url === '/stop') {
        stops++
        if (mode === 'stop-error') res.statusCode = 503
        res.end(JSON.stringify({ success: true, data: { stopped: true } }))
        if (mode === 'owned') setImmediate(() => { server.closeAllConnections(); server.close() })
      } else {
        res.end(mode === 'invalid' ? 'not-json' : JSON.stringify({ success: true, data: {
          status: 'ok', sessionId: mode === 'foreign' ? 'foreign-id' : 'owned-id'
        } }))
      }
    })
    try {
      await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
      const address = server.address() as { port: number }
      await writeFile(join(dir, 'browser-session.json'), JSON.stringify({
        pid: 999999, port: address.port, sessionId: 'owned-id', startedAt: new Date().toISOString(), headless: true, url: 'about:blank'
      }))
      const result = await new Promise<{ error: Error | null; stdout: string; stderr: string }>(resolve => {
        execFile(process.execPath, [fileURLToPath(new URL('../Tools/Browse.ts', import.meta.url)), 'stop'], {
          env: { ...process.env, TEMP: dir, TMP: dir, TMPDIR: dir }, timeout: 8000, windowsHide: true
        }, (error, stdout, stderr) => resolve({ error, stdout, stderr }))
      })
      assert.equal(result.error === null, mode === 'owned', result.stdout + result.stderr)
      assert.equal(stops, mode === 'owned' || mode === 'stop-error' || mode === 'still-running' ? 1 : 0, mode)
      if (mode === 'stop-error') assert.ok(!result.stdout.includes('Session stopped'), 'HTTP failure must not claim stop success')
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()))
      await rm(dir, { recursive: true, force: true })
    }
  }
})
