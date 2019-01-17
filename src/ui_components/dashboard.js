'use strict';
const React = require('react');
const Ons = require('react-onsenui');

const list = require('./list.js');

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.goToOffersTab = this.goToOffersTab.bind(this);
        this.toggleAvailability = this.toggleAvailability.bind(this);
        this.turnOnUseLocation = this.turnOnUseLocation.bind(this);
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

    /**
     * Turn on the user's useLocation setting
     * @param {Event} e the react event object
     */
    turnOnUseLocation(e) {
        this.props.pushUserUpdates({useLocation: true});
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

    // Render information about nearby offers
    renderNearbyOffersCard() {
        if (this.props.currentUser.useLocation) {
            return (
                <Ons.Card>
                    <Ons.List>
                        <Ons.ListItem>
                            {this.l("nearbyOffers")}
                        </Ons.ListItem>
                        <list.UserListItems
                            l={this.props.l}
                            online={this.props.online}
                            currentUser={this.props.currentUser}
                            defaultPicture={this.props.defaultPicture}
                            handleListItemClick={this.props.handleListItemClick}
                            usersAreLoaded={this.props.usersAreLoaded}
                            errorLoadingUsers={this.props.errorLoadingUsers}
                            users={this.props.users} />
                    </Ons.List>
                </Ons.Card>
            );
        } else {
            return (
                <Ons.Card>
                    <Ons.List>
                        <Ons.ListItem>
                            {this.l("nearbyOffers")}
                        </Ons.ListItem>
                        <Ons.ListItem>
                            <p>{this.l("weNeedYourLocationToShowThis")}</p>
                            <p>
                                <Ons.Button onClick={this.turnOnUseLocation}>
                                    {this.l("useMyLocation")}
                                </Ons.Button>
                            </p>
                        </Ons.ListItem>
                    </Ons.List>
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

                {this.renderNearbyOffersCard()}
            </Ons.Page>
        )
    }
}

module.exports = {
    Dashboard: Dashboard
}
