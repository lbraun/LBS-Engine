'use strict';

const React = require('react');
const Ons = require('react-onsenui');

// Custom files
// Logic
const logger = require('../business_components/logger.js');


/**
 * Gift form where the user can list items they are giving away. Modifies the state of the giftForm
 */
class GiftForm extends React.Component {

    constructor(props) {
        super(props);
        this.handleGiftDescriptionChange = this.handleGiftDescriptionChange.bind(this);
        this.handleContactInformationChange = this.handleContactInformationChange.bind(this);
    }

    // Handle updates to gift description
    handleGiftDescriptionChange(e) {
        this.props.onGiftDescriptionChange(e.target.value);
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
                        <div class="list-item__title">
                            What do you have to give?
                        </div>
                        <div class="list-item__subtitle">
                            Please give details like shape, size, condition, flavor, age, etc.
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem>
                        <p>
                            <textarea
                                id="giftDescription"
                                class="textarea textarea--transparent"
                                placeholder="Gift description"
                                onChange={this.handleGiftDescriptionChange}
                                float>
                            </textarea>
                        </p>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div class="list-item__title">
                            How can other users contact you?
                        </div>
                        <div class="list-item__subtitle">
                            Please provide a phone number, email, or other instructions.
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem>
                        <p>
                            <textarea
                                id="contactInformation"
                                class="textarea textarea--transparent"
                                placeholder="Contact information"
                                onChange={this.handleContactInformationChange}
                                float>
                            </textarea>
                        </p>
                    </Ons.ListItem>
                </Ons.List>
            </Ons.Page>
        )
    }
}

const giftFormComponent = <GiftForm />

module.exports = {
    GiftForm: GiftForm,
    giftFormComponent: giftFormComponent
}
