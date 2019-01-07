'use strict';
const React = require('react');
const Ons = require('react-onsenui');

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
    }

    /**
     * Localize a string in the context of the dashboard
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`dashboard.${string}`);
    }

    // Render the dashboard
    render() {
        return (
            <Ons.Page>
                <Ons.Row height="100%">
                    <Ons.Col verticalAlign="center">
                        <h1 style={{textAlign: "center"}}>GeoFreebie</h1>
                        <p style={{textAlign: "center"}}>
                            {this.l("welcome")} {this.props.currentUser.name}!
                        </p>
                    </Ons.Col>
                </Ons.Row>
            </Ons.Page>
        )
    }
}

module.exports = {
    Dashboard: Dashboard
}
