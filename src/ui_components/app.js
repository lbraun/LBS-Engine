"use strict";

// Load third-party modules
const React = require('react');
const Ons = require('react-onsenui');
const geolib = require('geolib');
const Auth0 = require('auth0-js');
const Auth0Cordova =  require('@auth0/cordova');

// Load custom files
// Data
const config = require('../data_components/config.json');
const localizations = require('../data_components/localizations.json');

// UI
const signInPage = require('./signInPage.js');
const dashboard = require('./dashboard.js');
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
 * Contains the toolbar in the top and a sidebar to select the mode
 */
class App extends React.Component {
    constructor(props) {
        super(props);
        this.l = this.l.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.renderToolbar = this.renderToolbar.bind(this);
        this.handleLoggingChange = this.handleLoggingChange.bind(this);
        this.handleExternalDataChange = this.handleExternalDataChange.bind(this);
        this.handleLayerControlChange = this.handleLayerControlChange.bind(this);
        this.handleZoomMapChange = this.handleZoomMapChange.bind(this);
        this.handleDragMapChange = this.handleDragMapChange.bind(this);
        this.fetchAndLoadAllUsers = this.fetchAndLoadAllUsers.bind(this);
        this.pushUserUpdate = this.pushUserUpdate.bind(this);
        this.handleSidebarClick = this.handleSidebarClick.bind(this);
        this.handleListItemClick = this.handleListItemClick.bind(this);
        this.updateDistancesToUsers = this.updateDistancesToUsers.bind(this);
        this.calculateDistanceTo = this.calculateDistanceTo.bind(this);
        this.calculateDistanceBetween = this.calculateDistanceBetween.bind(this);
        this.renderSidebarList = this.renderSidebarList.bind(this);
        this.renderTabs = this.renderTabs.bind(this);
        this.tabs = ["dashboard", "map", "list", "settings", "offers", "help"];
        this.state = {
            isOpen: false,
            logging: config.app.logging,
            externalData: config.app.externalData,
            layerControl: config.app.layerControl,
            locale: config.app.defaultLocale,
            draggable: config.map.draggable,
            zoomable: config.map.zoomable,
            centerPosition: config.map.center,
            errorLoadingUsers: null,
            errorSyncingUser: null,
            usersAreLoaded: false,
            currentUserIsLoaded: false,
            users: [],
            selectedUserId: null,
            notificationLog: [],
            currentTab: "dashboard",
            currentUserId: null,
            currentUser: null,
            authenticated: false,
            accessToken: false,
        };

        // Auth0
        this.auth0 = new Auth0.Authentication({
            domain: 'geofreebie.eu.auth0.com',
            clientID: 'ImD2ybMSYs45zFRZqiLH9aDamJm5cbXv'
        });
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);

        // Update the user's position on the map whenever a new position is reported by the device
        var app = this;
        this.positionWatcher = navigator.geolocation.watchPosition(function onSuccess(position) {
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
                    var alreadyNotified = app.state.notificationLog.includes(closestUser._id)
                    if (closestUser.distanceToUser <= 400 && !alreadyNotified) {
                        var log = app.state.notificationLog.concat([closestUser._id]);
                        app.setState({
                            notificationLog: log,
                        });
                        alert(closestUser.name
                            + " " + this.l("alert.isLessThan")
                            + " " + closestUser.distanceToUser
                            + " " + this.l("alert.metersAwayWith")
                            + " " + closestUser.offerDescription);
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

    /**
     * Localize a string
     * @param {string} string to be localized
     */
    l(string, locale = this.state.locale) {
        var localization = localizations[locale][string];

        if (!localization) {
            console.log(`Error: localization "${string}" not found for locale "${locale}"`)
            return "";
        }

        return localization;
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
            currentTab: "map"
        });
    }

    /**
     * Fetch or create user in backend base on info from Auth0
     * @param {Object} userInfo object, returned by auth0.loadUserInfo
     */
    fetchOrCreateAuth0User(userInfo) {
        // Make the call to the "find or create" API endpoint
        var url = "https://geofreebie-backend.herokuapp.com/api/users/";
        fetch(url, {
            method: "POST",
            body: JSON.stringify(userInfo),
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${this.auth0client.getIdToken()}`,
            },
        })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        currentUserId: result._id
                    });

                    this.fetchAndLoadAllUsers();
                },
                (error) => {
                    console.log("There was an error creating or loading the user!");
                    console.log(error);
                    this.setState({
                        errorSyncingUser: error
                    });
                }
            )
    }

    /**
     * Fetches all user data from the database server, including current user's data
     */
    fetchAndLoadAllUsers() {
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
                                locale: currentUser.locale || this.state.locale,
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
        var tabName = this.l(`tabs.${this.state.currentTab}`);

        return (
            <Ons.Toolbar>
                <div className='left'>
                    <Ons.ToolbarButton onClick={this.show}>
                        <Ons.Icon icon='ion-navicon, material:md-menu'></Ons.Icon>
                    </Ons.ToolbarButton>
                </div>
                <div className='center'>{tabName}</div>
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
    handleSidebarClick(tab, e) {
        this.setState({currentTab: tab});
        this.hide();
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
            // Dashboard element
            {
                content: <dashboard.Dashboard
                    l={this.l}
                    login={this.login}
                    authenticated={this.state.authenticated}
                    currentUser={this.state.currentUser}
                    key='dashboard' />,
                tab: <Ons.Tab
                    label={this.l('tabs.dashboard')}
                    icon='md-info'
                    key='dashboard'
                    style={{display: 'none'}} />
            },
            // Map element
            {
                content: <map.Map
                    l={this.l}
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
                tab: <Ons.Tab
                    label={this.l('tabs.map')}
                    icon='md-map'
                    key='map' />
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
                tab: <Ons.Tab
                    label={this.l('tabs.list')}
                    icon='md-view-list'
                    key='list' />
            },
            // Settings element, with no tab displayed in the tab bar, as it is accessible via the sidebar
            {
                content: <settings.Settings
                    onLoggingChange={this.handleLoggingChange}
                    onDataChange={this.handleExternalDataChange}
                    onLayerControlChange={this.handleLayerControlChange}
                    onDragMapChange={this.handleDragMapChange}
                    onZoomMapChange={this.handleZoomMapChange}
                    pushUserUpdate={this.pushUserUpdate}
                    currentUser={this.state.currentUser}
                    authenticated={this.state.authenticated}
                    logout={this.logout}
                    login={this.login}
                    logging={this.state.logging}
                    externalData={this.state.externalData}
                    layerControl={this.state.layerControl}
                    draggable={this.state.draggable}
                    zoomable={this.state.zoomable}
                    key='settings' />,
                tab: <Ons.Tab
                    label={this.l('tabs.settings')}
                    icon='md-settings'
                    key='settings'
                    style={{display: 'none'}} />
            },
            // Offer form element, with no tab displayed in the tab bar, as it is accessible via the sidebar
            {
                content: <offerForm.offerForm
                    pushUserUpdate={this.pushUserUpdate}
                    currentUserIsLoaded={this.state.currentUserIsLoaded}
                    currentUser={this.state.currentUser}
                    key='offerForm' />,
                tab: <Ons.Tab
                    label={this.l('tabs.offers')}
                    icon='md-edit'
                    key='offerForm'
                    style={{display: 'none'}} />
            },
            // Help page iframe
            {
                content: <embededSite.EmbededComponent site='help.html' key='help' name='Help' />,
                tab: <Ons.Tab
                    label={this.l('tabs.help')}
                    icon='md-help'
                    key='help'
                    style={{display: 'none'}} />
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
    renderSidebarList() {
        var sidebarItems = [
            {key: "offers",    icon: "md-edit"},
            {key: "settings",  icon: "md-settings"},
            {key: "help",      icon: "md-help"},
            {key: "dashboard", icon: "md-info"},

        ];

        var listItems = [
            <Ons.ListItem
                key='user'
                tappable={false}>
                    <div className='list-item__title'>
                        <strong>{this.state.currentUser.name}</strong>
                    </div>
                    <div className='list-item__subtitle'>
                        {this.state.currentUser.contactInformation}
                    </div>
            </Ons.ListItem>
        ];

        for (let i in sidebarItems) {
            var sidebarItem = sidebarItems[i];

            listItems.push(
                <Ons.ListItem
                    key={sidebarItem.key}
                    tappable={true}
                    onClick={this.handleSidebarClick.bind(this, sidebarItem.key)}>
                        <div className='left'>
                            <Ons.Icon icon={sidebarItem.icon}/>
                        </div>
                        <div className='center'>
                            {this.l(`tabs.${sidebarItem.key}`)}
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

    loadUserInfo(callback) {
        this.auth0.userInfo(this.state.accessToken, callback);
    };

    /**
     * Start the auth0 login process (launches via an in-app browser)
     */
    login(e) {
        var app = this;
        var target = e.target;
        target.disabled = true;

        var client = new Auth0Cordova({
            domain: 'geofreebie.eu.auth0.com',
            clientId: 'ImD2ybMSYs45zFRZqiLH9aDamJm5cbXv',
            packageIdentifier: 'com.lbraun.geofreebie'
        });

        var options = {
            scope: 'openid profile',
            audience: 'https://geofreebie.eu.auth0.com/userinfo'
        };

        client.authorize(options, function(err, authResult) {
            if (err) {
                console.log(err);
                return (target.disabled = false);
            }

            localStorage.setItem('access_token', authResult.accessToken);
            target.disabled = false;
            app.resumeApp();
        });
    };

    logout(e) {
        localStorage.removeItem('access_token');
        this.resumeApp();
    };

    resumeApp() {
        var accessToken = localStorage.getItem('access_token');

        if (accessToken) {
            this.setState({
                authenticated: true,
                accessToken: accessToken,
                currentTab: "dashboard",
            })

            var app = this;

            this.loadUserInfo(function(err, userInfo) {
                if (err) {
                    console.log('Error: ' + err.message);
                } else {
                    app.fetchOrCreateAuth0User(userInfo);
                }
            });
        } else {
            // User logged out, so clear out stored user data
            this.setState({
                authenticated: false,
                usersAreLoaded: false,
                currentUserIsLoaded: false,
                accessToken: null,
                currentUserId: null,
                currentUser: null,
                users: null,
            })
        }
    };

    // Render sidebars and toolbar
    render() {
        if (this.state.authenticated && this.state.currentUser) {
            return (
                <Ons.Splitter>
                    <Ons.SplitterSide
                        side='left'
                        width={'75%'}
                        style={{boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'}}
                        swipeable={false}
                        collapse={true}
                        isOpen={this.state.isOpen}
                        onClose={this.hide}
                        onOpen={this.show}>
                        <Ons.Page>
                            {this.renderSidebarList()}
                        </Ons.Page>
                    </Ons.SplitterSide>

                    <Ons.Page renderToolbar={this.renderToolbar}>
                        <Ons.Tabbar
                            swipeable={false}
                            position='bottom'
                            index={this.tabs.indexOf(this.state.currentTab)}
                            onPreChange={(event) =>
                                {
                                    if(event.index != this.tabs.indexOf(this.state.currentTab)) {
                                        // Handle error in onsen ui, triggering the change event of the tabbar with the change event of the carousel
                                        if(event.target !== event.currentTarget) return;
                                        this.setState({currentTab: this.tabs[event.index]});
                                    }
                                }}
                            renderTabs={this.renderTabs} />
                    </Ons.Page>
                </Ons.Splitter>
            );
        } else {
            return (<signInPage.SignInPage
                login={this.login}
                authenticated={this.state.authenticated} />);
        }
    }
}

module.exports = {
    App: App
};
