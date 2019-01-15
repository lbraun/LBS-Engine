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
        this.handleChangeLayerControl = this.handleChangeLayerControl.bind(this);
        this.handleChangeDragMap = this.handleChangeDragMap.bind(this);
        this.handleChangeZoomMap = this.handleChangeZoomMap.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
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
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.type === 'checkbox' ? target.checkbox.name : target.name;

        var updatedUser = this.props.currentUser;
        updatedUser[name] = value;
        this.props.pushUserUpdate(updatedUser);
    }

    render() {
        if (this.props.authenticated) {
            var authenticationText = `${this.l("loggedInAs")} ${this.props.currentUser.name}`;
            var authenticationButton = <Ons.Button onClick={this.props.logout}>{this.l("logOut")}</Ons.Button>;
        } else {
            var authenticationText = this.l("notCurrentlyLoggedIn");
            var authenticationButton = <Ons.Button onClick={this.props.login}>{this.l("logIn")}</Ons.Button>;
        }

        return (
            <Ons.Page>
                <Ons.List>
                    <Ons.ListItem id='language-li' key='language'>
                        <div className='left'>
                            <p>{this.l("language")}</p>
                        </div>
                        <div className='right'>
                            <localeMenu.LocaleMenu
                                locale={this.props.locale}
                                handleLocaleChange={this.props.handleLocaleChange} />
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem id='name-li' key='name'>
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
                    <Ons.ListItem id='use-location-li' key='useLocation'>
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
                    <Ons.ListItem id='use-location-text-li' key='useLocationText'>
                        <div className="list-item__subtitle">
                            {this.l("useLocationText")}
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem id='share-location-li' key='shareLocation'>
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
                    <Ons.ListItem id='share-location-text-li' key='shareLocationText'>
                        <div className="list-item__subtitle">
                            {this.l("shareLocationText")}
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem key='authentication'>
                        <div className='left'>
                            <p>{authenticationText}</p>
                        </div>
                        <div className='right'>
                            {authenticationButton}
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem key='consent'>
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

const settingsComponent = <Settings />

module.exports = {
    Settings: Settings,
    settingsComponent: settingsComponent
}
