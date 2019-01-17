'use strict';
const React = require('react');
const Ons = require('react-onsenui');

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.goToOffersTab = this.goToOffersTab.bind(this);
        this.toggleAvailability = this.toggleAvailability.bind(this);
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

    /**
     * Toggle user's availability status
     * @param {Event} e the react event object
     */
    toggleAvailability(e) {
        this.props.pushUserUpdates({available: !this.props.currentUser.available});
    }

    // Render information about the user's offer
    renderOfferCard() {
        if (this.props.currentUser.offerTitle) {
            if (this.props.currentUser.available) {
                var availabilityInfo = this.l("availableNow");
            } else {
                var availabilityInfo = this.l("notCurrentlyAvailable");
            }

            return (
                <Ons.Card>
                    <Ons.Row>
                        <Ons.Col>
                            <h3>{this.props.currentUser.offerTitle}</h3>
                        </Ons.Col>
                        <Ons.Col style={{textAlign: "right"}}>
                            <a href="#"
                                style={{color: "black"}}

                                onClick={this.goToOffersTab}>
                                    <h3><Ons.Icon icon={"md-edit"} /></h3>
                            </a>
                        </Ons.Col>
                    </Ons.Row>

                    <p>{this.props.currentUser.offerDescription}</p>
                    <p><i>{availabilityInfo}</i></p>

                    <div>
                        <Ons.Button onClick={this.toggleAvailability}>
                            {this.props.currentUser.available ?
                                this.l("becomeUnavailable") :
                                this.l("becomeAvailable")}
                        </Ons.Button>
                    </div>
                </Ons.Card>
            );
        } else {
            return (
                <Ons.Card>
                    <p>{this.l("youAreNotOffering")}</p>
                    <p>
                        <Ons.Button onClick={this.goToOffersTab}>
                            {this.l("createAnOffer")}
                        </Ons.Button>
                    </p>
                </Ons.Card>
            );
        }
    }

    // Render the dashboard
    render() {
        return (
            <Ons.Page>
                <Ons.Row>
                    <Ons.Col style={{margin: "15px 20px 5px 15px"}}>
                        <div>{this.l("yourOffer")}</div>
                    </Ons.Col>
                </Ons.Row>

                {this.renderOfferCard()}
            </Ons.Page>
        )
    }
}

module.exports = {
    Dashboard: Dashboard
}
