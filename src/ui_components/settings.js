'use strict';

const React = require('react');
const Ons = require('react-onsenui');

// Custom files
// Logic
const logger = require('../business_components/logger.js');
const locationManager = require('../business_components/locationManager.js');


/**
 * Settings for the app. Modifies the state of the settings
 */
class Settings extends React.Component {

    constructor(props) {
        super(props);
        this.handleChangeData = this.handleChangeData.bind(this);
        this.handleChangeLogging = this.handleChangeLogging.bind(this);
        this.handleChangeLayerControl = this.handleChangeLayerControl.bind(this);
        this.handleChangeDragMap = this.handleChangeDragMap.bind(this);
        this.handleChangeZoomMap = this.handleChangeZoomMap.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.createLog = this.createLog.bind(this);
    }

    createLog(mode, change) {
        var action;
        if(this.props.logging) {
            // Define the log
            if(change) {
                action =  'Activate ' + mode;
            }
            else action = 'Deactivate ' + mode;
            var entry;
            // Get the current position for the log
            locationManager.getLocation().then(function success(position) {
                entry = [position.latitude, position.longitude, 'Settings', action];
                // Log the data
                // logger.logEntry(entry);
            }, function error(err) {
                // If there was an error getting the position, log a '-' for lat/lng
                entry = ['-', '-', 'Settings', action];
                // Log the data
                // logger.logEntry(entry);
            })
        }
    }

    // Handle toggle for logging
    handleChangeLogging(e) {
        this.props.onLoggingChange(e.target.checked);
        var action;
        // Define the log
        if(e.target.checked) {
            action =  'Activate logging';
        }
        else action = 'Deactivate logging';
        var entry;
        // Get the current position for the log
        locationManager.getLocation().then(function success(position) {
            entry = [position.latitude, position.longitude, 'Settings', action];
            // Log the data
            // logger.logEntry(entry);
        }, function error(err) {
            // If there was an error getting the position, log a '-' for lat/lng
            entry = ['-', '-', 'Settings', action];
            // Log the data
            // logger.logEntry(entry);
        })
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

        switch(name) {
            case 'useLocation':
                this.props.onUseLocationSettingChange(value);
        }
    }

    render() {
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
