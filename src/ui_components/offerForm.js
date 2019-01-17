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
        this.handlePhotoButtonClick = this.handlePhotoButtonClick.bind(this);

        this.state = {
            imageData: this.props.currentUser.offerPicture,
        };
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
    handleInputChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.type === 'checkbox' ? target.checkbox.name : target.name;

        var attributes = {[name]: value};
        this.props.pushUserUpdates(attributes);
    }

    /**
     * Handle a click on the photo button
     * @param {Event} e the react event object
     */
    handlePhotoButtonClick(e) {
        var formInstance = this;

        navigator.camera.getPicture(function onSuccess(imageData) {
            formInstance.props.pushUserUpdates({offerPicture: imageData});
        }, function onFail(message) {
            console.log('Error getting picture: ' + message);
        }, {
            quality: 50,
            allowEdit: true,
            destinationType: Camera.DestinationType.DATA_URL
        });
    }

    renderGeofenceWarningListItem() {
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

    renderImageArea() {
        if (this.props.currentUser.offerPicture) {
            return (
                <div>
                    <img src={`data:image/jpeg;base64, ${this.props.currentUser.offerPicture}`}
                        id='offer-picture'
                        style={{width: "100%"}} />

                    <Ons.Button
                        onClick={this.handlePhotoButtonClick}
                        style={{margin: "20px"}}>
                            {this.l("changePicture")}
                    </Ons.Button>
                </div>
            );
        } else {
            return (
                <Ons.Button
                    onClick={this.handlePhotoButtonClick}
                    style={{margin: "30px"}}>
                        {this.l("addAPicture")}
                </Ons.Button>
            );
        }
    }

    render() {
        return (
            <Ons.Page>
                <Ons.List>
                    {this.renderGeofenceWarningListItem()}
                    <Ons.ListItem id='availablility-switch-li'>
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

                    <Ons.ListItem id="offer-title-li">
                        <div className="list-item__title">
                            <b>{this.l("offerTitlePlaceholder")}</b>
                        </div>
                        <div className="list-item__subtitle">
                            <input type="text"
                                id="offerTitle"
                                name="offerTitle"
                                className="text-input text-input--transparent"
                                style={{width: "100%"}}
                                placeholder={this.l("offerTitlePlaceholder")}
                                value={this.props.currentUser.offerTitle}
                                onChange={this.handleInputChange}>
                            </input>
                        </div>
                    </Ons.ListItem>
                </Ons.List>

                <Ons.Row id="offer-picture-row">
                    <Ons.Col>
                        {this.renderImageArea()}
                    </Ons.Col>
                </Ons.Row>

                <Ons.List>
                    <Ons.ListItem id="offer-description-li">
                        <div className="list-item__title">
                            <b>{this.l("offerDescriptionPlaceholder")}</b>
                        </div>
                        <div>
                            <textarea
                                id="offerDescription"
                                name="offerDescription"
                                className="textarea textarea--transparent"
                                style={{width: "100%"}}
                                rows="3"
                                placeholder={this.l("offerDescriptionPlaceholder")}
                                value={this.props.currentUser.offerDescription}
                                onChange={this.handleInputChange}>
                            </textarea>
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem id="contact-information-li">
                        <div className="list-item__title">
                            <b>{this.l("iCanBeContactedAt")}</b>
                        </div>
                        <div className="list-item__subtitle">
                            {this.l("iCanBeContactedAtHelpText")}
                        </div>
                        <div>
                            <textarea
                                id="contactInformation"
                                name="contactInformation"
                                className="textarea textarea--transparent"
                                style={{width: "100%"}}
                                rows="1"
                                placeholder={this.l("contactInformationPlaceholder")}
                                value={this.props.currentUser.contactInformation}
                                onChange={this.handleInputChange}>
                            </textarea>
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div className="list-item__subtitle">
                            {this.props.currentUserIsLoaded ? "✔︎ " + this.l("saved") : this.l("syncing")}
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
