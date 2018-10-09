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
        this.handleSidebarClick = this.handleSidebarClick.bind(this);
        this.handleGiftDescriptionChange = this.handleGiftDescriptionChange.bind(this);
        this.handleContactInformationChange = this.handleContactInformationChange.bind(this);
        this.handleListItemClick = this.handleListItemClick.bind(this);
        this.calculateDistanceTo = this.calculateDistanceTo.bind(this);
        this.getGifters = this.getGifters.bind(this);
        this.renderList = this.renderList.bind(this);
        this.renderTabs = this.renderTabs.bind(this);
        this.tabNames = ["About", "Map", "List", "Settings", "My Gifts", "Help"];
        this.state = {
            isOpen: false,
            // Elements used for lifted up state of the config file
            logging: config.app.logging,
            externalData: config.app.externalData,
            gps: config.app.gps,
            layerControl: config.app.layerControl,
            draggable: config.map.draggable,
            zoomable: config.map.zoomable,
            userPosition: null,
            centerPosition: config.map.center,
            selectedGifterId: null,
            locationPublic: config.app.locationPublic,
            notificationLog: [],
            currentTab: "About"
        };


        // Update the user's position on the map whenever a new position is reported by the device
        var app = this;
        this.watchID = navigator.geolocation.watchPosition(function onSuccess(position) {
            if (app.state.gps) {
                // If the user has enabled location tracking, use it
                var lat = position.coords.latitude;
                var long = position.coords.longitude;
                var message = `Your current coordinates are ${lat}, ${long} (lat, long).`
                var coords = [lat, long];

                app.setState({
                    userPosition: coords,
                    userPositionMarkerText: message
                })

                var closestGifter = app.getGifters()[0];
                var alreadyNotified = app.state.notificationLog.includes(closestGifter.id)

                if (closestGifter.distanceToUser <= 400 && !alreadyNotified) {
                    app.setState({notificationLog: app.state.notificationLog.push(closestGifter.id)})
                    alert(`${closestGifter.name} is less than ${closestGifter.distanceToUser} m away with the following offer: ${closestGifter.giftDescription}`);
                }
            } else {
                // Otherwise set user position to null
                app.setState({
                    userPosition: null,
                    userPositionMarkerText: null
                })
            }
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
        if (!bool) {
            this.setState({
                userPosition: null,
                userPositionMarkerText: null
            });
        }
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
        this.setState({
            selectedGifterId: selectedGifterId,
            currentTab: "Map"
        });
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
        return (
            <Ons.Toolbar>
                <div className='center'>{this.state.currentTab}</div>
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

    // Handle a click on a sidebar item --> change state
    handleSidebarClick(e) {
        this.setState({currentTab: e.target.innerHTML});
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
     * Get an array of all gifters, sorted by their distance from the user
     */
    getGifters() {
        var gifters = layers.gifters.items;

        // If the user's position is available
        if (this.state.userPosition) {
            // Add a distanceToUser attribute to the array, used for list sorting
            for (let i in gifters) {
                var gifter = gifters[i];
                gifter.distanceToUser = this.calculateDistanceTo(gifter.coords)
            }

            // Sort the list by distance, ascending
            gifters.sort(function(a, b) {
                return parseInt(a.distanceToUser) - parseInt(b.distanceToUser);
            });
        }

        return gifters;
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
                                getGifters={this.getGifters}
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
            // Help page iframe
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
        var sidebarItems = [
            {"name": "About",    "icon": "md-info"},
            {"name": "Settings", "icon": "md-settings"},
            {"name": "My Gifts", "icon": "md-edit"},
            {"name": "Help",     "icon": "md-help"}
        ];

        var listItems = [];

        for (let i in sidebarItems) {
            var sidebarItem = sidebarItems[i];

            listItems.push(
                <Ons.ListItem
                    tappable={true}
                    onClick={this.handleSidebarClick}>
                        <div className='left'>
                            <Ons.Icon icon={sidebarItem["icon"]}/>
                        </div>
                        <div className='center'>
                            {sidebarItem["name"]}
                        </div>
                </Ons.ListItem>
            )
        }

        return (
            <Ons.List>
                {listItems}
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
                        index={this.tabNames.indexOf(this.state.currentTab)}
                        onPreChange={(event) =>
                            {
                                if(event.index != this.tabNames.indexOf(this.state.currentTab)) {
                                    // Handle error in onsen ui, triggering the change event of the tabbar with the change event of the carousel
                                    if(event.target !== event.currentTarget) return;
                                    this.setState({currentTab: this.tabNames[event.index]});
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
