"use strict";

const React = require('react');
const Ons = require('react-onsenui');
const geolib = require('geolib');
const Auth0Cordova =  require('@auth0/cordova');

// Custom files
// Data
const config = require('../data_components/config.json');

// Ui
const map = require('./map.js');
const list =  require('./list.js');
const settings = require('./settings.js');
const offerForm = require('./offerForm.js');
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
        this.handleLayerControlChange = this.handleLayerControlChange.bind(this);
        this.handleZoomMapChange = this.handleZoomMapChange.bind(this);
        this.handleDragMapChange = this.handleDragMapChange.bind(this);
        this.handleUseLocationSettingChange =  this.handleUseLocationSettingChange.bind(this);
        this.pushUserUpdate = this.pushUserUpdate.bind(this);
        this.handleSidebarClick = this.handleSidebarClick.bind(this);
        this.handleListItemClick = this.handleListItemClick.bind(this);
        this.updateDistancesToUsers = this.updateDistancesToUsers.bind(this);
        this.calculateDistanceTo = this.calculateDistanceTo.bind(this);
        this.calculateDistanceBetween = this.calculateDistanceBetween.bind(this);
        this.renderList = this.renderList.bind(this);
        this.renderTabs = this.renderTabs.bind(this);
        this.tabNames = ["About", "Map", "List", "Settings", "My Offers", "Help"];
        this.state = {
            isOpen: false,
            // Elements used for lifted up state of the config file
            logging: config.app.logging,
            externalData: config.app.externalData,
            layerControl: config.app.layerControl,
            draggable: config.map.draggable,
            zoomable: config.map.zoomable,
            errorLoadingUsers: null,
            errorSyncingUser: null,
            usersAreLoaded: false,
            currentUserIsLoaded: false,
            users: [],
            centerPosition: config.map.center,
            selectedUserId: null,
            notificationLog: [],
            currentTab: "About",
            currentUserId: "5c23c5b2c3972800172d3e91",
            currentUser: {
                useLocation: config.app.useLocation,
                shareLocation: config.app.shareLocation,
                offerDescription: "",
                contactInformation: "",
                coords: null,
            },
        };

        // Fetch all user data from database
        fetch("https://geofreebie-backend.herokuapp.com/api/users")
            .then(res => res.json())
            .then(
                (result) => {
                    // Store current user and remove it from the list
                    for (var i = result.length - 1; i >= 0; --i) {
                        if (result[i]._id == this.state.currentUserId) {
                            var currentUser = result[i];
                            result.splice(i, 1);

                            this.setState({
                                currentUser: currentUser,
                                currentUserIsLoaded: true,
                                users: result || [],
                                usersAreLoaded: true,
                            });

                            break;
                        }
                    }
                },
                (error) => {
                    console.log("There was an error loading the users!");
                    console.log(error);
                    this.setState({
                        usersAreLoaded: true,
                        errorLoadingUsers: error
                    });
                }
            )


        // Update the user's position on the map whenever a new position is reported by the device
        var app = this;
        this.watchID = navigator.geolocation.watchPosition(function onSuccess(position) {
            if (app.state.currentUser.useLocation) {
                // If the user has enabled location tracking, use it
                var coords = [position.coords.latitude, position.coords.longitude];
                var users = app.updateDistancesToUsers(coords, app.state.users);

                app.setState({
                    users: users
                })

                var updatedUser = app.state.currentUser;
                updatedUser.coords = coords;
                app.pushUserUpdate(updatedUser);


                var closestUser = app.state.users[0];
                if (closestUser) {
                    // Check if there is a user nearby about whom
                    // the current user has not yet been notified
                    var alreadyNotified = app.state.notificationLog.includes(closestUser.id)
                    if (closestUser.distanceToUser <= 400 && !alreadyNotified) {
                        app.setState({notificationLog: app.state.notificationLog.concat([closestUser.id])})
                        alert(`${closestUser.name} is less than ${closestUser.distanceToUser} m away with the following offer: ${closestUser.offerDescription}`);
                    }
                }
            } else {
                // Otherwise set user position to null
                var updatedUser = app.state.currentUser;
                updatedUser.coords = null;
                app.pushUserUpdate(updatedUser);
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
     * Update the calculated distance from current user to each other user
     * @param {Array} coordinate tuple representing the current user's position
     * @param {Array} array of users
     */
    updateDistancesToUsers(userPosition, users) {
        // If the user's position is available
        if (userPosition) {
            // Add a distanceToUser attribute to the array, used for list sorting
            for (let i in users) {
                var user = users[i];
                user.distanceToUser = this.calculateDistanceBetween(userPosition, user.coords)
            }

            // Sort the list by distance, ascending
            users.sort(function(a, b) {
                return parseInt(a.distanceToUser) - parseInt(b.distanceToUser);
            });
        }
        return users;
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
    handleUseLocationSettingChange(bool) {
        if (!bool) {
            this.setState({
                userPosition: null,
            });
        }
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
     * @param {int} selectedUserId identifier of the user that was selected
     */
    handleListItemClick(selectedUserId) {
        this.setState({
            selectedUserId: selectedUserId,
            currentTab: "Map"
        });
    }

    /**
     * Push the provided user to the database server
     * @param {User} updatedUser object, representing the user in its most up-to-date form
     */
    pushUserUpdate(updatedUser) {
        this.setState({
            currentUser: updatedUser,
            currentUserIsLoaded: false,
        });

        // Make the call to the update API
        var url = "https://geofreebie-backend.herokuapp.com/api/users/" + this.state.currentUserId;
        fetch(url, {
            method: "PUT",
            body: JSON.stringify(updatedUser),
            headers: {'Content-Type': 'application/json'},
        })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        currentUserIsLoaded: true,
                    });
                },
                (error) => {
                    console.log("There was an error updating the user!");
                    console.log(error);
                    this.setState({
                        errorSyncingUser: error
                    });
                }
            )
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
     * Calculate the distance from the user's location to a given position
     * @param {Array} coordinates (latitude, longitude) identifying the position
     */
    calculateDistanceTo(position) {
        return this.calculateDistanceBetween(this.state.currentUser.coords, position);
    }

    /**
     * Calculate the distance between two positions
     * @param {Array} coordinates (latitude, longitude) identifying the first position
     * @param {Array} coordinates (latitude, longitude) identifying the second position
     */
    calculateDistanceBetween(position1, position2) {
        var accuracy = 50; // Restrict accuracy to 50 m to protect location privacy
        return geolib.getDistance(
            {latitude: position1[0], longitude: position1[1]},
            {latitude: position2[0], longitude: position2[1]},
            accuracy
        );
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
                    layerControl={this.state.layerControl}
                    draggable={this.state.draggable}
                    zoomable={this.state.zoomable}
                    currentUser={this.state.currentUser}
                    centerPosition={this.state.centerPosition}
                    selectedUserId={this.state.selectedUserId}
                    calculateDistanceTo={this.calculateDistanceTo}
                    users={this.state.users}
                    key='map' />,
                tab: <Ons.Tab label='Map' icon='md-map' key='map' />
            },
            // List element
            {
                content: <list.List
                    logging={this.state.logging}
                    externalData={this.state.externalData}
                    layerControl={this.state.layerControl}
                    draggable={this.state.draggable}
                    zoomable={this.state.zoomable}
                    currentUser={this.state.currentUser}
                    centerPosition={this.state.centerPosition}
                    selectedUserId={this.state.selectedUserId}
                    onListItemClick={this.handleListItemClick}
                    usersAreLoaded={this.state.usersAreLoaded}
                    errorLoadingUsers={this.state.errorLoadingUsers}
                    users={this.state.users}
                    key='list' />,
                tab: <Ons.Tab label='List' icon='md-view-list' key='list' />
            },
            // Settings element, with no tab displayed in the tab bar, as it is accessible via the sidebar
            {
                content: <settings.Settings
                    onLoggingChange={this.handleLoggingChange}
                    onDataChange={this.handleExternalDataChange}
                    onLayerControlChange={this.handleLayerControlChange}
                    onDragMapChange={this.handleDragMapChange}
                    onZoomMapChange={this.handleZoomMapChange}
                    onUseLocationSettingChange={this.handleUseLocationSettingChange}
                    pushUserUpdate={this.pushUserUpdate}
                    currentUser={this.state.currentUser}
                    logging={this.state.logging}
                    externalData={this.state.externalData}
                    layerControl={this.state.layerControl}
                    draggable={this.state.draggable}
                    zoomable={this.state.zoomable}
                    key='settings' />,
                tab: <Ons.Tab label='Settings' icon='md-settings' key='settings' style={{display: 'none'}}/>
            },
            // Offer form element, with no tab displayed in the tab bar, as it is accessible via the sidebar
            {
                content: <offerForm.offerForm
                    pushUserUpdate={this.pushUserUpdate}
                    currentUserIsLoaded={this.state.currentUserIsLoaded}
                    currentUser={this.state.currentUser}
                    key='offerForm' />,
                tab: <Ons.Tab label='My Offers' icon='md-edit' key='offerForm' style={{display: 'none'}}/>
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
            {"id":1, "name": "My Offers", "icon": "md-edit"},
            {"id":2, "name": "Settings", "icon": "md-settings"},
            {"id":3, "name": "Help",     "icon": "md-help"},
            {"id":4, "name": "About",    "icon": "md-info"}
        ];

        var listItems = [];

        for (let i in sidebarItems) {
            var sidebarItem = sidebarItems[i];

            listItems.push(
                <Ons.ListItem
                    id={`sidebar-item-${sidebarItem["id"]}`}
                    key={sidebarItem["id"]}
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
