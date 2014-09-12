/*global performance */

define([
    'text!template/results.html',
    'mustache'
], function (template, Mustache) {
    'use strict';

    var PerfoJS = (function () {
        var $code, $form, $results, $submit, $loader, $alert;
        var results, id;

        var qs = document.querySelector.bind(document);

        return {
            start: function () {
                $code = qs('#code');
                $form = qs('form');
                $results = qs('#results');
                $submit = qs('#submit');
                $loader = qs('#loader');
                $alert = qs('.alert');

                results = [];
                id = 0;

                this.listen();
            },

            calculate: function (code) {
                var result = PerfoJS.run(code);
                result.id = ++id;
                results.unshift(result);

                if (results.length > PerfoJS.RESULTS_LIMIT) {
                    results.length = PerfoJS.RESULTS_LIMIT;
                }

                $results.innerHTML = Mustache.render(template, {
                    results: results
                });
            },

            listen: function () {

                $form.addEventListener('submit', function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();

                    var code = $code.value;

                    if (!PerfoJS.test(code)) {
                        return;
                    }

                    PerfoJS.lock(function () {
                        PerfoJS.calculate(code);
                        PerfoJS.unlock();
                    });
                });
            },

            test: function (code) {
                var status = true;

                try {
                    eval(code);
                    PerfoJS.error();
                } catch (e) {
                    status = false;
                    PerfoJS.unlock();
                    PerfoJS.error(e.message);
                }

                return status;
            },

            run: function (code) {
                var time, endTime, startTime;
                var times = new Array(PerfoJS.TIMES).join('|').split('|');
                var timeList = [];

                times.forEach(function () {
                    var start, end;

                    start = performance.now();
                    eval(code);
                    end = performance.now();

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

                time = endTime - startTime;

                return {
                    time: time.toFixed(3)
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
            },

            error: function (message) {
                if (message) {
                    $alert.innerHTML = 'Something wrong: <strong>' + message + '</strong>';
                    $alert.classList.remove('hide');
                    $alert.classList.add('show');
                } else {
                    $alert.innerHTML = '';
                    $alert.classList.remove('show');
                    $alert.classList.add('hide');
                }
            }
        };
    }());

    PerfoJS.LAG = 100;
    PerfoJS.TIMES = 100;
    PerfoJS.RESULTS_LIMIT = 10;

    return PerfoJS;
});
