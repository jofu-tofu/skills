import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { PlaywrightBrowser } from '../index.ts'

// Requires existing Playwright/Chromium; BROWSER_EXECUTABLE may select a local browser.
test('actions identify one target and preserve the resulting state', { timeout: 15000 }, async () => {
  const server = createServer((_req, res) => {
    res.setHeader('Content-Type', 'text/html')
    res.end(`<input id="name" class="entry"><input class="entry"><button id="go" onclick="document.querySelector('#result').textContent=document.querySelector('#name').value">Submit</button><button class="same" onclick="document.querySelector('#result').textContent='wrong'">One</button><button class="same">Two</button><button id="disabled" disabled>Disabled</button><p id="result">empty</p><button id="hover" class="hover" onmouseenter="document.querySelector('#result').textContent='hovered'">Hover</button><button class="hover">Hover2</button><select id="select" class="select"><option>a</option><option>b</option></select><select class="select"><option>a</option><option>b</option></select><input id="file" class="file" type="file"><input class="file" type="file"><div id="source" class="source" draggable="true" style="width:100px;height:30px" ondragstart="document.querySelector('#result').textContent='dragged'">Source</div><div class="source" draggable="true">Source2</div><div id="target" class="target" style="width:100px;height:30px" ondragover="event.preventDefault()" ondrop="document.querySelector('#result').textContent='dropped'">Target</div><div class="target">Target2</div>`)
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const browser = new PlaywrightBrowser()
  try {
    await browser.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE })
    await browser.navigate(`http://127.0.0.1:${address.port}`)
    await assert.rejects(browser.click('.same', { timeout: 200 }), /strict mode violation/)
    await assert.rejects(browser.fill('.entry', 'wrong', { timeout: 200 }), /strict mode violation/)
    await assert.rejects(browser.hover('.hover'), /strict mode violation/)
    await assert.rejects(browser.select('.select', 'b'), /strict mode violation/)
    await assert.rejects(browser.uploadFile('.file', []), /strict mode violation/)
    await assert.rejects(browser.drag('.source', '#target'), /strict mode violation/)
    await assert.rejects(browser.drag('#source', '.target'), /strict mode violation/)
    assert.equal(await browser.evaluate("document.querySelector('#result').textContent"), 'empty')
    assert.equal(await browser.evaluate("document.querySelector('#name').value"), '')
    await assert.rejects(browser.click('#disabled', { timeout: 200 }), /Timeout/)
    await assert.rejects(browser.click('#missing', { timeout: 200 }), /Timeout/)
    await browser.hover('#hover')
    assert.equal(await browser.evaluate("document.querySelector('#result').textContent"), 'hovered')
    await browser.select('#select', 'b')
    assert.equal(await browser.evaluate("document.querySelector('#select').value"), 'b')
    await browser.uploadFile('#file', fileURLToPath(import.meta.url))
    assert.equal(await browser.evaluate("document.querySelector('#file').files.length"), 1)
    await browser.drag('#source', '#target')
    assert.equal(await browser.evaluate("document.querySelector('#result').textContent"), 'dropped')
    await browser.fill('#name', 'Ada')
    await browser.type('#name', ' Lovelace', 1)
    await browser.click('#go')
    assert.equal(await browser.evaluate("document.querySelector('#result').textContent"), 'Ada Lovelace')
  } finally {
    try { await browser.close() } finally {
      server.closeAllConnections()
      await new Promise<void>(resolve => server.close(() => resolve()))
    }
  }
})
