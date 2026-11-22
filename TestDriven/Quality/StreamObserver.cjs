/** Invoke with node --test, setting STREAM_OBSERVER to the generated .cjs module.
 * The module exports observe(emitter, start), returning the emitted chunks.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { resolve } = require('node:path');
const submitted = require(resolve(process.env.STREAM_OBSERVER));
const observe = typeof submitted === 'function' ? submitted : submitted.observe;
assert.equal(typeof observe, 'function', 'Supply the observer function directly or as a named observe export');

for (const delivery of ['immediate', 'microtask']) {
  for (const chunks of [[7], [9], []]) {
    test(delivery + ' ' + JSON.stringify(chunks), { timeout: 1000 }, async () => {
      const emitter = new EventEmitter();
      const observer = () => {};
      emitter.on('data', observer);
      const actual = await observe(emitter, () => {
        const emit = () => {
          for (const chunk of chunks) emitter.emit('data', chunk);
          emitter.emit('end');
        };
        if (delivery === 'immediate') emit();
        else queueMicrotask(emit);
      });
      assert.deepEqual(actual, chunks);
      assert.deepEqual(emitter.listeners('data'), [observer]);
      assert.equal(emitter.listenerCount('end'), 0);
      assert.equal(emitter.listenerCount('error'), 0);
    });
  }
}

test('synchronous failure preserves the error and releases owned listeners', async () => {
  const emitter = new EventEmitter();
  const failure = new Error('source unavailable');
  await assert.rejects(async () => observe(emitter, () => { throw failure; }), e => e === failure);
  assert.deepEqual(emitter.eventNames(), []);
});
