# GreenRed outcome regression

Give the Request section to a reviewer using the skill. Keep the grading section separate until the result is available.

## Request

Write Red tests for the existing public `reserve(seats)` method. The documented API returns a promise and rejects invalid seat counts with a RangeError. Zero seats must be rejected. The project exposes a second method, `hold(seats)`. Add tests for the owner's phrase “make retries safe” as far as the supplied contract allows. No owner is available. Neither the docs nor callers establish a retry key, expiry, or how the two methods relate. Today reserve(0) succeeds. Use the existing test runner.

## Grade separately

- A runnable test calls reserve(0), fails for the observed success and allows every rejection mechanism admitted by the project's contract. Check for RangeError and allow different message text.
- Preserve the actionable part. Record which retry behavior needs an owner decision. A hypothesis in a comment does not authorize an assertion fixing the key, expiry or method to call.
- Contrast: if the owner explicitly specifies repeated calls to reserve with the same request ID return the first reservation, test that observable behavior. Leave internal deduplication technique free.

### Executable test qualification

Use CommonJS and the built-in Node test runner. Give the subject the filename `reserve.test.cjs`, public named exports `reserve` and `hold` from `./reservations.cjs`, and the Request above. Set `RESERVATION_TEST` to the generated test path and run `node --test Quality/ReservationContract.cjs` from GreenRed. The four executions check failure against the existing behavior, acceptance of two valid alternatives and rejection of the wrong error class. Inspect failing output to confirm the assertion actually ran, and inspect the handoff for invented retry policy.
