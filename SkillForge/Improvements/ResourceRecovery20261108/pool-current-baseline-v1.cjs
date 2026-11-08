exports.createPool = limit => {
  let active = 0;
  const queue = [];

  function pump() {
    while (active < limit && queue.length) {
      const job = queue.shift();
      active++;
      job.started = true;
      const finish = (ok, value, drain = true) => {
        job.settle(ok, value);
        active--;
        if (drain) pump();
      };
      let result;
      try {
        // Reserve the slot before user code can submit or abort other jobs.
        result = job.task();
      } catch (error) {
        finish(false, error, false);
        continue;
      }
      Promise.resolve(result).then(
        value => finish(true, value),
        error => finish(false, error)
      );
    }
  }

  return {
    run(task, signal) {
      return new Promise((resolve, reject) => {
        let settled = false;
        const job = { task, started: false, settle };
        function settle(ok, value) {
          if (settled) return;
          settled = true;
          signal?.removeEventListener('abort', abort);
          if (ok) resolve(value);
          else reject(value);
        }
        function abort() {
          settle(false, signal.reason);
          if (!job.started) {
            const index = queue.indexOf(job);
            if (index !== -1) queue.splice(index, 1);
          }
          // Active cancellation settles the caller, not the underlying work.
        }
        if (signal?.aborted) {
          settle(false, signal.reason);
          return;
        }
        signal?.addEventListener('abort', abort, { once: true });
        queue.push(job);
        pump();
      });
    }
  };
};
