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
    renderOffer() {
        if (this.props.currentUser.offerTitle) {
            if (this.props.currentUser.available) {
                var availabilityInfo = this.l("availableNow");
            } else {
                var availabilityInfo = this.l("notCurrentlyAvailable");
            }

            return (
                <div>
                    <b>{this.props.currentUser.offerTitle}</b>
                    <p>{this.props.currentUser.offerDescription}</p>
                    <p><i>{availabilityInfo}</i></p>

                    <Ons.Row>
                        <Ons.Col>
                            <Ons.Button onClick={this.goToOffersTab}>
                                {this.l("editOffer")}
                            </Ons.Button>
                        </Ons.Col>
                        <Ons.Col>
                            <Ons.Button onClick={this.toggleAvailability}>
                                {this.props.currentUser.available ?
                                    this.l("becomeUnavailable") :
                                    this.l("becomeAvailable")}
                            </Ons.Button>
                        </Ons.Col>
                    </Ons.Row>
                </div>
            );
        } else {
            return (
                <div>
                    <p>{this.l("youAreNotOffering")}</p>
                    <p>
                        <Ons.Button onClick={this.goToOffersTab}>
                            {this.l("createAnOffer")}
                        </Ons.Button>
                    </p>
                </div>
            );
        }
    }

    // Render the dashboard
    render() {
        var picture = this.props.online && this.props.currentUser.picture;
        picture = picture || this.props.defaultPicture;

        return (
            <Ons.Page>
                <Ons.Row>
                    <Ons.Col style={{margin: "15px"}}>
                        <h2>
                            {this.l("welcome")} {this.props.currentUser.name}
                        </h2>

                        <img src={picture}
                            alt="Profile picture"
                            height="42"
                            width="42" />

                        <h2>{this.l("yourOffer")}</h2>
                        {this.renderOffer()}

                    </Ons.Col>
                </Ons.Row>
            </Ons.Page>
        )
    }
}

module.exports = {
    Dashboard: Dashboard
}
