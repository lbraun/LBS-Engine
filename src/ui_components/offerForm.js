'use strict';

const React = require('react');
const Ons = require('react-onsenui');

/**
 * Offer form where the user can list items they are giving away.
 */
class offerForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    /**
     * Localize a string in the context of the offer form
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`offerForm.${string}`);
    }

    /**
     * Handle the change of a user property
     * @param {Event} e the react event object
     */
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.type === 'checkbox' ? target.checkbox.name : target.name;

        var updatedUser = this.props.currentUser;
        updatedUser[name] = value;
        this.props.pushUserUpdate(updatedUser);
    }

    renderGeofenceWarning() {
        if (this.props.outOfGeofence) {
            return (
                <Ons.ListItem>
                    <div className="list-item__subtitle">
                        {this.l("geofenceWarning")}
                    </div>
                </Ons.ListItem>
            );
        } else {
            return null;
        }
    }

    render() {
        return (
            <Ons.Page>
                <Ons.List>
                    {this.renderGeofenceWarning()}
                    <Ons.ListItem id='use-location-li' key='available'>
                        <div className='left'>
                            <p>{this.props.currentUser.available ? this.l("available") : this.l("notAvailable")}</p>
                        </div>
                        <div className='right'>
                            <Ons.Switch
                                name="available"
                                checked={this.props.currentUser.available}
                                disabled={this.props.outOfGeofence ? "true" : false}
                                onChange={this.handleInputChange} />
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem id="offer-description-title-li">
                        <div className="list-item__title">
                            {this.l("iAmOffering")}
                        </div>
                        <div className="list-item__subtitle">
                            {this.l("iAmOfferingHelpText")}
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem id="offer-description-textarea-li">
                        <p>
                            <textarea
                                id="offerDescription"
                                name="offerDescription"
                                className="textarea textarea--transparent"
                                placeholder={this.l("offerDescriptionPlaceholder")}
                                value={this.props.currentUser.offerDescription}
                                onChange={this.handleInputChange}>
                            </textarea>
                        </p>
                    </Ons.ListItem>

                    <Ons.ListItem id="contact-information-title-li">
                        <div className="list-item__title">
                            {this.l("iCanBeContactedAt")}
                        </div>
                        <div className="list-item__subtitle">
                            {this.l("iCanBeContactedAtHelpText")}
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem id="contact-information-textarea-li">
                        <p>
                            <textarea
                                id="contactInformation"
                                name="contactInformation"
                                className="textarea textarea--transparent"
                                placeholder={this.l("contactInformationPlaceholder")}
                                value={this.props.currentUser.contactInformation}
                                onChange={this.handleInputChange}>
                            </textarea>
                        </p>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div className="list-item__subtitle">
                            {this.props.currentUserIsLoaded ? "✔︎" : this.l("syncing")}
                        </div>
                    </Ons.ListItem>
                </Ons.List>
            </Ons.Page>
        )
    }
}

const offerFormComponent = <offerForm />

module.exports = {
    offerForm: offerForm,
    offerFormComponent: offerFormComponent
}
