exports.createPool = limit => {
  let active = 0;
  const queue = [];

  function pump() {
    while (active < limit && queue.length) {
      const job = queue.shift();
      if (job.done) continue;
      active++;
      // Reserve capacity before user code, including reentrant run/abort calls.
      let result;
      try {
        result = job.task();
      } catch (error) {
        job.settle(false, error);
        active--;
        continue;
      }
      const finish = (ok, value) => {
        job.settle(ok, value);
        active--;
        pump();
      };
      Promise.resolve(result).then(
        value => finish(true, value),
        error => finish(false, error)
      );
    }
  }

  return {
    run(task, signal) {
      return new Promise((resolve, reject) => {
        const job = { task, done: false };
        const abort = () => job.settle(false, signal.reason);
        job.settle = (ok, value) => {
          if (job.done) return;
          job.done = true;
          signal?.removeEventListener('abort', abort);
          (ok ? resolve : reject)(value);
        };
        if (signal?.aborted) {
          job.settle(false, signal.reason);
          return;
        }
        signal?.addEventListener('abort', abort, { once: true });
        queue.push(job);
        pump();
      });
    }
  };
};
