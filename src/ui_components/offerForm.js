'use strict';

const React = require('react');
const Ons = require('react-onsenui');

// Custom files
// Logic
const logger = require('../business_components/logger.js');


/**
 * Offer form where the user can list items they are giving away.
 */
class offerForm extends React.Component {

    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    /**
     * Handle the change of a user property
     * @param {Event} e the react event object
     */
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        var updatedUser = this.props.currentUser;
        updatedUser[name] = value;
        this.props.pushUserUpdate(updatedUser);
    }

    render() {
        return (
            <Ons.Page>
                <Ons.List>
                    <Ons.ListItem id="offer-description-title-li">
                        <div className="list-item__title">
                            What do you have to give?
                        </div>
                        <div className="list-item__subtitle">
                            Please give a nice short description of the offer.
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem id="offer-description-textarea-li">
                        <p>
                            <textarea
                                id="offerDescription"
                                name="offerDescription"
                                className="textarea textarea--transparent"
                                placeholder="Offer description"
                                value={this.props.currentUser.offerDescription}
                                onChange={this.handleInputChange}>
                            </textarea>
                        </p>
                    </Ons.ListItem>

                    <Ons.ListItem id="contact-information-title-li">
                        <div className="list-item__title">
                            How can other users contact you?
                        </div>
                        <div className="list-item__subtitle">
                            Please provide a phone number, email, or other instructions.
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem id="contact-information-textarea-li">
                        <p>
                            <textarea
                                id="contactInformation"
                                name="contactInformation"
                                className="textarea textarea--transparent"
                                placeholder="Contact information"
                                value={this.props.currentUser.contactInformation}
                                onChange={this.handleInputChange}>
                            </textarea>
                        </p>
                    </Ons.ListItem>
                    <Ons.ListItem>
                        <div className="list-item__subtitle">
                            {this.props.currentUserIsLoaded ? "✔︎" : "Syncing..."}
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
