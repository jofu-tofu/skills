exports.createPool = limit => {
  let active = 0;
  const queue = [];

  function settleCaller(job, ok, value) {
    if (job.settled) return;
    job.settled = true;
    job.signal?.removeEventListener('abort', job.abort);
    (ok ? job.resolve : job.reject)(value);
  }

  function finish(job, ok, value) {
    settleCaller(job, ok, value);
    active--;
    pump();
  }

  function pump() {
    while (active < limit && queue.length) {
      const job = queue.shift();
      // Reserve before task invocation or result adoption can reenter run().
      active++;
      job.started = true;
      try {
        const result = job.task();
        Promise.resolve(result).then(
          value => finish(job, true, value),
          error => finish(job, false, error)
        );
      } catch (error) {
        // Invocation and adoption can both throw. Continue draining without
        // recursively pumping a queue of synchronously throwing tasks.
        settleCaller(job, false, error);
        active--;
      }
    }
  }

  return {
    run(task, signal) {
      return new Promise((resolve, reject) => {
        const job = { task, signal, resolve, reject, started: false, settled: false };
        job.abort = () => {
          settleCaller(job, false, signal.reason);
          if (!job.started) {
            const index = queue.indexOf(job);
            if (index !== -1) queue.splice(index, 1);
          }
          // Active cancellation settles the caller, never the underlying work.
          pump();
        };
        if (signal?.aborted) {
          reject(signal.reason);
          return;
        }
        signal?.addEventListener('abort', job.abort, { once: true });
        queue.push(job);
        pump();
      });
    }
  };
};
