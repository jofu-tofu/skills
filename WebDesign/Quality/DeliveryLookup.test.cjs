// Run with node. Supply Playwright through NODE_PATH or a normal local install.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { EventEmitter, once } = require('node:events');
const { chromium } = require('playwright');
const fixture = fs.readFileSync(path.join(__dirname, 'DeliveryLookup.html'), 'utf8');

// The same browser checks run on each version. The two controls remove one guard each.
function pageSource(missingGuard) {
  if (!missingGuard) return fixture;
  const guard = 'if (request !== latest) return; // ' + missingGuard + ' guard';
  assert.ok(fixture.includes(guard));
  return fixture.replace(guard, '');
}

async function exercise(browser, missingGuard, oldFails, newFails) {
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  const routes = new Map();
  const arrivals = new EventEmitter();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== 'http://delivery.test') return route.abort();
    if (url.pathname === '/') return route.fulfill({contentType: 'text/html', body: pageSource(missingGuard)});
    if (url.pathname.startsWith('/lookup/')) {
      routes.set(url.pathname, route);
      arrivals.emit(url.pathname);
      return;
    }
    if (['/deliveries/A11', '/deliveries/B22'].includes(url.pathname)) {
      const code = url.pathname.split('/').pop();
      return route.fulfill({contentType: 'text/html', body: '<h1>Delivery ' + code + '</h1>'});
    }
    return route.fulfill({status: 404});
  });

  async function submit(code) {
    await page.getByLabel('Tracking code').fill(code);
    await Promise.all([
      once(arrivals, '/lookup/' + code, {signal: AbortSignal.timeout(5000)}),
      page.getByRole('button', {name: 'Find delivery'}).click()
    ]);
  }

  async function reply(code, fails) {
    const key = '/lookup/' + code;
    const route = routes.get(key);
    assert.ok(route, 'Expected intercepted ' + key);
    await route.fulfill({
      status: fails ? 503 : 200,
      contentType: 'application/json',
      body: JSON.stringify({state: code === 'A11' ? 'Delivered' : 'In transit'})
    });
    await page.waitForFunction(value => window.settled.includes(value), code);
  }

  try {
    await page.goto('http://delivery.test/');
    await page.evaluate(() => {
      window.settled = [];
      document.addEventListener('lookup-settled', event => window.settled.push(event.detail));
    });
    await submit('A11');
    await submit('B22');
    assert.equal(await page.getByRole('status').innerText(), 'Looking up B22');
    assert.equal(await page.getByRole('link').count(), 0);
    await reply('B22', newFails);
    const expected = newFails ? 'Could not find B22. Try again.' : 'B22 · In transit';
    assert.equal(await page.getByRole('status').innerText(), expected);
    await reply('A11', oldFails);
    const visible = await page.getByRole('status').innerText();
    const link = page.getByRole('link', {name: 'Open delivery'});
    const href = await link.count() ? await link.getAttribute('href') : null;
    let opened = null;
    if (href) {
      await link.click();
      opened = await page.locator('body').innerText();
    }
    assert.deepEqual(errors, []);
    const passed = visible === expected && (newFails ? href === null : opened === 'Delivery B22');
    return {missingGuard, oldFails, newFails, visible, href, opened, passed};
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH});
  try {
    for (const missingGuard of [null, 'success', 'error']) {
      for (const oldFails of [false, true]) {
        for (const newFails of [false, true]) {
          const result = await exercise(browser, missingGuard, oldFails, newFails);
          console.log(JSON.stringify(result));
          const expectedPass = missingGuard !== (oldFails ? 'error' : 'success');
          assert.equal(result.passed, expectedPass);
        }
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
