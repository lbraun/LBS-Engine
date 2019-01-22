'use strict';

const React = require('react');
const Ons = require('react-onsenui');

/**
 * Offer form where the user can list items they are giving away.
 */
class offerForm extends React.Component {
    constructor(props) {
        super(props);
        this.goToSettingsTab = this.goToSettingsTab.bind(this);
        this.openOfferDeletionDialog = this.openOfferDeletionDialog.bind(this);
        this.closeOfferDeletionDialog = this.closeOfferDeletionDialog.bind(this);
        this.confirmOfferDeletion = this.confirmOfferDeletion.bind(this);
        this.openPictureDeletionDialog = this.openPictureDeletionDialog.bind(this);
        this.closePictureDeletionDialog = this.closePictureDeletionDialog.bind(this);
        this.confirmPictureDeletion = this.confirmPictureDeletion.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleNewPictureClick = this.handleNewPictureClick.bind(this);
        this.offer = this.offer.bind(this);
        this.pushOfferUpdates = this.pushOfferUpdates.bind(this);

        this.state = {
            offerDeletionAlertDialogIsOpen: false,
            pictureDeletionAlertDialogIsOpen: false,
        };
    }

    /**
     * Localize a string in the context of the offer form
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`offerForm.${string}`);
    }

    offer() {
        var newOffer = {
            title: "",
            picture: null,
            description: "",
            available: false,
        };

        return this.props.currentUser.offer || newOffer;
    }

    /**
     * Call app method that navigates to the settings tab
     * @param {Event} e the react event object
     */
    goToSettingsTab(e) {
        this.props.handleTabChange("settings");
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
        this.pushOfferUpdates(attributes);
    }

    pushOfferUpdates(attributes) {
        var updatedOffer = JSON.parse(JSON.stringify(this.offer()));
        Object.assign(updatedOffer, attributes);

        this.props.pushUserUpdates({offer: updatedOffer});
    }

    /**
     * Handle a click on the add/edit picture button
     * @param {Event} e the react event object
     */
    handleNewPictureClick(e) {
        var formInstance = this;

        navigator.camera.getPicture(function onSuccess(imageData) {
            formInstance.pushOfferUpdates({picture: imageData});
        }, function onFail(message) {
            console.log('Error getting picture: ' + message);
        }, {
            quality: 50,
            allowEdit: true,
            destinationType: Camera.DestinationType.DATA_URL
        });
    }


    //** Picture deletion dialog methods **//

    openPictureDeletionDialog() {
        this.setState({pictureDeletionAlertDialogIsOpen: true});
    }

    closePictureDeletionDialog() {
        this.setState({pictureDeletionAlertDialogIsOpen: false});
    }

    /**
     * Handle a click on the delete picture confirm button
     * @param {Event} e the react event object
     */
    confirmPictureDeletion(e) {
        this.pushOfferUpdates({picture: null});
        this.closePictureDeletionDialog();
    }


    //** Offer deletion dialog methods **//

    openOfferDeletionDialog() {
        this.setState({offerDeletionAlertDialogIsOpen: true});
    }

    closeOfferDeletionDialog() {
        this.setState({offerDeletionAlertDialogIsOpen: false});
    }

    /**
     * Handle a click on the delete offer confirm button
     * @param {Event} e the react event object
     */
    confirmOfferDeletion(e) {
        this.props.pushUserUpdates({offer: null});
        this.closeOfferDeletionDialog();
    }

    renderGeofenceWarningListItem() {
        if (this.props.outOfGeofence) {
            return (
                <Ons.ListItem>
                    <div className="list-item__subtitle" style={{color: "#d9534f"}}>
                        {this.l("geofenceWarning")}
                    </div>
                </Ons.ListItem>
            );
        } else {
            return null;
        }
    }

    renderImageArea() {
        if (this.offer().picture) {
            return (
                <div>
                    <img src={`data:image/jpeg;base64, ${this.offer().picture}`}
                        id='offer-picture'
                        style={{width: "100%"}} />

                    <div style={{
                            position: "absolute",
                            textAlign: "right",
                            width: "100%",
                            margin: "-60px -20px",
                        }}>
                            <Ons.Button
                                onClick={this.openPictureDeletionDialog}
                                style={{backgroundColor: "#d9534f"}}>
                                    <Ons.Icon icon={"md-delete"} />
                            </Ons.Button>
                    </div>
                </div>
            );
        } else {
            return (
                <div style={{textAlign: "center"}}>
                    <Ons.Button
                        onClick={this.handleNewPictureClick}
                        style={{margin: "30px"}}>
                            <Ons.Icon icon={"md-camera-add"} style={{marginRight: "20px"}} />
                            {this.l("addPicture")}
                    </Ons.Button>
                </div>
            );
        }
    }

    renderOfferStatus() {
        if (this.props.currentUserIsLoaded) {
            return (
                <span style={{color: "green"}}>
                    <Ons.Icon icon={"md-check"} /> {this.l("saved")}
                </span>
            );
        } else {
            return (
                <span>
                    <Ons.Icon icon={"md-spinner"} /> {this.l("syncing")}
                </span>
            );
        }
    }

    render() {
        return (
            <Ons.Page>
                <Ons.Row id="offer-picture-row">
                    <Ons.Col>
                        {this.renderImageArea()}
                    </Ons.Col>
                </Ons.Row>

                <Ons.List>
                    <Ons.ListItem id="offer-title-li">
                        <div className="list-item__title">
                            <b>{this.l("offerTitlePlaceholder")}</b>
                        </div>
                        <div className="list-item__subtitle">
                            <input type="text"
                                id="offerTitle"
                                name="title"
                                className="text-input text-input--transparent"
                                style={{width: "100%"}}
                                placeholder={this.l("offerTitlePlaceholder")}
                                value={this.offer().title}
                                onChange={this.handleInputChange}>
                            </input>
                        </div>
                    </Ons.ListItem>
                </Ons.List>

                <Ons.List>
                    <Ons.ListItem id="offer-description-li">
                        <div className="list-item__title">
                            <b>{this.l("offerDescriptionPlaceholder")}</b>
                        </div>
                        <div>
                            <textarea
                                id="offerDescription"
                                name="description"
                                className="textarea textarea--transparent"
                                style={{width: "100%"}}
                                rows="3"
                                placeholder={this.l("offerDescriptionPlaceholder")}
                                value={this.offer().description}
                                onChange={this.handleInputChange}>
                            </textarea>
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem id="contact-information-li">
                        <div className="list-item__title">
                            <Ons.Row>
                                <Ons.Col width="80%">
                                    <b>{this.l("iCanBeContactedAt")}</b>
                                </Ons.Col>

                                <Ons.Col width="20%" style={{textAlign: "right"}}>
                                    <b><a href="#"
                                        style={{color: "black", marginRight: "10px"}}

                                        onClick={this.goToSettingsTab}>
                                            <Ons.Icon icon={"md-settings"} />
                                    </a></b>
                                </Ons.Col>
                            </Ons.Row>
                        </div>
                        <div className="list-item__subtitle">
                            {this.l("iCanBeContactedAtHelpText")}
                        </div>
                        <div>
                            {"TODO" || this.props.currentUser.contactInformation}
                        </div>
                    </Ons.ListItem>

                    {this.renderGeofenceWarningListItem()}
                    <Ons.ListItem id='availablility-switch-li'>
                        <div className='left'>
                            <p>{this.offer().available ? this.l("available") : this.l("notAvailable")}</p>
                        </div>
                        <div className='right'>
                            <Ons.Switch
                                name="available"
                                checked={this.offer().available}
                                disabled={this.props.outOfGeofence ? true : false}
                                onChange={this.handleInputChange} />
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div className="list-item__subtitle">
                            {this.renderOfferStatus()}
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div className='right'>
                            <Ons.Button
                                onClick={this.openOfferDeletionDialog}
                                style={{backgroundColor: "#d9534f"}}>
                                    <Ons.Icon icon={"md-delete"} style={{marginRight: "20px"}} />
                                    {this.l("deleteOffer")}
                            </Ons.Button>
                        </div>
                    </Ons.ListItem>
                </Ons.List>

                <AlertDialog
                    isOpen={this.state.offerDeletionAlertDialogIsOpen}
                    cancelAction={this.closeOfferDeletionDialog}
                    confirmAction={this.confirmOfferDeletion}
                    confirmActionName={this.l("deleteOffer")}
                    l={this.props.l} />

                <AlertDialog
                    isOpen={this.state.pictureDeletionAlertDialogIsOpen}
                    cancelAction={this.closePictureDeletionDialog}
                    confirmAction={this.confirmPictureDeletion}
                    confirmActionName={this.l("deleteOfferPicture")}
                    l={this.props.l} />
            </Ons.Page>
        )
    }
}

/**
 * Alert dialog allowing the user to confirm they really want to take an action
 */
class AlertDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Ons.AlertDialog
                isOpen={this.props.isOpen}
                onCancel={this.props.cancelAction}
                cancelable>
                    <div className="alert-dialog-title">
                        {this.props.l("app.areYouSure")}
                    </div>

                    <div className="alert-dialog-content">
                        {this.props.l("app.thisCannotBeUndone")}
                    </div>

                    <div className="alert-dialog-footer">
                        <Ons.Button onClick={this.props.cancelAction} className="alert-dialog-button">
                            {this.props.l("app.cancel")}
                        </Ons.Button>
                    </div>
                    <div className="alert-dialog-footer">
                        <Ons.Button onClick={this.props.confirmAction} className="alert-dialog-button">
                            {this.props.confirmActionName}
                        </Ons.Button>
                    </div>
            </Ons.AlertDialog>
        );
    }
}

module.exports = {
    offerForm: offerForm,
}
