define([
    'text!template/results.html',
    'mustache'
], function (template, Mustache) {
    'use strict';

    var PerfoJS = (function () {
        var $code, $form, $results, $submit, $loader;

        var qs = document.querySelector.bind(document);

        return {
            start: function () {
                $code = qs('#code');
                $form = qs('form');
                $results = qs('#results');
                $submit = qs('#submit');
                $loader = qs('#loader');

                this.listen();
            },

            listen: function () {
                var results = [];
                var id = 0;

                function calculate(code) {
                    var result = PerfoJS.run(code);
                    result.id = ++id;
                    results.unshift(result);

                    if (results.length > PerfoJS.RESULTS_LIMIT) {
                        results.length = PerfoJS.RESULTS_LIMIT;
                    }

                    $results.innerHTML = Mustache.render(template, {
                        results: results
                    });
                }

                $form.addEventListener('submit', function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();

                    var code = $code.value;

                    if (!PerfoJS.test(code)) {
                        return;
                    }

                    PerfoJS.lock(function () {
                        calculate(code);
                        PerfoJS.unlock();
                    });
                });
            },

            test: function (code) {
                var status = true;

                try {
                    eval(code);
                } catch (e) {
                    status = false;
                    PerfoJS.unlock();
                    throw e;
                }

                return status;
            },

            run: function (code) {
                var meanTime, globalTime, endTime, startTime;
                var times = new Array(PerfoJS.TIMES).join('|').split('|');
                var timeList = [];

                times.forEach(function () {
                    var start, end;

                    start = Date.now();
                    eval(code);
                    end = Date.now();

                    timeList.push({
                        start: start,
                        end: end
                    });
                });

                startTime = timeList.reduce(function (result, item) {
                    return result + item.start;
                }, 0);

                endTime = timeList.reduce(function (result, item) {
                    return result + item.end;
                }, 0);

                globalTime = endTime - startTime;

                if (globalTime > 0) {
                    meanTime = globalTime / PerfoJS.TIMES;
                } else {
                    meanTime = 0;
                }

                return {
                    mean: meanTime,
                    global: globalTime
                };
            },

            lock: function (callback) {
                $submit.classList.remove('show');
                $submit.classList.add('hide');

                $loader.classList.remove('hide');
                $loader.classList.add('show');

                // After render engine finished redraw.
                setTimeout(callback, PerfoJS.LAG);
            },

            unlock: function () {
                $submit.classList.remove('hide');
                $submit.classList.add('show');

                $loader.classList.remove('show');
                $loader.classList.add('hide');
            }
        };
    }());

    PerfoJS.LAG = 100;
    PerfoJS.TIMES = 100;
    PerfoJS.RESULTS_LIMIT = 8;

    return PerfoJS;
});
