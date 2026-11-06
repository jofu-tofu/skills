import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { PlaywrightBrowser } from '../index.ts'

// Run with Node after installing Playwright and its browser:
// node --test Tests/Diagnostics.test.ts
// BROWSER_EXECUTABLE optionally selects an existing Chromium executable.
test('diagnostics retain uncaught errors and transport failures, and support explicit clearing', { timeout: 15000 }, async () => {
  const server = createServer((req, res) => {
    if (req.url === '/pending') return
    if (req.url === '/stream') { res.writeHead(503); res.write('partial'); return }
    if (req.url === '/broken') { req.socket.destroy(); return }
    if (req.url === '/unavailable') { res.writeHead(503); res.end('unavailable'); return }
    res.setHeader('Content-Type', 'text/html')
    res.end(req.url === '/pending-page'
      ? `<script>fetch('/pending').catch(() => {}); fetch('/stream').then(r => r.text()).catch(() => {});</script>`
      : req.url === '/fault'
      ? `<h1>Fault fixture</h1><script>
          console.error('explicit fixture error');
          fetch('/broken').catch(() => {});
          fetch('/unavailable').catch(() => {});
          setTimeout(() => { throw new Error('uncaught fixture error') }, 0);
        </script>`
      : '<h1>Clean fixture</h1>')
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const origin = `http://127.0.0.1:${address.port}`
  const browser = new PlaywrightBrowser()
  try {
    await browser.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE })
    await browser.navigate(`${origin}/fault`)
    const deadline = Date.now() + 5000
    while (Date.now() < deadline) {
      if (browser.getNetworkLogs({ type: 'failure' }).length &&
          browser.getNetworkLogs({ status: 503 }).length &&
          browser.getConsoleLogs().some(log => log.text === 'uncaught fixture error')) break
      await new Promise(resolve => setTimeout(resolve, 25))
    }
    const errors = browser.getConsoleLogs({ type: 'error' })
    assert.ok(errors.some(log => log.text === 'explicit fixture error'))
    assert.ok(errors.some(log => log.text === 'uncaught fixture error'))
    assert.ok(browser.getNetworkLogs({ status: 503 }).some(log => log.url.endsWith('/unavailable')))
    const failure = browser.getNetworkLogs({ type: 'failure' }).find(log => log.url.endsWith('/broken'))
    assert.ok(failure?.errorText)
    assert.equal(failure.status, undefined, 'a transport failure must not invent an HTTP status')
    assert.ok(browser.getNetworkLogs({ status: 200 }).length, 'successful traffic remains available')
    browser.clearNetworkLogs()
    browser.getConsoleLogs({ clear: true })
    await browser.navigate(`${origin}/clean`)
    assert.equal(browser.getNetworkLogs({ type: 'failure' }).length, 0)
    assert.equal(browser.getConsoleLogs({ type: 'error' }).length, 0)

    // Match BrowserSession's navigation handoff: clear first, then navigate.
    // Old in-flight requests can fail or finish their body after that clear.
    await browser.navigate(`${origin}/pending-page`)
    const pendingDeadline = Date.now() + 5000
    while (Date.now() < pendingDeadline &&
      !browser.getNetworkLogs().some(log => log.url.endsWith('/stream'))) {
      await new Promise(resolve => setTimeout(resolve, 25))
    }
    assert.ok(browser.getNetworkLogs().some(log => log.url.endsWith('/pending')))
    assert.ok(browser.getNetworkLogs().some(log => log.url.endsWith('/stream')))
    browser.getConsoleLogs({ clear: true })
    browser.clearNetworkLogs()
    await browser.navigate(`${origin}/clean`, { waitUntil: 'networkidle' })
    assert.equal(browser.getNetworkLogs({ type: 'failure' }).length, 0)
    assert.ok(!browser.getNetworkLogs().some(log => log.url.endsWith('/stream')))
    await browser.evaluate("fetch('/broken').catch(() => {})")
    const failureDeadline = Date.now() + 5000
    while (Date.now() < failureDeadline && !browser.getNetworkLogs({ type: 'failure' }).length) {
      await new Promise(resolve => setTimeout(resolve, 25))
    }
    assert.ok(browser.getNetworkLogs({ type: 'failure' }).some(log => log.url.endsWith('/broken')))
  } finally {
    try { await browser.close() } finally {
      server.closeAllConnections()
      await new Promise<void>(resolve => server.close(() => resolve()))
    }
  }
})
