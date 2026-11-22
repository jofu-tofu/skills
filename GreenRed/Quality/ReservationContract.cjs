/** Run candidate tests against interchangeable public implementations. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, copyFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

const childEnv = { ...process.env };
delete childEnv.NODE_TEST_CONTEXT;
const input = process.env.RESERVATION_TEST;
assert.ok(input, 'Set RESERVATION_TEST to the submitted .cjs test file');
const variants = [
  ['existing implementation', 'return seats;', false],
  ['valid immediate rejection', 'if (seats === 0) throw new RangeError("empty"); return seats;', true],
  ['valid deferred rejection', 'await Promise.resolve(); if (!seats) throw new RangeError("zero seats"); return seats;', true],
  ['wrong error class', 'if (!seats) throw new TypeError("empty"); return seats;', false],
];

for (const [name, body, shouldPass] of variants) {
  test(name, () => {
    const cwd = mkdtempSync(join(tmpdir(), 'greenred-reserve-'));
    copyFileSync(input, join(cwd, 'reserve.test.cjs'));
    writeFileSync(join(cwd, 'reservations.cjs'),
      'exports.reserve = async function(seats) {' + body + '}; exports.hold = async seats => seats;');
    const run = spawnSync(process.execPath, ['--test', 'reserve.test.cjs'], {
      cwd, env: childEnv, encoding: 'utf8', timeout: 5000,
    });
    assert.ifError(run.error);
    assert.ok([0, 1].includes(run.status), run.stderr);
    assert.equal(run.status === 0, shouldPass, run.stdout + run.stderr);
  });
}
