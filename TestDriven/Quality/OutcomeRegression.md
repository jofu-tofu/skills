# TestDriven outcome regression

Give the Request section to a reviewer using the skill. Keep the grading section separate until the result is available.

## Request

Write a test for a public `start(emitter)` API. The runner owns a fresh emitter, with an existing observer. A valid producer emits data 7 and then end before start returns. Another valid implementation emits the same events on a microtask. Start may throw before the first emission. Verify the stream result and preserve the observer.

## Grade separately

Run the generated test with both producers. Both must finish successfully. Replace 7 with 9; the content assertion must fail. Replace success with a thrown error and check it reaches the runner with test-added handlers and timers released. Also run a producer that ends without data. Merely counting one event misses the wrong-value producer. Installing handlers after start loses both synchronous events.

### Executable observer check

For the observer portion, ask the subject to export `observe(emitter, start)` from a CommonJS module. It should return a promise resolving to the chunks received before end, or rejecting with the original start error. Set `STREAM_OBSERVER` to that module's path and run `node --test Quality/StreamObserver.cjs` from TestDriven. The seven checks exercise both delivery modes, empty and differing payloads, and synchronous failure. Assess the generated test's payload assertion and timer cleanup separately.
