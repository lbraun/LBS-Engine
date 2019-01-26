'use strict';

const React = require('react');
const Ons = require('react-onsenui');
const leaflet = require('react-leaflet');

const config = require('../data_components/config.json');
const contactLinks = require('./contactLinks.js');
const reportLink = require('./reportLink.js');
const OfflineLayer = require('../business_components/offlineLayer.js');

class Map extends React.Component {
    constructor(props) {
        super(props);
        this.addLayers = this.addLayers.bind(this);
        this.handleOverlayAdd = this.handleOverlayAdd.bind(this);
        this.handleOverlayRemove = this.handleOverlayRemove.bind(this);
        this.handlePopupClose = this.handlePopupClose.bind(this);
        this.renderMap = this.renderMap.bind(this);

        // Get the settings from the config file
        this.state = {
            position: config.map.center,
            zoom: config.map.zoom,
        };

        // Define marker symbol for the current user's position
        this.positionMarker = L.icon({
            iconUrl: 'img/man.png',
            iconSize: [50, 50],
            iconAnchor: [25, 48],
            popupAnchor: [0, -50],
        });

        // Define marker symbol for other users' positions
        this.userMarker = L.icon({
            iconUrl: 'img/man_blue.png',
            iconSize: [50, 50],
            iconAnchor: [25, 48],
            popupAnchor: [0, -50],
        });
    }

    /**
     * Localize a string in the context of the map
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`map.${string}`);
    }

    /**
     * Handle the activation of a layer on the map
     * @param {Object} e Layer Object fired by leaflet
     */
    handleOverlayAdd(e) {}

    /**
     * Handle the deactivation of a layer on the map
     * @param {Object} e Layer Object fired by leaflet
     */
    handleOverlayRemove(e) {}

    /**
     * Handle the closing of a popup
     */
    handlePopupClose() {
        this.props.handlePopupClose();
    }

    // Render the map with the layerControl
    render() {
        return (
            <Ons.Page>
                {this.renderMap()}
                {this.renderBottomPane()}
            </Ons.Page>
        );
    }

    // Add each layer with a layercontrol.Overlay to the map
    addLayers() {
        var layers = [];

        // Right now there is only one layer, the user layer
        var userLayer = [];
        var users = this.props.users;

        // Add each user to the layer
        for (var i = 0; i < users.length; i++) {
            var user = users[i];

            // Skip if the user hasn't shared their coordinates
            if (!user.coords.length) {
                continue;
            }

            // If user chooses to be public (shareLocation:true), insert marker into the map
            if (user.shareLocation) {
                // If there is content for a popup, insert a popup into the map
                if (user.name != undefined) {
                    userLayer.push(
                        <ExtendedMarker
                            id={user._id}
                            position={user.coords}
                            isOpen={user._id == this.props.selectedUserId}
                            key={user._id}
                            icon={this.userMarker}>
                                {this.renderPopup(user)}
                        </ExtendedMarker>
                    );
                } else {
                    userLayer.push(<leaflet.Marker
                        position={user.coords}
                        key={user._id} />)
                }
            } else {
                // If user chooses NOT to be public, insert a buffer instead of a marker into the map
                // Only do this if the user is selected
                if (user._id == this.props.selectedUserId) {
                    userLayer.push(
                        <ExtendedCircle
                            id={user._id}
                            isOpen={true}
                            key={user._id}
                            center={this.props.currentUser.coords}
                            radius={this.props.calculateDistanceTo(user.coords)}>
                                {this.renderPopup(user)}
                        </ExtendedCircle>
                    );
                }
            }
        }
        layers.push(
            <leaflet.LayersControl.Overlay
                key="userLayer"
                name={this.l("showOtherUsers")}
                checked={true}>
                <leaflet.FeatureGroup key="userLayer">
                    {userLayer}
                </leaflet.FeatureGroup>
            </leaflet.LayersControl.Overlay>
        );
        return layers;
    }

    renderPopup(user) {
        if (user.offer) {
            return (
                <leaflet.Popup onClose={this.handlePopupClose}>
                    <div style={{width: "200px"}}>
                        <a href={user.offer.picture}>
                            <img src={user.offer.picture}
                                id='offer-picture'
                                style={{width: "100%"}} />
                        </a>

                        <div>
                            <span style={{fontSize: "150%", marginTop: "20px"}}>
                                {user.offer.title}
                            </span>

                            <br />{user.offer.description}
                        </div>

                        <div style={{height: "40px", padding: "10px 0px"}}>
                            <img className="list-item__thumbnail"
                                style={{float: "left", marginRight: "10px"}}
                                src={user.picture}
                                alt="Profile picture" />

                            <div>
                                {user.name} {this.l("isOffering")}
                                <br />
                                <div style={{marginTop: "5px"}}>
                                    <Ons.Icon
                                        icon="md-star-circle"
                                        style={{marginRight: "5px", color: "#FC9D2C"}} />
                                    {user.offersCompleted || 0}
                                    <Ons.Icon
                                        icon="md-navigation"
                                        style={{marginRight: "5px", marginLeft: "20px"}} />
                                    {user.distanceToUser ? user.distanceToUser + "m" : null}
                                </div>
                            </div>
                        </div>

                        {this.props.l("offerForm.iCanBeContactedAt")}:
                        <div><contactLinks.ContactLinks user={user} /></div>

                        <div style={{paddingTop: "10px"}}>
                            <reportLink.ReportLink
                                currentUserId={this.props.currentUser._id}
                                l={this.props.l}
                                otherUserId={user._id} />
                        </div>
                    </div>
                </leaflet.Popup>
            );
        } else {
            return (
                <leaflet.Popup onClose={this.handlePopupClose}>
                    <div>
                        <p>{user.name}</p>
                        <p><contactLinks.ContactLinks user={user} /></p>
                        <p>
                            <reportLink.ReportLink
                                currentUserId={this.props.currentUser._id}
                                l={this.props.l}
                                otherUserId={user._id} />
                        </p>
                    </div>
                </leaflet.Popup>
            );
        }
    }

    renderMap() {
        // Check if the user's position is available
        const marker = this.props.currentUser.coords.length
            ? (
                <ExtendedMarker
                    id={"user"}
                    position={this.props.currentUser.coords}
                    isOpen={false}
                    icon={this.positionMarker}>
                    <leaflet.Popup onClose={this.handlePopupClose}>
                        <span>
                            {this.l("youAreHere")}
                        </span>
                    </leaflet.Popup>
                </ExtendedMarker>
            )
            : null;

        var center = this.props.centerPosition;

        // Center on a user if one has been selected from the list view
        if (this.props.selectedUserId != null) {
            var users = this.props.users;
            for (var i = users.length - 1; i >= 0; i--) {
                var user = users[i];
                if (user._id == this.props.selectedUserId) {
                    if (user.shareLocation) {
                        // If the user's position is public, move map to user
                        center = user.coords;
                    } else {
                        // Otherwise just center on the user's position
                        center = this.props.currentUser.coords;
                    }
                }
            }
        }

        return (
            <leaflet.Map
                style={{height: this.props.currentUserId ? "60%" : "100%"}}
                center={center}
                zoom={this.state.zoom}
                dragging={this.props.draggable}
                zoomControl={this.props.zoomable}
                scrollWheelZoom={this.props.zoomable}
                zoomDelta={this.props.zoomable == false ? 0 : 1}
                onOverlayadd={this.handleOverlayAdd}
                onOverlayremove={this.handleOverlayRemove}>
                    <OfflineLayer.OfflineLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution={this.l("attribution")}
                    />

                    {this.props.layerControl ? this.renderLayersControl() : null}

                    <OfflineLayer.OfflineControl
                        l={this.props.l} />

                    {marker}
            </leaflet.Map>
        )
    }

    renderLayersControl() {
        return (
            <leaflet.LayersControl position="topleft">
                {this.addLayers()}
            </leaflet.LayersControl>
        );
    }

    renderBottomPane() {
        return(
            <Ons.Row style={{height: this.props.currentUserId ? "30%" : "0%"}}>
                CHECK THIS OUT
            </Ons.Row>
        );
    }
}

// Create your own class, extending from the Marker class.
class ExtendedMarker extends leaflet.Marker {
    // "Hijack" the component lifecycle.
    render() {
        // Call the Marker class render and store the result
        var result = super.render();

        // Access the marker element and open the popup
        if (this.props.isOpen) {
            this.leafletElement.openPopup();
        }

        // Return the original result (to make sure everything behaves as normal)
        return(result)
    }
}

// Create your own class, extending from the Circle class.
class ExtendedCircle extends leaflet.Circle {
    // "Hijack" the component lifecycle.
    render() {
        // Call the Circle class render and store the result
        var result = super.render();

        // Access the circle element and open the popup
        if (this.props.isOpen) {
            this.leafletElement.openPopup();
        }

        // Return the original result (to make sure everything behaves as normal)
        return(result)
    }
}

module.exports = {
    Map: Map
}
