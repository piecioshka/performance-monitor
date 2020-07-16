const qs = document.querySelector.bind(document);

class PerformanceMonitor {
  static EXECUTION_DELAY = 200; // milliseconds

  static run(code, timesCount = 10) {
    const times = Array.from({ length: timesCount }).map(() => {
      const start = performance.now();
      eval(code);
      const end = performance.now();
      return { start, end, diff: end - start };
    });

    const time = (
      times.reduce((mem, item) => mem + item.diff, 0) / times.length
    ).toFixed(3);

    return { time };
  }

  constructor() {
    this.$form = qs("form");
    this.$code = qs("#code");
    this.$times = qs("#times");
    this.$submit = qs("#submit");
    this.$results = qs("#results");
    this.$loader = qs("#loader");
    this.$error = qs(".error");

    this.results = [];

    this.listen();
  }

  displayResult(result) {
    result.id = this.results.length + 1;
    this.results.unshift(result);
    this.$results.innerHTML = this.buildResultsBoard(this.results);
  }

  displayError(message) {
    this.$error.innerHTML = `Something wrong: <strong>${message}</strong>`;
    this.$error.classList.remove("d-none");
  }

  buildResultsBoard(results) {
    return `
    ${results
      .map(
        ({ id, time }) => `
          <tr>
            <td>${id}</td>
            <td>${time} ms</td>
          </tr>
        `
      )
      .join("")}
    `;
  }

  listen() {
    this.$form.addEventListener("submit", (evt) => {
      evt.preventDefault();

      this.lock();

      setTimeout(() => {
        try {
          const result = PerformanceMonitor.run(
            this.$code.value,
            Number(this.$times.value)
          );
          this.displayResult(result);
        } catch (err) {
          this.displayError(err.message);
        }

        this.unlock();
      }, PerformanceMonitor.EXECUTION_DELAY);
    });
  }

  lock() {
    this.$submit.classList.add("d-none");
    this.$loader.classList.remove("d-none");
    this.$error.classList.add("d-none");
    this.$error.innerHTML = "";
  }

  unlock() {
    this.$submit.classList.remove("d-none");
    this.$loader.classList.add("d-none");
  }
}

function main() {
  new PerformanceMonitor();
}

main();
