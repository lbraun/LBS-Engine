'use strict';

const React = require('react');
const Ons = require('react-onsenui');

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
            var authenticationText = `${this.props.l("settings.loggedInAs")} ${this.props.currentUser.name}`;
            var authenticationButton = <Ons.Button onClick={this.props.logout}>{this.props.l("settings.logOut")}</Ons.Button>;
        } else {
            var authenticationText = this.props.l("settings.notCurrentlyLoggedIn");
            var authenticationButton = <Ons.Button onClick={this.props.login}>{this.props.l("settings.logIn")}</Ons.Button>;
        }

        return (
            <Ons.Page>
                <Ons.List>
                    <Ons.ListItem id='use-location-li' key='useLocation'>
                        <div className='left'>
                            <p>{this.props.l("settings.useLocation")}</p>
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
                            {this.props.l("settings.useLocationText")}
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem id='share-location-li' key='shareLocation'>
                        <div className='left'>
                            <p>{this.props.l("settings.shareLocation")}</p>
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
                            {this.props.l("settings.shareLocationText")}
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
