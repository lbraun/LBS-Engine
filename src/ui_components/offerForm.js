'use strict';

const React = require('react');
const Ons = require('react-onsenui');

// Custom files
// Logic
const logger = require('../business_components/logger.js');


/**
 * Offer form where the user can list items they are giving away. Modifies the state of the offerForm
 */
class offerForm extends React.Component {

    constructor(props) {
        super(props);
        this.handleOfferDescriptionChange = this.handleOfferDescriptionChange.bind(this);
        this.handleContactInformationChange = this.handleContactInformationChange.bind(this);
    }

    // Handle updates to offer description
    handleOfferDescriptionChange(e) {
        this.props.onOfferDescriptionChange(e.target.value);
    }

    // Handle updates to contact information
    handleContactInformationChange(e) {
        this.props.onContactInformationChange(e.target.value);
    }

    render() {
        return (
            <Ons.Page>
                <Ons.List>
                    <Ons.ListItem>
                        <div className="list-item__title">
                            What do you have to give?
                        </div>
                        <div className="list-item__subtitle">
                            Please give a nice short description of the offer.
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem>
                        <p>
                            <textarea
                                id="offerDescription"
                                className="textarea textarea--transparent"
                                placeholder="Offer description"
                                onChange={this.handleOfferDescriptionChange}>
                            </textarea>
                        </p>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div className="list-item__title">
                            How can other users contact you?
                        </div>
                        <div className="list-item__subtitle">
                            Please provide a phone number, email, or other instructions.
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem>
                        <p>
                            <textarea
                                id="contactInformation"
                                className="textarea textarea--transparent"
                                placeholder="Contact information"
                                onChange={this.handleContactInformationChange}>
                            </textarea>
                        </p>
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
