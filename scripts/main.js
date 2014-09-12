/*global require */

require.config({
    baseUrl: 'scripts/',

    paths: {
        template: '../template',
        text: 'vendor/require/text',
        mustache: 'vendor/mustache/mustache'
    }
});

require([
    'core/perfo'
], function (PerfoJS) {
    'use strict';

    PerfoJS.start();

    window.PerfoJS = PerfoJS;
});
