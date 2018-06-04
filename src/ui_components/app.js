"use strict";

const React = require('react');
const Ons = require('react-onsenui');
const geolib = require('geolib');

// Custom files
// Data
const config = require('../data_components/config.json');
const layers = require('../data_components/layers.json');
// Ui
const map = require('./map.js');
const list =  require('./list.js');
const settings = require('./settings.js');
const giftForm = require('./giftForm.js');
const embededSite = require('./embededSite.js')
// Logic
const locationManager = require('../business_components/locationManager.js');
const logger = require('../business_components/logger.js');


/**
 * Main frame for the app.
 * Contains the Toolbar in the top and a sidebar to select the mode
 */
class App extends React.Component {

    constructor(props) {
        super(props);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.renderToolbar = this.renderToolbar.bind(this);
        this.handleLoggingChange = this.handleLoggingChange.bind(this);
        this.handleExternalDataChange = this.handleExternalDataChange.bind(this);
        this.handleGpsChange =  this.handleGpsChange.bind(this);
        this.handleLayerControlChange = this.handleLayerControlChange.bind(this);
        this.handleZoomMapChange = this.handleZoomMapChange.bind(this);
        this.handleDragMapChange = this.handleDragMapChange.bind(this);
        this.handleLocationPublicChange = this.handleLocationPublicChange.bind(this);
        this.handleClickAbout = this.handleClickAbout.bind(this);
        this.handleClickSettings = this.handleClickSettings.bind(this);
        this.handleClickMyGifts = this.handleClickMyGifts.bind(this);
        this.handleGiftDescriptionChange = this.handleGiftDescriptionChange.bind(this);
        this.handleContactInformationChange = this.handleContactInformationChange.bind(this);
        this.handleClickHelp = this.handleClickHelp.bind(this);
        this.handleListItemClick = this.handleListItemClick.bind(this);
        this.calculateDistanceTo = this.calculateDistanceTo.bind(this);
        this.renderList = this.renderList.bind(this);
        this.renderTabs = this.renderTabs.bind(this);
        this.state = {
            isOpen: false,
            // Elements used for lifted up state of the config file
            logging: config.app.logging,
            externalData: config.app.externalData,
            gps: config.app.gps,
            layerControl: config.app.layerControl,
            draggable: config.map.draggable,
            zoomable: config.map.zoomable,
            userPosition: config.map.center,
            centerPosition: config.map.center,
            selectedGifterId: null,
            locationPublic: config.app.locationPublic,
            index: 0
        };


        // Update the user's position on the map whenever a new position is reported by the device
        var app = this;
        this.watchID = navigator.geolocation.watchPosition(function onSuccess(position) {
            var lat = position.coords.latitude;
            var long = position.coords.longitude;
            var message = `Your current coordinates are ${lat}, ${long} (lat, long).`

            app.setState({
                userPosition: [lat, long],
                userPositionMarkerText: message
            })

            console.log(`Location updated! ${message}`);
        }, function onError(error) {
            console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
        }, {
            timeout: 30000 // Throw an error if no update is received every 30 seconds
        });
    }

    componentDidMount() {
        document.addEventListener("pause", logger.stopLoggingAndWriteFile, false);
    }

    /**
     * Handle the change of the parameter from the lower level
     * @param {Boolean} bool value of the change
     */
    handleLoggingChange(bool) {
        this.setState({logging: bool});
    }

    /**
     * Handle the change of the parameter from the lower level
     * @param {Boolean} bool value of the change
     */
    handleExternalDataChange(bool) {
        this.setState({externalData: bool});
    }

    /**
     * Handle the change of the parameter from the lower level
     * @param {Boolean} bool value of the change
     */
    handleGpsChange(bool) {
        this.setState({gps: bool});
    }

    /**
     * Handle the change of the parameter from the lower level
     * @param {Boolean} bool value of the change
     */
    handleLayerControlChange(bool) {
        this.setState({layerControl: bool});
    }

    /**
     * Handle the change of the parameter from the lower level
     * @param {Boolean} bool value of the change
     */
    handleDragMapChange(bool) {
        this.setState({draggable: bool});
    }

    /**
     * Handle the change of the parameter from the lower level
     * @param {Boolean} bool value of the change
     */
    handleZoomMapChange(bool) {
        this.setState({zoomable: bool});
    }

    /**
     * Handle the change of the parameter from the lower level
     * @param {int} selectedGifterId identifier of the gifter that was selected
     */
    handleListItemClick(selectedGifterId) {
        this.setState({selectedGifterId: selectedGifterId});
    }

    /**
     * Handle the change of the parameter from the lower level
     * @param {String} description string value after the change
     */
    handleGiftDescriptionChange(description) {
        // TODO: Add logic to publish changes when we have a way to publish gifter info
    }

    /**
     * Handle the change of the parameter from the lower level
     * @param {String} contactInformation string value after the change
     */
    handleContactInformationChange(contactInformation) {
        // TODO: Add logic to publish changes when we have a way to publish gifter info
    }

    /**
     * Handle the change of the parameter from the lower level
     * @param {Boolean} bool value of the change
     */
    handleLocationPublicChange(bool) {
        this.setState({locationPublic: bool});
        console.log("Changed location privacy");
        // TODO: Add logic to publish changes when we have a way to publish gifter info
    }


    // Toolbar on top of the app, contains name of the app and the menu button
    renderToolbar() {
        const titles = ['About', 'Map', 'List', 'Settings', 'My Gifts', 'Help'];
        return (
            <Ons.Toolbar>
                <div className='center'>{titles[this.state.index]}</div>
                <div className='right'>
                    <Ons.ToolbarButton onClick={this.show}>
                        <Ons.Icon icon='ion-navicon, material:md-menu'></Ons.Icon>
                    </Ons.ToolbarButton>
                </div>
            </Ons.Toolbar>
        )
    }

    // Hide sidebar
    hide() {
        this.setState({isOpen: false});
    }

    // Show sidebar
    show() {
        this.setState({isOpen: true});
    }

    // Handle a click on "About" --> change state
    handleClickAbout() {
        this.setState({index: 0});
    }

    // Handle a click on "Settings" --> change state
    handleClickSettings() {
        this.setState({index: 3});
    }

    // Handle a click on "My Gifts" --> change state
    handleClickMyGifts() {
        this.setState({index: 4});
    }

    // Handle a click on "Help" --> change state
    handleClickHelp() {
        this.setState({index: 5});
    }

    /**
     * Calculate the distance from the user's location to a given gifter's position
     * @param {Array} coordinates (latitude, longitude) identifying the location of the gifter
     */
    calculateDistanceTo(gifterPosition) {
        var accuracy = 50; // Restrict accuracy to 50 m to protect location privacy
        var distance = geolib.getDistance(
            {latitude: this.state.userPosition[0], longitude: this.state.userPosition[1]},
            {latitude: gifterPosition[0], longitude: gifterPosition[1]},
            accuracy
        );

        return distance;
    }

    /**
     * Render the tabs displayed in the bottom to select the mode
     * State components that are needed are handed over here from the state of this object.
     */
    renderTabs() {
        return [
            // Welcome page iframe
            {
                content: <embededSite.EmbededComponent site='about.html' key='about' name='About' />,
                tab: <Ons.Tab label='About' icon='' key='about' style={{display: 'none'}}/>
            },
            // Map element
            {
                content: <map.Map
                                logging={this.state.logging}
                                externalData={this.state.externalData}
                                gps={this.state.gps}
                                layerControl={this.state.layerControl}
                                draggable={this.state.draggable}
                                zoomable={this.state.zoomable}
                                userPosition={this.state.userPosition}
                                userPositionMarkerText={this.state.userPositionMarkerText}
                                centerPosition={this.state.centerPosition}
                                selectedGifterId={this.state.selectedGifterId}
                                calculateDistanceTo={this.calculateDistanceTo}
                                key='map' />,
                tab: <Ons.Tab label='Map' icon='md-map' key='map' />
            },
            // List element
            {
                content: <list.List
                                logging={this.state.logging}
                                externalData={this.state.externalData}
                                gps={this.state.gps}
                                layerControl={this.state.layerControl}
                                draggable={this.state.draggable}
                                zoomable={this.state.zoomable}
                                userPosition={this.state.userPosition}
                                userPositionMarkerText={this.state.userPositionMarkerText}
                                centerPosition={this.state.centerPosition}
                                selectedGifterId={this.state.selectedGifterId}
                                onListItemClick={this.handleListItemClick}
                                calculateDistanceTo={this.calculateDistanceTo}
                                key='list' />,
                tab: <Ons.Tab label='List' icon='md-view-list' key='list' />
            },
            // Settings element, with no tab displayed in the tab bar, as it is accessible via the sidebar
            {
                content: <settings.Settings
                                onLoggingChange={this.handleLoggingChange}
                                onDataChange={this.handleExternalDataChange}
                                onGpsChange={this.handleGpsChange}
                                onLayerControlChange={this.handleLayerControlChange}
                                onDragMapChange={this.handleDragMapChange}
                                onZoomMapChange={this.handleZoomMapChange}
                                onLocationPublicChange={this.handleLocationPublicChange}
                                logging={this.state.logging}
                                externalData={this.state.externalData}
                                gps={this.state.gps}
                                layerControl={this.state.layerControl}
                                draggable={this.state.draggable}
                                zoomable={this.state.zoomable}
                                key='settings' />,
                tab: <Ons.Tab label='Settings' icon='md-settings' key='settings' style={{display: 'none'}}/>
            },
            // Gift form element, with no tab displayed in the tab bar, as it is accessible via the sidebar
            {
                content: <giftForm.GiftForm
                                onGiftDescriptionChange={this.handleGiftDescriptionChange}
                                onContactInformationChange={this.handleContactInformationChange}
                                key='giftForm' />,
                tab: <Ons.Tab label='My Gifts' icon='md-edit' key='giftForm' style={{display: 'none'}}/>
            },
            // About page iframe
            {
                content: <embededSite.EmbededComponent site='help.html' key='help' name='Help' />,
                tab: <Ons.Tab label='Help' icon='md-help' key='help' style={{display: 'none'}}/>
            },
            // Ship around an error in current onsen release
            // Can be solved with an update of onsen/onsen react --> issue: https://github.com/OnsenUI/OnsenUI/issues/2307
            {
                content: <div key='placeholder' />,
                tab: null
            }
        ]
    }

    // Render the list displayed in the sidebar
    renderList() {
        return (
            <Ons.List>
                <Ons.ListItem
                    tappable={true}
                    onClick={this.handleClickAbout}>
                        <div className='left'>
                            <Ons.Icon icon='md-info'/>
                        </div>
                        <div className='center'>
                            About
                        </div>
                </Ons.ListItem>
                <Ons.ListItem
                    tappable={true}
                    onClick={this.handleClickSettings}>
                        <div className='left'>
                            <Ons.Icon icon='md-settings'/>
                        </div>
                        <div className='center'>
                            Settings
                        </div>
                </Ons.ListItem>
                <Ons.ListItem
                    tappable={true}
                    onClick={this.handleClickMyGifts}>
                        <div className='left'>
                            <Ons.Icon icon='md-edit'/>
                        </div>
                        <div className='center'>
                            My Gifts
                        </div>
                </Ons.ListItem>
                <Ons.ListItem
                    tappable={true}
                    onClick={this.handleClickHelp}>
                        <div className='left'>
                            <Ons.Icon icon='md-help'/>
                        </div>
                        <div className='center'>
                            Help
                        </div>
                </Ons.ListItem>
            </Ons.List>
        )
    }

    // Render sidebars and toolbar
    render() {

        return (
            <Ons.Splitter>
                <Ons.SplitterSide
                    side='right'
                    width={'50%'}
                    style={{boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'}}
                    swipeable={false}
                    collapse={true}
                    isOpen={this.state.isOpen}
                    onClose={this.hide}
                    onOpen={this.show}>
                    <Ons.Page>
                        {this.renderList()}
                    </Ons.Page>
                </Ons.SplitterSide>
                <Ons.Page renderToolbar={this.renderToolbar}>
                    <Ons.Tabbar
                        swipeable={false}
                        position='bottom'
                        index={this.state.index}
                        onPreChange={(event) =>
                            {
                                if(event.index != this.state.index) {
                                    // Handle error in onsen ui, triggering the change event of the tabbar with the change event of the carousel
                                    if(event.target !== event.currentTarget) return;
                                    this.setState({index: event.index});
                                }

                                // Check if logging is enabled and create a log if so
                                if(this.state.logging) {
                                    var modeName;
                                    switch(event.index) {
                                        case 0: modeName = 'About'
                                            break;
                                        case 1: modeName = 'Map'
                                            break;
                                        case 2: modeName = 'List'
                                            break;
                                        case 3: modeName = 'Settings'
                                            break;
                                        case 4: modeName = 'MyGifts';
                                            break;
                                        case 5: modeName = 'Help';
                                    }

                                    var entry;
                                    // Get the current position for the log
                                    locationManager.getLocation().then(function success(position) {
                                        entry = [position.latitude, position.longitude, modeName, 'Changed View'];
                                        // Log the data
                                        logger.logEntry(entry);
                                    }, function error(err) {
                                        // If there was an error getting the position, log a '-' for lat/lng
                                        entry = ['-', '-', modeName, 'Changed View'];
                                        // Log the data
                                        logger.logEntry(entry);
                                    })
                                }
                            }}
                        renderTabs={this.renderTabs} />
                </Ons.Page>
            </Ons.Splitter>
        )
    }
}

module.exports = {
    App: App
};
