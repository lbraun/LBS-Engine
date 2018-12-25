'use strict';
const React = require('react');
const leaflet = require('react-leaflet');
// Custom files required
// Data
const config = require('../data_components/config.json');
// Logic
const locationManager = require('../business_components/locationManager.js');
const logger = require('../business_components/logger.js');
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
     * Write a log that notes the change of active layers
     * @param {boolean} change If the layer was added or removed
     * @param {String} data Name of the layer that was toggled
     */
    createLog(change, data) {
        var action;
        var map = this;
        if(this.props.logging) {
            // Define the log
            if(change) {
                action =  'Activate ' + data;
            }
            else action = 'Deactivate ' + data;
            var entry;
            // Get the current position for the log
            locationManager.getLocation().then(function success(position) {
                entry = [position.latitude, position.longitude, map.props.picture ? 'Streetview' : 'Map', action];
                // Log the data
                logger.logEntry(entry);
            }, function error(err) {
                // If there was an error getting the position, log a '-' for lat/lng
                entry = ['-', '-', map.props.picture ? 'Streetview' : 'Map', action];
                // Log the data
                logger.logEntry(entry);
            })
        }
    }

    /**
     * Handle the activation of a layer on the map
     * @param {Object} e Layer Object fired by leaflet
     */
    handleOverlayAdd(e) {
        this.createLog(true, e.name);
    }

    /**
     * Handle the deactivation of a layer on the map
     * @param {Object} e Layer Object fired by leaflet
     */
    handleOverlayRemove(e) {

        this.createLog(false, e.name);
    }

    // Get the elements from the layer.json file and add each layer with a layercontrol.Overlay to the map
    addLayers() {
        var layers = [];
        var userLayer = [];
        var users = this.props.users;

        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            // If user chooses to be public (shareLocation:true), insert marker into the map
            if (user.shareLocation) {
                // If there is content for a popup, insert a popup into the map
                if (user.name != undefined) {
                    var popup = user.name
                        + " is offering " + user.offerDescription
                        + " and can be contacted at " + user.contactInformation;
                    userLayer.push(<ExtendedMarker
                        id={user.id}
                        position={user.coords}
                        isOpen={user.id == this.props.selectedUserId}
                        key={user.name}
                        icon={this.userMarker}>
                        <leaflet.Popup>
                            <span>
                                {popup}
                            </span>
                        </leaflet.Popup>
                    </ExtendedMarker>)
                } else {
                    userLayer.push(<leaflet.Marker
                        position={user.coords}
                        key={user.name} />)
                }
            } else {
                // If user chooses NOT to be public, insert a buffer instead of a marker into the map
                // Only do this if the user is selected
                if (user.id == this.props.selectedUserId) {
                    var popup = user.name
                        + " is offering " + user.offerDescription
                        + " and can be contacted at " + user.contactInformation;
                    userLayer.push(<ExtendedCircle
                        id={user.id}
                        isOpen={true}
                        key={user.name}
                        center={this.props.userPosition}
                        radius={this.props.calculateDistanceTo(user.coords)}>
                        <leaflet.Popup>
                            <span>
                                {popup}
                            </span>
                        </leaflet.Popup>
                    </ExtendedCircle>)
                }
            }
        }
        layers.push(
            <leaflet.LayersControl.Overlay
                key="userLayer"
                name="Show other users"
                checked={true}>
                <leaflet.FeatureGroup key="userLayer">
                    {userLayer}
                </leaflet.FeatureGroup>
            </leaflet.LayersControl.Overlay>)
        return layers;
    }

    renderMapWithLayers() {
        // Check if the user's position is available
        const marker = this.props.userPosition
            ? (
                <ExtendedMarker
                    id={"user"}
                    position={this.props.userPosition}
                    isOpen={false}
                    icon={this.positionMarker}>
                    <leaflet.Popup>
                        <span>
                            {this.props.userPositionMarkerText}
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
                if (user.id == this.props.selectedUserId) {
                    if (user.shareLocation) {
                        // If the user's position is public, move map to user
                        center = user.coords;
                    } else {
                        // Otherwise just center on the user's position
                        center = this.props.userPosition;
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
                    attribution="Map data &copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
                <leaflet.LayersControl position="topleft">
                    {this.addLayers()}
                </leaflet.LayersControl>
                <OfflineLayer.OfflineControl />
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
            const marker = this.props.useLocation
                ? (
                    <leaflet.Marker position={this.props.userPosition} icon={this.positionMarker}>
                        <leaflet.Popup>
                            <span>
                                {this.props.userPositionMarkerText}
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
                        attribution="Map data &copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
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
