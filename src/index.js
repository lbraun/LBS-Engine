'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const ons = require('onsenui');
// Project files
const app = require('./ui_components/app.js');

// Auth0 for authentication
// https://github.com/auth0/auth0-cordova
const Auth0Cordova = require('@auth0/cordova');

ons.ready(function() {
    function handleURL(url) {
        Auth0Cordova.onRedirectUri(url);
    }

    window.handleOpenURL = handleURL;

    ReactDOM.render(
        <app.App />,
        document.getElementById('root')
    );
});
