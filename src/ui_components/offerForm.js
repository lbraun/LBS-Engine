'use strict';

const React = require('react');
const Ons = require('react-onsenui');

const config = require('../data_components/config.json');
const contactLinks = require('./contactLinks.js');
const confirmDialog = require('./confirmDialog.js');

/**
 * Offer form where the user can list items they are giving away.
 */
class OfferForm extends React.Component {
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
        this.save = this.save.bind(this);

        var offer = this.props.currentUser.offer || {};

        this.state = {
            offerDeletionAlertDialogIsOpen: false,
            pictureDeletionAlertDialogIsOpen: false,
            picture: offer.picture || null,
            pictureFormat: offer.picture ? "uri" : "base64",
            title: offer.title || "",
            description: offer.description || "",
            available: offer.available || false,
            saved: false,
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

        this.setState({
            [name]: value,
            saved: false,
        });
    }

    save() {
        if (!this.state.title) {
            alert(this.l("anOfferMustHaveATitle"));
            return;
        }

        this.props.pushUserUpdates({
            offer: {
                picture: this.state.picture,
                pictureFormat: this.state.pictureFormat,
                title: this.state.title,
                description: this.state.description,
                available: this.state.available,
            },
        });

        this.setState({
            saved: true,
        });
    }

    /**
     * Handle a click on the add/edit picture button
     * @param {Event} e the react event object
     */
    handleNewPictureClick(e) {
        var formInstance = this;

        navigator.camera.getPicture(function onSuccess(imageData) {
            formInstance.setState({
                picture: imageData,
                pictureFormat: "base64",
                saved: false,
            });
        }, function onFail(message) {
            console.log('Error getting picture: ' + message);
        }, {
            quality: 25,
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
        this.setState({
            picture: null,
            saved: false,
        });

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
        this.setState({
            picture: null,
            pictureFormat: "base64",
            title: "",
            description: "",
            available: false,
            saved: false,
        });

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
        if (this.state.picture) {
            if (this.state.pictureFormat == "base64") {
                var src = `data:image/jpeg;base64, ${this.state.picture}`;
            } else {
                var src = this.state.picture;
            }

            return (
                <div>
                    <img src={src}
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
        var status = {
            color: "#d9534f",
            icon: "edit",
            text: "notSaved",
        };

        if (this.state.saved) {
            if (this.props.currentUserIsLoaded) {
                status = {
                    color: "green",
                    icon: "check",
                    text: "saved",
                };
            } else {
                status = {
                    color: "black",
                    icon: "spinner",
                    spin: true,
                    text: "syncing",
                };
            }
        }

        return (
            <span style={{color: status.color}}>
                <Ons.Icon icon={"md-" + status.icon} spin={status.spin} /> {this.l(status.text)}
            </span>
        );
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
                    <Ons.ListItem>
                        <div className="list-item__subtitle">
                            {this.renderOfferStatus()}
                        </div>
                    </Ons.ListItem>

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
                                value={this.state.title}
                                onChange={this.handleInputChange}>
                            </input>
                        </div>
                    </Ons.ListItem>

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
                                value={this.state.description}
                                onChange={this.handleInputChange}>
                            </textarea>
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem
                        id="contact-information-li"
                        modifier={"chevron"}
                        tappable={true}
                        onClick={this.goToSettingsTab}>
                            <div className="list-item__title">
                                <b>{this.l("iCanBeContactedAt")}</b>
                            </div>
                            <p>
                                <contactLinks.ContactLinks
                                    small={true}
                                    user={this.props.currentUser} />
                            </p>
                    </Ons.ListItem>

                    {this.renderGeofenceWarningListItem()}

                    <Ons.ListItem id='availablility-switch-li'>
                        <div className='left'>
                            <div className="list-item__title">
                                <b>{this.l(this.state.available ? "available" :"notAvailable")}</b>
                            </div>
                        </div>
                        <div className='right'>
                            <Ons.Switch
                                name="available"
                                checked={this.state.available}
                                disabled={this.props.outOfGeofence ? "true" : false}
                                onChange={this.handleInputChange} />
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div className='right'>
                            <Ons.Button onClick={this.save}>
                                <Ons.Icon icon={"md-save"} style={{marginRight: "20px"}} />
                                {this.l("saveOffer")}
                            </Ons.Button>
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

                <confirmDialog.ConfirmDialog
                    isOpen={this.state.offerDeletionAlertDialogIsOpen}
                    cancelAction={this.closeOfferDeletionDialog}
                    confirmAction={this.confirmOfferDeletion}
                    confirmActionName={this.l("deleteOffer")}
                    l={this.props.l} />

                <confirmDialog.ConfirmDialog
                    isOpen={this.state.pictureDeletionAlertDialogIsOpen}
                    cancelAction={this.closePictureDeletionDialog}
                    confirmAction={this.confirmPictureDeletion}
                    confirmActionName={this.l("deleteOfferPicture")}
                    l={this.props.l} />
            </Ons.Page>
        );
    }
}

module.exports = {
    OfferForm: OfferForm,
}
