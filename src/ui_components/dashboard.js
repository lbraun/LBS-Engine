'use strict';
const React = require('react');
const Ons = require('react-onsenui');

const list = require('./list.js');

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.goToOffersTab = this.goToOffersTab.bind(this);
        this.handleOfferCompletion = this.handleOfferCompletion.bind(this);
        this.updateOfferAvailability = this.updateOfferAvailability.bind(this);
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
    updateOfferAvailability(e) {
        var updatedOffer = JSON.parse(JSON.stringify(this.props.currentUser.offer));
        updatedOffer.available = e.target.checked;

        this.props.pushUserUpdates({offer: updatedOffer});
    }

    /**
     * Complete the user's offer
     * @param {Event} e the react event object
     */
    handleOfferCompletion(e) {
        this.props.completeOffer();
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
        var offer = this.props.currentUser.offer;
        if (offer) {
            if (this.props.currentUser.available) {
                var availabilityInfo = this.l("availableNow");
            } else {
                var availabilityInfo = this.l("notCurrentlyAvailable");
            }

            return (
                <Ons.Card style={{padding: "24px"}}>
                    <Ons.Row>
                        <Ons.Col>
                            <h3>{offer.title}</h3>
                        </Ons.Col>
                        <Ons.Col style={{textAlign: "right"}}>
                            <a href="#"
                                style={{color: "black"}}

                                onClick={this.goToOffersTab}>
                                    <h3><Ons.Icon icon={"md-edit"} /></h3>
                            </a>
                        </Ons.Col>
                    </Ons.Row>

                    <Ons.Row>
                        <Ons.Col width="45px">
                            {/* TODO: handle blank image! */}
                            <img className="list-item__thumbnail"
                                src={`data:image/jpeg;base64, ${offer.picture}`} />
                        </Ons.Col>
                        <Ons.Col style={{paddingLeft: "15px"}}>
                            {offer.description}
                        </Ons.Col>
                    </Ons.Row>

                    <Ons.Row>
                        <Ons.Col style={{padding: "16px 0px"}}>
                            <i>{this.props.l(offer.available ? "offerForm.available" : "offerForm.notAvailable")}</i>
                        </Ons.Col>
                        <Ons.Col style={{padding: "12px 0px", textAlign: "right"}}>
                            <Ons.Switch
                                name="available"
                                checked={offer.available}
                                onChange={this.updateOfferAvailability} />
                        </Ons.Col>
                    </Ons.Row>

                    <div>
                        <Ons.Button
                            modifier="large"
                            onClick={this.handleOfferCompletion}
                            style={{backgroundColor: "green"}}>
                                <Ons.Icon icon={"md-check-circle"} style={{marginRight: "20px"}} />
                                {this.l("completeOffer")}
                        </Ons.Button>
                    </div>
                </Ons.Card>
            );
        } else {
            return (
                <Ons.Card style={{padding: "24px"}}>
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
                        <list.UserListItems
                            l={this.props.l}
                            online={this.props.online}
                            currentUser={this.props.currentUser}
                            defaultPicture={this.props.defaultPicture}
                            handleListItemClick={this.props.handleListItemClick}
                            usersAreLoaded={this.props.usersAreLoaded}
                            usersWithOffersOnly={true}
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

                <Ons.Row>
                    <Ons.Col style={{margin: "15px 20px 5px 15px"}}>
                        <div>{this.l("nearbyOffers")}</div>
                    </Ons.Col>
                </Ons.Row>

                {this.renderNearbyOffersCard()}
            </Ons.Page>
        )
    }
}

module.exports = {
    Dashboard: Dashboard
}
