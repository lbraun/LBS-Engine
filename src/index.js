'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const ons = require('onsenui');
// Project files
const app = require('./ui_components/app.js');


ons.ready(function() {
    ReactDOM.render(
        <app.App />,
        document.getElementById('root')
    );
});
