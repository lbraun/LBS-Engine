'use strict';
const React = require('react');
const Ons = require('react-onsenui');

class LocaleMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    // Render the locale menu
    render() {
        return (
            <Ons.Select value={this.props.locale} onChange={this.props.handleLocaleChange}>
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="ar">عربى</option>
            </Ons.Select>
        )
    }
}

module.exports = {
    LocaleMenu: LocaleMenu
}
