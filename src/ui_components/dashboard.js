'use strict';
const React = require('react');
const Ons = require('react-onsenui');

const list = require('./list.js');
const confirmDialog = require('./confirmDialog.js');

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.goToOffersTab = this.goToOffersTab.bind(this);
        this.closeOfferCompletionDialog = this.closeOfferCompletionDialog.bind(this);
        this.openOfferCompletionDialog = this.openOfferCompletionDialog.bind(this);
        this.confirmOfferCompletion = this.confirmOfferCompletion.bind(this);
        this.updateOfferAvailability = this.updateOfferAvailability.bind(this);
        this.turnOnUseLocation = this.turnOnUseLocation.bind(this);

        this.state = {
            offerCompletionAlertDialogIsOpen: false,
        }
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


    //** Offer completion dialog methods **//

    openOfferCompletionDialog() {
        this.setState({offerCompletionAlertDialogIsOpen: true});
    }

    closeOfferCompletionDialog() {
        this.setState({offerCompletionAlertDialogIsOpen: false});
    }

    /**
     * Handle a click on the confirm offer completion button
     * @param {Event} e the react event object
     */
    confirmOfferCompletion(e) {
        this.closeOfferCompletionDialog();
        this.props.completeOffer();
    }

    /**
     * Turn on the user's useLocation setting
     * @param {Event} e the react event object
     */
    turnOnUseLocation(e) {
        this.props.pushUserUpdates({useLocation: true});
    }

    // Render the dashboard
    render() {
        return (
            <Ons.Page>
                {this.renderPendingReviews()}

                <Ons.Row>
                    <Ons.Col style={{margin: "15px 20px 5px 15px"}}>
                        <div>{this.l("yourOffer")}</div>
                    </Ons.Col>
                </Ons.Row>

                {this.renderOfferCard()}

                <confirmDialog.ConfirmDialog
                    isOpen={this.state.offerCompletionAlertDialogIsOpen}
                    cancelAction={this.closeOfferCompletionDialog}
                    confirmAction={this.confirmOfferCompletion}
                    confirmActionName={this.l("completeOffer")}
                    l={this.props.l} />

                <Ons.Row>
                    <Ons.Col style={{margin: "15px 20px 5px 15px"}}>
                        <div>{this.l("nearbyOffers")}</div>
                    </Ons.Col>
                </Ons.Row>

                {this.renderNearbyOffersCard()}
            </Ons.Page>
        )
    }

    // Render information about the user's pending reviews
    renderPendingReviews() {
        var reviewItems = this.renderReviewItems()

        if (reviewItems.length) {
            return (
                <div>
                    <Ons.Row>
                        <Ons.Col style={{margin: "15px 20px 5px 15px"}}>
                            <div>{this.l("pendingReviews")}</div>
                        </Ons.Col>
                    </Ons.Row>

                    <Ons.Card style={{padding: "24px"}}>
                        <Ons.List>
                            {reviewItems}
                        </Ons.List>
                    </Ons.Card>
                </div>
            );
        }
    }

    // Render review list items
    renderReviewItems() {
        var reviewItems = [];

        var pendingReviews = this.props.pendingReviews;

        for (var i = pendingReviews.length - 1; i >= 0; i--) {
            var review = pendingReviews[i];
            var createdAt = new Date(review.createdAt).toLocaleString();

            reviewItems.push(
                <Ons.ListItem
                    tappable={true}
                    onClick={null}
                    key={review._id}>
                        <div>
                            {createdAt}
                        </div>
                </Ons.ListItem>
            );
        }

        return (reviewItems);
    }

    // Render information about the user's offer
    renderOfferCard() {
        var offer = this.props.currentUser.offer;
        if (offer) {
            var availabilityInfo = offer.available ?
                this.l("availableNow") :
                this.l("notCurrentlyAvailable");

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
                            onClick={this.openOfferCompletionDialog}
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
}

module.exports = {
    Dashboard: Dashboard
}
