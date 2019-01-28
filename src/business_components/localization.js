'use strict';

const localizations = require('../data_components/localizations.json');


function validateLocalizationsFile() {
    var localizationsCount = Object.keys(localizations.en).length;

    for (var locale in localizations) {
        var count = Object.keys(localizations[locale]).length;

        if (count != localizationsCount) {
            console.log(`Warning! Locale ${locale} does not have the right number of entries.`);

            var a = Object.keys(localizations[locale]);
            var b = Object.keys(localizations.en);
            var diff = [
                ...a.filter(x => !b.includes(x)),
                ...b.filter(x => !a.includes(x))
            ];

            console.log("Entries that are different:");
            console.log(diff);
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
