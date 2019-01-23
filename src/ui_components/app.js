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
const defaultPicture = 'img/logo.png';

// UI
const consentForm = require('./consentForm.js');
const contactLinks = require('./contactLinks.js');
const dashboard = require('./dashboard.js');
const embededSite = require('./embededSite.js')
const list = require('./list.js');
const map = require('./map.js');
const offerForm = require('./offerForm.js');
const settings = require('./settings.js');
const signInPage = require('./signInPage.js');

// Logic
const locationManager = require('../business_components/locationManager.js');
const logger = require('../business_components/logger.js');
const l10n = require('../business_components/localization.js');



/**
 * Main frame for the app.
 * Contains the toolbar in the top and a sidebar to select the mode
 */
class App extends React.Component {
    constructor(props) {
        super(props);
        this.calculateDistanceBetween = this.calculateDistanceBetween.bind(this);
        this.calculateDistanceTo = this.calculateDistanceTo.bind(this);
        this.completeOffer = this.completeOffer.bind(this);
        this.handleDragMapChange = this.handleDragMapChange.bind(this);
        this.handleExternalDataChange = this.handleExternalDataChange.bind(this);
        this.handleLayerControlChange = this.handleLayerControlChange.bind(this);
        this.handleListItemClick = this.handleListItemClick.bind(this);
        this.handleLocaleChange = this.handleLocaleChange.bind(this);
        this.handleLoggingChange = this.handleLoggingChange.bind(this);
        this.handleSidebarClick = this.handleSidebarClick.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleZoomMapChange = this.handleZoomMapChange.bind(this);
        this.hideSidebar = this.hideSidebar.bind(this);
        this.initiateReview = this.initiateReview.bind(this);
        this.l = this.l.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.pushReviewUpdates = this.pushReviewUpdates.bind(this);
        this.pushUserUpdates = this.pushUserUpdates.bind(this);
        this.refresh = this.refresh.bind(this);
        this.refreshUsers = this.refreshUsers.bind(this);
        this.renderSidebarList = this.renderSidebarList.bind(this);
        this.renderTabs = this.renderTabs.bind(this);
        this.renderToolbar = this.renderToolbar.bind(this);
        this.revokeConsent = this.revokeConsent.bind(this);
        this.showSidebar = this.showSidebar.bind(this);
        this.updateDistancesToUsers = this.updateDistancesToUsers.bind(this);
        this.tabs = ["dashboard", "map", "list", "settings", "offers", "help"];
        this.state = {
            sidebarIsOpen: false,
            sidebarIsSwipeable: true,
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
            reviewsAreLoaded: false,
            currentUserIsLoaded: false,
            users: [],
            pendingReviews: [],
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

        // Backend
        this.apiUrl = config.app.apiUrl;

        // Update the user's position on the map whenever a new position is reported by the device
        var app = this;
        this.positionWatcher = navigator.geolocation.watchPosition(function onSuccess(position) {
            // Don't try to watch position until user is loaded
            if (!app.state.currentUser) return;

            // If the user has enabled location tracking, use it
            if (app.state.currentUser.useLocation) {
                var coords = [position.coords.latitude, position.coords.longitude];

                if (!app.withinGeofence(coords)) {
                    app.setState({outOfGeofence: true});

                    var currentOffer = this.state.currentUser.offer;
                    var updatedOffer = JSON.parse(JSON.stringify(currentOffer));
                    updatedOffer.available = false;

                    app.pushUserUpdates({offer: updatedOffer});
                } else {
                    app.setState({outOfGeofence: false});
                }

                var users = app.updateDistancesToUsers(coords, app.state.users);

                app.setState({users: users})
                app.pushUserUpdates({coords: coords});

                var closestUser = app.state.users[0];
                if (closestUser) {
                    // Check if there is a user nearby about whom
                    // the current user has not yet been notified
                    var alreadyNotified = app.state.notificationLog.includes(closestUser._id)
                    if (closestUser.distanceToUser <= 400 && !alreadyNotified) {
                        var log = app.state.notificationLog.concat([closestUser._id]);
                        app.setState({notificationLog: log});

                        var offerTitle = closestUser.offer ? closestUser.offer.title : app.l("offerForm.noOffer");
                        alert(closestUser.name
                            + " " + app.l("alert.isLessThan")
                            + " " + closestUser.distanceToUser
                            + " " + app.l("alert.metersAwayWith")
                            + " " + offerTitle);
                    }
                }
            } else {
                // Otherwise set user position to null
                if (app.state.currentUserId) {
                    app.pushUserUpdates({coords: []});
                }
            }
        }, function onError(error) {
            console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
        }, {
            timeout: 30000 // Throw an error if no update is received every 30 seconds
        });

        // TODO: implement this for real!
        this.state.online = false;

        // Use devMode to disable sign-in for faster development
        this.devMode = "dashboard";

        if (this.devMode && !this.state.online) {
            this.apiUrl = "http://localhost:8080/api/";
        }
    }

    /**
     * Localize a string
     * @param {string} string to be localized
     */
    l(string, locale = this.state.locale) {
        var localization = localizations[locale][string];

        if (!localization || localization == "TODO") {
            if (!this.devMode) {
                console.log(`Error: localization "${string}" not found for locale "${locale}"`);
            }

            if (locale != "en") {
                // Fall back to English if the localization isn't found for the given locale
                return this.l(string, "en");
            } else {
                // Fall back to the string itself if all else fails
                return string;
            }
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
        if (userPosition.length) {
            // Add a distanceToUser attribute to the array, used for list sorting
            for (let i in users) {
                var user = users[i];
                user.distanceToUser = user.coords.length ?
                    this.calculateDistanceBetween(userPosition, user.coords) : null;
            }

            // Sort the list by distance, ascending
            users.sort(function(a, b) {
                var distanceA = a.distanceToUser || 9999999;
                var distanceB = b.distanceToUser || 9999999;
                return (distanceA > distanceB) ? 1 : -1;
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
        this.setState({selectedUserId: selectedUserId});
        this.handleTabChange("map");
    }

    /**
     * Handle the change of the parameter from the lower level
     * @param {String} tab the tab to display
     */
    handleTabChange(tab) {
        this.setState({
            currentTab: tab,
            sidebarIsSwipeable: tab != "map",
            sidebarIsOpen: false,
        });
    }

    /**
     * Fetch or create user in backend base on info from Auth0
     * @param {Object} userInfo object, returned by auth0.loadUserInfo
     */
    fetchOrCreateAuth0User(userInfo) {
        // Make the call to the "find or create user" API endpoint
        var url = this.apiUrl + "users/";
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

                    // Refresh user's data now that we have the user's id
                    this.refresh();
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
     * Refreshes all data that could have changed on the server
     */
    refresh() {
        this.setState({
            usersAreLoaded: false,
            reviewsAreLoaded: false,
        })
        this.refreshUsers();
        this.refreshReviews();
    }

    /**
     * Fetches all user data from the database server, including current user's data
     */
    refreshUsers() {
        fetch(this.apiUrl + "users")
            .then(res => res.json())
            .then(
                (users) => {
                    // Store current user and remove it from the list
                    for (var i = users.length - 1; i >= 0; --i) {
                        if (users[i]._id == this.state.currentUserId) {
                            var currentUser = users[i];
                            users.splice(i, 1);

                            // Set defaults from config file if user just signed up
                            if (currentUser.newlyCreated) {
                                this.pushUserUpdates({
                                    shareLocation: config.userDefaults.shareLocation,
                                    useLocation: config.userDefaults.useLocation,
                                    contactInformation: config.userDefaults.contactInformation,
                                    locale: this.state.locale,
                                    newlyCreated: false,
                                });
                            }

                            users = this.updateDistancesToUsers(currentUser.coords, users);

                            this.setState({
                                currentUser: currentUser,
                                locale: currentUser.locale || this.state.locale,
                                currentUserIsLoaded: true,
                                users: users || [],
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
     * Fetches all review objects for the current user from the database server
     */
    refreshReviews() {
        if (!this.state.currentUserId) return;

        fetch(this.apiUrl + "pendingReviews?_userId=" + this.state.currentUserId)
            .then(res => res.json())
            .then(
                (pendingReviews) => {
                    this.setState({
                        pendingReviews: pendingReviews,
                        reviewsAreLoaded: true,
                    });
                },
                (error) => {
                    console.log("There was an error loading the pending reviews!");
                    console.log(error);
                    this.setState({
                        reviewsAreLoaded: true,
                    });
                }
            )
    }

    /**
     * Determines if the given coordinates fall within the app's bounds
     * @param {Array} coordinates (latitude, longitude) to be tested
     */
    withinGeofence(coordinates) {
        var lat = coordinates[0];
        var lon = coordinates[1];

        // Southwest corner of Münster
        var lat1 = 51.85868336894736;
        var lon1 = 7.483062744140626;

        // Northeast corner of Münster
        var lat2 = 52.05586831074774;
        var lon2 = 7.768707275390625;

        return (lat1 < lat && lat < lat2) && (lon1 < lon && lon < lon2);
    }

    /**
     * Complete the current user's offer by initiating a questionnaire
     */
    completeOffer() {
        this.initiateReview();

        var offersCompleted = this.state.currentUser.offersCompleted || 0;

        this.pushUserUpdates({
            offer: null,
            offersCompleted: offersCompleted + 1,
        })
    }

    /**
     * Initiate a review for a recently completed offer
     */
    initiateReview(giverReview = null) {
        if (giverReview) {
            var body = {
                _userId: giverReview._otherUserId,
                _otherUserId: this.state.currentUserId,
                userType: "recipient",
                offerTitle: giverReview.offerTitle,
            };
        } else  {
            var body = {
                _userId: this.state.currentUserId,
                userType: "giver",
                offerTitle: this.state.currentUser.offer.title,
            };
        }

        // Make the call to the "create review" API endpoint
        var url = this.apiUrl + "pendingReviews";

        fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${this.auth0client.getIdToken()}`,
            },
        })
            .then(res => res.json())
            .then(
                (result) => {
                    this.refreshReviews();
                },
                (error) => {
                    console.log("There was an error creating the review!");
                    console.log(error);
                }
            );
    }

    /**
     * Push the provided updates to the user to the database server
     * @param {Object} attributes object, representing attributes to be updated
     */
    pushUserUpdates(attributes) {
        if (!this.state.currentUserId) {
            console.log("ERROR: Cannot push user updates without an id");
            return (this.state.currentUserId.something);
        }

        var currentUser = this.state.currentUser || {};
        var updatedUser = JSON.parse(JSON.stringify(currentUser));
        Object.assign(updatedUser, attributes);

        this.setState({
            currentUser: updatedUser,
            currentUserIsLoaded: false,
        });

        // Make the call to the "update user" API endpoint
        var url = this.apiUrl + "users/" + this.state.currentUserId;
        fetch(url, {
            method: "PUT",
            body: JSON.stringify(attributes),
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
            );
    }

    /**
     * Push the provided updates to the review to the database server
     * @param {Object} attributes object, representing attributes to be updated
     */
    pushReviewUpdates(attributes) {
        if (!attributes._id) {
            console.log("ERROR: Cannot push user updates without an id");
            return;
        }

        // Make the call to the "update review" API endpoint
        var url = this.apiUrl + "pendingReviews/" + attributes._id;
        fetch(url, {
            method: "PUT",
            body: JSON.stringify(attributes),
            headers: {'Content-Type': 'application/json'},
        })
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        reviewsAreLoaded: false,
                    })
                    this.refreshReviews();
                },
                (error) => {
                    console.log("There was an error updating the user!");
                    console.log(error);
                    this.setState({
                        errorSyncingReview: error
                    });
                }
            );
    }

    // Toolbar on top of the app, contains name of the app and the menu button
    renderToolbar() {
        var tabName = this.l(`tabs.${this.state.currentTab}`);
        var icon = this.state.usersAreLoaded && this.state.reviewsAreLoaded ?
            'md-refresh' :
            'md-spinner';

        return (
            <Ons.Toolbar>
                <div className='left'>
                    <Ons.ToolbarButton onClick={this.showSidebar}>
                        <Ons.Icon icon='ion-navicon, material:md-menu'></Ons.Icon>
                    </Ons.ToolbarButton>
                </div>
                <div className='center'>{tabName}</div>
                <div className='right'>
                    <Ons.ToolbarButton onClick={this.refresh}>
                        <Ons.Icon icon={icon}></Ons.Icon>
                    </Ons.ToolbarButton>
                </div>
            </Ons.Toolbar>
        )
    }

    hideSidebar() {
        this.setState({sidebarIsOpen: false});
    }

    showSidebar() {
        this.setState({sidebarIsOpen: true});
    }

    toggleSidebarSwiping(isSwipeable) {
        this.setState({sidebarIsSwipeable: isSwipeable});
    }

    // Handle a click on a sidebar item --> change state
    handleSidebarClick(tab, e) {
        this.handleTabChange(tab);
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
                    currentUser={this.state.currentUser}
                    // For reviews card
                    initiateReview={this.initiateReview}
                    openReview={this.openReview}
                    pendingReviews={this.state.pendingReviews}
                    pushReviewUpdates={this.pushReviewUpdates}
                    // For my offer card
                    handleTabChange={this.handleTabChange}
                    pushUserUpdates={this.pushUserUpdates}
                    completeOffer={this.completeOffer}
                    // For nearby offers card
                    online={this.state.online}
                    handleListItemClick={this.handleListItemClick}
                    usersAreLoaded={this.state.usersAreLoaded}
                    errorLoadingUsers={this.state.errorLoadingUsers}
                    users={this.state.users}
                    defaultPicture={defaultPicture}
                    key='dashboard' />,
                tab: <Ons.Tab
                    label={this.l('tabs.dashboard')}
                    icon='md-compass'
                    key='dashboard' />
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
                    l={this.l}
                    logging={this.state.logging}
                    externalData={this.state.externalData}
                    layerControl={this.state.layerControl}
                    draggable={this.state.draggable}
                    zoomable={this.state.zoomable}
                    currentUser={this.state.currentUser}
                    centerPosition={this.state.centerPosition}
                    selectedUserId={this.state.selectedUserId}
                    handleListItemClick={this.handleListItemClick}
                    online={this.state.online}
                    defaultPicture={defaultPicture}
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
                    l={this.l}
                    locale={this.state.locale}
                    handleLocaleChange={this.handleLocaleChange}
                    onDataChange={this.handleExternalDataChange}
                    onLayerControlChange={this.handleLayerControlChange}
                    onDragMapChange={this.handleDragMapChange}
                    onZoomMapChange={this.handleZoomMapChange}
                    pushUserUpdates={this.pushUserUpdates}
                    currentUser={this.state.currentUser}
                    revokeConsent={this.revokeConsent}
                    logout={this.logout}
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
                    l={this.l}
                    handleTabChange={this.handleTabChange}
                    pushUserUpdates={this.pushUserUpdates}
                    currentUserIsLoaded={this.state.currentUserIsLoaded}
                    currentUser={this.state.currentUser}
                    outOfGeofence={this.state.outOfGeofence}
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
            {key: "dashboard", icon: "md-compass"},

        ];

        var picture = this.state.online && this.state.currentUser.picture;
        picture = picture || defaultPicture;

        var listItems = [
            <Ons.ListItem
                key='user'
                tappable={false}>
                    <div className='left'>
                        <img className="list-item__thumbnail"
                            src={picture}
                            alt="Profile picture" />
                    </div>

                    <div className="center">
                        <div className='list-item__title'>
                            <strong>{this.state.currentUser.name}</strong>
                        </div>
                        <div className='list-item__subtitle'>
                            <contactLinks.ContactLinks
                                small={true}
                                user={this.state.currentUser} />
                        </div>
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
                            <Ons.Icon icon={sidebarItem.icon} />
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
        if (this.devMode) {
            this.setState({
                authenticated: true,
                currentTab: this.devMode,
            })

            var userInfo = {
                "nickname": "dev.user",
                "name": "Developer User",
                "picture": "https://s.gravatar.com/avatar/78d60ce06fb9b7c0fe1710ae15da0480?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Flu.png",
                "updated_at": "2019-01-09T08:54:31.035Z",
                auth0Id: "auth0|5c35b6c6a19540326d51c3a9",
                approved: true,
                loginsCount: 0,
            };

            this.fetchOrCreateAuth0User(userInfo);

            return;
        }

        var app = this;

        var target = e && e.target;
        if (target) {target.disabled = true;}

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
                if (target) {target.disabled = false;}
                return (null);
            }

            localStorage.setItem('access_token', authResult.accessToken);
            if (target) {target.disabled = false;}

            app.resumeApp();
        });
    };

    logout(e) {
        window.open("https://geofreebie.eu.auth0.com/v2/logout?returnTo=com.lbraun.geofreebie%3A%2F%2Fgeofreebie.eu.auth0.com%2Fcordova%2Fcom.lbraun.geofreebie%2Fcallback");
        localStorage.removeItem('access_token');
        this.resumeApp();
    };

    revokeConsent(e) {
        this.pushUserUpdates({hasConsented: false});
    };

    handleLocaleChange(e) {
        var newLocale = e.target.value;

        this.setState({locale: newLocale});

        if (this.state.currentUser) {
            this.pushUserUpdates({locale: newLocale});
        }
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
                    // Clean up user data from Auth0
                    userInfo.approved = userInfo["https://myapp.example.com/approved"];
                    userInfo.loginsCount = userInfo["https://myapp.example.com/loginsCount"];
                    userInfo.auth0Id = userInfo.sub;

                    delete userInfo["https://myapp.example.com/approved"];
                    delete userInfo["https://myapp.example.com/loginsCount"];
                    delete userInfo.sub;

                    // Fetch other user data from backend server
                    app.fetchOrCreateAuth0User(userInfo);
                }
            });
        } else {
            // User logged out, so clear out stored user data
            this.setState({
                accessToken: null,
                authenticated: false,
                currentUser: null,
                currentUserId: null,
                currentUserIsLoaded: false,
                users: null,
                usersAreLoaded: false,
                pendingReviews: null,
                reviewsAreLoaded: false,
            })
        }
    };

    // Render sidebars and toolbar
    render() {
        // Redirect to sign in page if user has not yet been authenticated, loaded, and approved
        if (this.state.authenticated && this.state.currentUser && this.state.currentUser.approved) {
            // Redirect to consent form if user has not yet consented
            if (!this.state.currentUser.hasConsented) {
                return (<consentForm.ConsentForm
                    l={this.l}
                    locale={this.state.locale}
                    pushUserUpdates={this.pushUserUpdates}
                    handleLocaleChange={this.handleLocaleChange} />);
            }
            return (
                <Ons.Splitter>
                    <Ons.SplitterSide
                        side='left'
                        width={'75%'}
                        style={{boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'}}
                        swipeable={this.state.sidebarIsSwipeable}
                        collapse={true}
                        isOpen={this.state.sidebarIsOpen}
                        onClose={this.hideSidebar}
                        onOpen={this.showSidebar}>
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
                                        this.handleTabChange(this.tabs[event.index]);
                                    }
                                }}
                            renderTabs={this.renderTabs} />
                    </Ons.Page>
                </Ons.Splitter>
            );
        } else {
            return (<signInPage.SignInPage
                l={this.l}
                locale={this.state.locale}
                handleLocaleChange={this.handleLocaleChange}
                login={this.login}
                logout={this.logout}
                online={this.state.online}
                authenticated={this.state.authenticated}
                currentUser={this.state.currentUser} />);
        }
    }
}

module.exports = {
    App: App
};
