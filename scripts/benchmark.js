function runCode(code, timesCount = 10) {
  const times = Array.from({ length: timesCount }).map(() => {
    const start = performance.now();
    eval(code);
    const end = performance.now();
    return { start, end, diff: end - start };
  });

  return times.reduce((mem, item) => mem + item.diff, 0) / times.length;
}

class Suite {
  constructor(times) {
    this.times = times;
    this.suites = [];
  }
  addSuite(suite) {
    this.suites.push(suite);
  }
  run() {
    return this.suites.map((suite) => {
      return {
        ...suite,
        time: runCode(suite.code, this.times),
      };
    });
  }
}

export const Benchmark = {
  Suite,
};
