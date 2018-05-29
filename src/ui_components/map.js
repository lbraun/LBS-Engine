'use strict';
const React = require('react');
const leaflet = require('react-leaflet');
//custom files required
//data
const config = require('../data_components/config.json');
const layers = require('../data_components/layers.json');
//logic
const locationManager = require('../business_components/locationManager.js');
const logger = require('../business_components/logger.js');
const OfflineLayer = require('../business_components/offlineLayer.js');

class Map extends React.Component {

    constructor(props) {
        super(props);
        this.addLayers = this.addLayers.bind(this);
        this.renderMapWithLayers = this.renderMapWithLayers.bind(this);
        this.handleOverlayadd = this.handleOverlayadd.bind(this);
        this.handleOverlayremove = this.handleOverlayremove.bind(this);

        // Get the settings from the config file
        this.state = {
            position: config.map.center,
            zoom: config.map.zoom,
        }

        // Define marker symbol for the user position marker
        this.positionMarker = L.icon({
            iconUrl: 'img/man.png',
            iconSize: [50, 50],
            iconAnchor: [25, 48],
            popupAnchor: [-3, -76]
        });

        // Define marker symbol for the user gifter marker
        this.gifterMarker = L.icon({
            iconUrl: 'img/man_blue.png',
            iconSize: [50, 50],
            iconAnchor: [25, 48],
            popupAnchor: [-3, -76]
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
    handleOverlayadd(e) {

        this.createLog(true, e.name);
    }

    /**
     * Handle the deactivation of a layer on the map
     * @param {Object} e Layer Object fired by leaflet
     */
    handleOverlayremove(e) {

        this.createLog(false, e.name);
    }

    // Get the elements from the layer.json file and add each layer with a layercontrol.Overlay to the map
    addLayers() {
        var mapLayers = [];
        for (let layer in layers) {
            var layerElement = [];
            // Check if the layer is containing markers and add those
            if (layers[layer].type == 'marker') {
                for (var i = 0; i < layers[layer].items.length; i++) {
                    // If user chooses to be public (public:true), insert marker into the map
                    if (layers[layer].items[i].public){
                      // If there is a popup, insert it into the map
                      if (layers[layer].items[i].popup != undefined ) {
                          layerElement.push(<leaflet.Marker position={layers[layer].items[i].coords} key={layers[layer].items[i].name} icon={this.gifterMarker}>
                              <leaflet.Popup>
                                  <span>
                                      {layers[layer].items[i].popup}
                                  </span>
                              </leaflet.Popup>
                              </leaflet.Marker>)
                      }
                      else {
                          layerElement.push(<leaflet.Marker position={layers[layer].items[i].coords} key={layers[layer].items[i].name} />)
                      }
                    }
                }
            }
            // Else it is a route
            else if (layers[layer].type == 'route') {
                layerElement.push(<leaflet.Polyline positions={layers[layer].coords} color='red' key={layers[layer].name} />);
            }
            mapLayers.push(<leaflet.LayersControl.Overlay key={layer}
                                                        name={layer}
                                                        checked={true}>
                                                        <leaflet.FeatureGroup key={layer}>
                                                            {layerElement}
                                                        </leaflet.FeatureGroup>
                            </leaflet.LayersControl.Overlay>)
        }
        return mapLayers;
    }

    renderMapWithLayers() {
        // Check if the location is enabled and available
        const marker = this.props.gps
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
        return (
            <leaflet.Map
                center={this.props.userPosition}
                zoom={this.state.zoom}
                dragging={this.props.draggable}
                zoomControl={this.props.zoomable}
                scrollWheelZoom={this.props.zoomable}
                zoomDelta={this.props.zoomable == false ? 0 : 1}
                onOverlayadd={this.handleOverlayadd}
                onOverlayremove={this.handleOverlayremove}>
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
        }
        else {
            // Check if the location is enabled and available
            const marker = this.props.gps
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
                <leaflet.Map center={this.props.userPosition}
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

module.exports = {
    Map: Map
}
