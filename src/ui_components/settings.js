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
            var authenticationText = `Logged in as ${this.props.currentUser.name}`;
            var authenticationButton = <Ons.Button onClick={this.props.logout}>Log out</Ons.Button>;
        } else {
            var authenticationText = "Not currently logged in";
            var authenticationButton = <Ons.Button onClick={this.props.login}>Log in</Ons.Button>;
        }

        return (
            <Ons.Page>
                <Ons.List>
                    <Ons.ListItem id='use-location-li' key='useLocation'>
                        <div className='left'>
                            <p>Use my location</p>
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
                            This allows the app to get your actual position from your phone. Turn this on to see your location on the map. Your location is private and will never be stored by the app.
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem id='share-location-li' key='shareLocation'>
                        <div className='left'>
                            <p>Share my location</p>
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
                            This allows you to switch your location to public or private. Only your approximate location (within 50 meters) will show on the map if set to private.
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
