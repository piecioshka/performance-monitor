import { Benchmark } from "./benchmark.js";

const qs = document.querySelector.bind(document);
const qsa = document.querySelectorAll.bind(document);

export class PerformanceMonitor {
  static EXECUTION_DELAY = 200; // milliseconds

  constructor() {
    this.$prepHTML = qs("#prep-html-code");
    this.$prepJS = qs("#prep-js-code");
    this.$times = qs("#times");

    this.$snippetsList = qs("#snippets");
    this.$submit = qs("#submit");
    this.$addSnippet = qs("#add-snippet");
    this.$loader = qs("#loader");
    this.$error = qs("#error");
    this.$sandbox = qs("#sandbox");

    this.results = [];

    this.listen();
  }

  displayError(error) {
    this.$error.innerHTML = error.stack
      ? `<pre><strong>Error:</strong> ${error.stack}</pre>`
      : `<pre><strong>Error:</strong> ${error.message}</pre>`;
    this.$error.classList.remove("d-none");
  }

  listen() {
    this.$addSnippet.addEventListener("click", (evt) => {
      evt.preventDefault();
      const $snippet = this.$snippetsList.firstElementChild.cloneNode(true);
      const snippetCount = this.$snippetsList.children.length + 1;
      $snippet.querySelector("label").textContent = `Snippet #${snippetCount}`;
      $snippet.querySelector("textarea").textContent = "";
      this.$snippetsList.append($snippet);
    });

    this.$submit.addEventListener("click", (evt) => {
      evt.preventDefault();

      this.lock();

      setTimeout(() => {
        try {
          this.displayResults();
        } catch (err) {
          console.error(err);
          this.displayError(err);
        }

        this.unlock();
      }, PerformanceMonitor.EXECUTION_DELAY);
    });
  }

  displayResults() {
    const $snippets = Array.from(qsa(".snippet"));
    const prepHTMLCode = this.$prepHTML.value;
    this.$sandbox.innerHTML += prepHTMLCode;

    const suites = new Benchmark.Suite(Number(this.$times.value.trim()));
    const prepJSCode = this.$prepJS.value;

    $snippets.forEach(($snippet) => {
      const snippet = $snippet.querySelector("textarea").value.trim();
      suites.addSuite({
        name: $snippet.querySelector("label").textContent.trim(),
        code: prepJSCode + snippet,
        result: $snippet.querySelector(".results"),
      });
    });

    const results = suites.run();

    results.forEach((suite) => {
      suite.id = suite.result.children.length + 1;
      const row = `
        <tr>
          <td>${suite.id}</td>
          <td>${suite.time.toFixed(3)} ms</td>
        </tr>
      `;
      suite.result.innerHTML += row;
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
