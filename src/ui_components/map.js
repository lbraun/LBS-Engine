'use strict';

const React = require('react');
const Ons = require('react-onsenui');
const leaflet = require('react-leaflet');

const config = require('../data_components/config.json');
const OfflineLayer = require('../business_components/offlineLayer.js');

class Map extends React.Component {
    constructor(props) {
        super(props);
        this.addLayers = this.addLayers.bind(this);
        this.renderMapWithLayers = this.renderMapWithLayers.bind(this);
        this.handleOverlayAdd = this.handleOverlayAdd.bind(this);
        this.handleOverlayRemove = this.handleOverlayRemove.bind(this);

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

    // Add each layer with a layercontrol.Overlay to the map
    addLayers() {
        var layers = [];

        // Right now there is only one layer, the user layer
        var userLayer = [];
        var users = this.props.users;

        // Add each user to the layer
        for (var i = 0; i < users.length; i++) {
            var user = users[i];

            // Skip if the user is not available or hasn't shared their coordinates
            if (!user.available || !user.coords) {
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
        return (
            <leaflet.Popup>
                <div>
                    <p>{user.name} {this.l("isOffering")}</p>
                    <b>{user.offerTitle}</b>
                    <p>{user.offerDescription}</p>
                    <img src={`data:image/jpeg;base64, ${user.offerPicture}`}
                        id='offer-picture'
                        style={{width: "100%"}} />
                    <p>
                        {this.l("andCanBeContactedAt")}
                        <span>{this.renderContactLinks(user)}</span>
                    </p>
                    <p>{this.reportLink(user)}</p>
                </div>
            </leaflet.Popup>
        );
    }

    renderContactLinks(user) {
        var links = [];
        var contactInfo = user.contactInformation;

        var contactTypes = [
            {setting: "useEmail",    contactType: "email"},
            {setting: "useFacebook", contactType: "facebook"},
            {setting: "usePhone",    contactType: "phone"},
            {setting: "useWhatsapp", contactType: "whatsapp"},
        ];

        for (var i = contactTypes.length - 1; i >= 0; i--) {
            var setting = contactTypes[i].setting;
            var contactType = contactTypes[i].contactType;

            if (contactInfo[setting]) {
                links.push(
                    <a href={this.getContactLink(contactInfo, contactType)}
                        key={contactType} >
                            <Ons.Icon
                                style={{color: "black", margin: "15px"}}
                                icon={`md-${contactType}`} />
                    </a>
                )
            }
        }

        return links;
    }

    getContactLink(contactInfo, contactType) {
        if (contactType == "facebook") {
            return "https://m.me/" + contactInfo.facebook;
        } else if (contactType == "whatsapp") {
            return "https://wa.me/" + contactInfo.whatsapp;
        } else if (contactType == "email") {
            return "mailto:" + contactInfo.email;
        } else if (contactType == "phone") {
            return "tel:" + contactInfo.phone;
        } else {
            console.log("Error: invalid contact type: " + contactType);
        }
    }

    reportLink(user) {
        var mailtoLink = "mailto:";
        mailtoLink += config.app.adminEmail;
        mailtoLink += "?subject=";
        mailtoLink += this.props.l("app.reportEmailSubject");
        mailtoLink += ": " + this.props.currentUser._id + " > " + user._id;
        mailtoLink += "&body=";
        mailtoLink += this.props.l("app.reportEmailBody");

        return (
            <a href={mailtoLink}>
                {this.props.l("app.report")}
            </a>
        )
    }

    renderMapWithLayers() {
        // Check if the user's position is available
        const marker = this.props.currentUser.coords
            ? (
                <ExtendedMarker
                    id={"user"}
                    position={this.props.currentUser.coords}
                    isOpen={false}
                    icon={this.positionMarker}>
                    <leaflet.Popup>
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
                <leaflet.LayersControl position="topleft">
                    {this.addLayers()}
                </leaflet.LayersControl>
                <OfflineLayer.OfflineControl
                    l={this.props.l} />
                {marker}
            </leaflet.Map>
        )
    }

    // Render the map with the layerControl
    render() {
        // If the layerControl is active, the map is rendered with the layercontrol
        if (this.props.layerControl) {
            return this.renderMapWithLayers()
        } else {
            // Check if the location is enabled and available
            const marker = this.props.currentUser.useLocation
                ? (
                    <leaflet.Marker position={this.props.currentUser.coords} icon={this.positionMarker}>
                        <leaflet.Popup>
                            <span>
                                {this.l("youAreHere")}
                            </span>
                        </leaflet.Popup>
                    </leaflet.Marker>
                )
                : null;

            // Return the map without any layers shown
            return (
                <leaflet.Map center={this.props.centerPosition}
                    zoom={this.state.zoom}
                    dragging={this.props.draggable}
                    zoomControl={this.props.zoomable}
                    scrollWheelZoom={this.props.zoomable}
                    zoomDelta={this.props.zoomable == false ? 0 : 1}>
                    <OfflineLayer.OfflineLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution={this.l("attribution")}
                    />
                    <OfflineLayer.OfflineControl />
                    {marker}
                </leaflet.Map>
            )
        }
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
