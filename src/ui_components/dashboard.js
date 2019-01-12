'use strict';
const React = require('react');
const Ons = require('react-onsenui');

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.goToOffersTab = this.goToOffersTab.bind(this);
    }

    /**
     * Localize a string in the context of the dashboard
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`dashboard.${string}`);
    }

    /**
     * Call app method that navigates to the offers tab
     * @param {Event} e the react event object
     */
    goToOffersTab(e) {
        this.props.handleTabChange("offers");
    }

    statusInfo() {
        if (this.props.currentUser.available) {
            return this.l("youAreOffering")
                + " " + this.props.currentUser.offerDescription
                + " " + this.l("andYouAreAvailable");
        } else {
            return this.l("youAreOffering")
                + " " + this.props.currentUser.offerDescription
                + " " + this.l("butYouAreNotAvailable");
        }
    }

    // Render the dashboard
    render() {
        return (
            <Ons.Page>
                <Ons.Row style={{textAlign: "center"}}>
                    <Ons.Col style={{margin: "15px"}}>
                        <h1>
                            {this.l("welcome")} {this.props.currentUser.name}
                        </h1>

                        <img src={this.props.currentUser.picture}
                            alt="Profile picture"
                            height="42"
                            width="42" />

                        <p>{this.statusInfo()}</p>

                        <p>
                            <Ons.Button onClick={this.goToOffersTab}>
                                {this.props.currentUser.available ?
                                    this.l("editOffer") :
                                    this.l("becomeAvailable")}
                            </Ons.Button>
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
