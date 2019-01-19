'use strict';

const React = require('react');
const Ons = require('react-onsenui');

const localeMenu = require('./localeMenu.js');

/**
 * Settings for the app. Modifies the state of the settings
 */
class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.handleChangeData = this.handleChangeData.bind(this);
        this.handleChangeDragMap = this.handleChangeDragMap.bind(this);
        this.handleChangeLayerControl = this.handleChangeLayerControl.bind(this);
        this.handleChangeZoomMap = this.handleChangeZoomMap.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.l = this.l.bind(this);
    }

    /**
     * Localize a string in the context of the settings
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`settings.${string}`);
    }

    // Handle toggle for using external data
    handleChangeData(e) {
        this.props.onDataChange(e.target.checked);
    }

    // Handle toggle for layerControl
    handleChangeLayerControl(e) {
        this.props.onLayerControlChange(e.target.checked);
    }

    // Handle toggle of map dragging
    handleChangeDragMap(e) {
        this.props.onDragMapChange(e.target.checked);
    }

    // Handle toggle of map zooming
    handleChangeZoomMap(e) {
        this.props.onZoomMapChange(e.target.checked);
    }

    /**
     * Handle the change of a user setting
     * @param {Event} e the react event object
     */
    handleInputChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.type === 'checkbox' ? target.checkbox.name : target.name;

        var attributes = {[name]: value};

        // If user turns of useLocation, turn of shareLocation as well
        if (name == "useLocation" && !value) {
            attributes.shareLocation = false;
        }

        this.props.pushUserUpdates(attributes);
    }

    render() {
        return (
            <Ons.Page>
                <Ons.List>
                    <Ons.ListItem>
                        <div className='left'>
                            <p>{this.l("language")}</p>
                        </div>
                        <div className='right'>
                            <localeMenu.LocaleMenu
                                locale={this.props.locale}
                                handleLocaleChange={this.props.handleLocaleChange} />
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div className='left'>
                            <p>{this.l("name")}</p>
                        </div>
                        <div className='right'>
                            <input type="text"
                                name="name"
                                className="text-input text-input--material"
                                placeholder={this.l("name")}
                                value={this.props.currentUser.name}
                                onChange={this.handleInputChange}>
                            </input>
                        </div>
                    </Ons.ListItem>

                    <ContactSettings
                        currentUser={this.props.currentUser}
                        pushUserUpdates={this.props.pushUserUpdates}
                        l={this.props.l} />

                    <Ons.ListItem>
                        <div className='left'>
                            <p>{this.l("useLocation")}</p>
                        </div>
                        <div className='right'>
                            <Ons.Switch
                                name="useLocation"
                                checked={this.props.currentUser.useLocation}
                                onChange={this.handleInputChange} />
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem>
                        <div className="list-item__subtitle">
                            {this.l("useLocationText")}
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div className='left'>
                            <p>{this.l("shareLocation")}</p>
                        </div>
                        <div className='right'>
                            <Ons.Switch
                                name="shareLocation"
                                checked={this.props.currentUser.shareLocation}
                                onChange={this.handleInputChange} />
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem>
                        <div className="list-item__subtitle">
                            {this.l("shareLocationText")}
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div className='left'>
                            <p>{`${this.l("loggedInAs")} ${this.props.currentUser.name}`}</p>
                        </div>
                        <div className='right'>
                            <Ons.Button onClick={this.props.logout}>{this.l("logOut")}</Ons.Button>
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div className='left'>
                            <p>{this.l("youHaveConsented")}</p>
                        </div>
                        <div className='right'>
                            <Ons.Button onClick={this.props.revokeConsent}>{this.l("quitTheStudy")}</Ons.Button>
                        </div>
                    </Ons.ListItem>
                </Ons.List>
            </Ons.Page>
        )
    }
}

class ContactSettings extends React.Component {
    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);

        this.state = {
            contactInfo: this.props.currentUser.contactInformation
        };
    }

    /**
     * Localize a string in the context of the contact settings
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`contact.${string}`);
    }

    /**
     * Handle the change of a contact setting
     * @param {Event} e the react event object
     */
    handleInputChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.type === 'checkbox' ? target.checkbox.name : target.name;

        var contactInfoCopy = JSON.parse(JSON.stringify(this.state.contactInfo));
        contactInfoCopy[name] = value;

        this.setState({
            contactInfo: contactInfoCopy,
        });

        this.props.pushUserUpdates({contactInformation: contactInfoCopy});
    }

    render() {
        return (
            <div>
                <Ons.ListItem>
                    <div>
                        <i>{this.l("howDoYouWantToBeContacted")}</i>
                    </div>
                </Ons.ListItem>

                {this.renderContactSetting("useEmail", "email")}
                {this.renderContactSetting("useFacebook", "facebook")}
                {this.renderContactSetting("usePhone", "phone")}
                {this.renderContactSetting("useWhatsapp", "whatsapp")}
            </div>
        );
    }

    renderContactSetting(setting, contactType) {
        return (
            <div>
                <Ons.ListItem tappable={true}>
                    <label className='left' htmlFor={`${setting}-check`}>
                        <Ons.Icon icon={`md-${contactType}`} style={{marginRight: "15px"}} />
                        {this.l(setting)}
                    </label>
                    <label className='right'>
                        <Ons.Switch
                            inputId={`${setting}-check`}
                            name={setting}
                            checked={this.state.contactInfo[setting]}
                            onChange={this.handleInputChange} />
                    </label>
                </Ons.ListItem>

                {this.state.contactInfo[setting] ? this.renderForm(contactType) : null}
            </div>
        );
    }

    renderForm(contactType) {
        return (
            <Ons.ListItem>
                <div className='right'>
                    <input type="text"
                        name={contactType}
                        className="text-input text-input--material"
                        placeholder={this.l(contactType)}
                        value={this.state.contactInfo[contactType]}
                        onChange={this.handleInputChange}>
                    </input>
                </div>
            </Ons.ListItem>
        );
    }
}


module.exports = {
    Settings: Settings,
}
