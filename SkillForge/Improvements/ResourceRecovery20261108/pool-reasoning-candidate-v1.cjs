exports.createPool = limit => {
  let active = 0;
  const queue = [];

  function settleCaller(job, ok, value) {
    if (job.settled) return;
    job.settled = true;
    job.signal?.removeEventListener('abort', job.abort);
    if (ok) job.resolve(value);
    else job.reject(value);
  }

  function finish(job, ok, value) {
    settleCaller(job, ok, value);
    active--;
    pump();
  }

  function pump() {
    while (active < limit && queue.length) {
      const job = queue.shift();
      // Reserve before invoking user code, including nested run/abort calls.
      job.started = true;
      active++;
      let result;
      try {
        result = job.task();
      } catch (error) {
        settleCaller(job, false, error);
        active--;
        continue;
      }
      // Adoption may itself invoke user code (for example a then getter).
      new Promise(resolve => resolve(result)).then(
        value => finish(job, true, value),
        error => finish(job, false, error)
      );
    }
  }

  return {
    run(task, signal) {
      return new Promise((resolve, reject) => {
        if (signal?.aborted) {
          reject(signal.reason);
          return;
        }
        const job = { task, signal, resolve, reject, started: false, settled: false };
        job.abort = () => {
          settleCaller(job, false, signal.reason);
          if (!job.started) {
            const index = queue.indexOf(job);
            if (index !== -1) queue.splice(index, 1);
          }
          // Running work retains its slot until its underlying result settles.
          pump();
        };
        signal?.addEventListener('abort', job.abort, { once: true });
        queue.push(job);
        pump();
      });
    }
  };
};

