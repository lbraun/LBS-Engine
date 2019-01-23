'use strict';

const localizations = require('../data_components/localizations.json');


function validateLocalizationsFile() {
    var localizationsCount = Object.keys(localizations.en).length;

    for (var locale in localizations) {
        var count = Object.keys(localizations[locale]).length;

        if (count != localizationsCount) {
            consoleLog(`Warning! Locale ${locale} does not have the right number of entries.`);
        }
    }
}

validateLocalizationsFile();

/**
 * Localize the given string
 * @param {String} string The string to be localized.
 */
function l(string) {
    // TODO
}

module.exports = {
    l: l,
}
