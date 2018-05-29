'use strict';

const React = require('react');
const Ons = require('react-onsenui');
const geolib = require('geolib');

// Custom imports
const map = require('./map.js');
const config = require('../data_components/config.json');
const layers = require('../data_components/layers.json');

/**
 * Component for displaying the list view. On top a list is displayed and below a map.
 * The map is generated in the same way, it is defined in the config file.
 */
class List extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    /**
     * Handle clicks on items in the list
     * @param {Integer} integer index of the list item
     */
    handleListItemClick(int) {
        // TODO: implement this!
    }

    /**
     * Calculate the distance from the user's location to a given gifter's position
     * @param {Array} coordinates (latitude, longitude) identifying the location of the gifter
     */
    calculateDistanceTo(gifterPosition) {
        var accuracy = 50; // Restrict accuracy to 50 m to protect location privacy
        var distance = geolib.getDistance(
            {latitude: this.props.userPosition[0], longitude: this.props.userPosition[1]},
            {latitude: gifterPosition[0], longitude: gifterPosition[1]},
            accuracy
        );

        return `${distance} m`
    }

    // Render the list
    renderList() {
        var gifters = layers.gifters.items
        var listItems = [];

        for (let gifter in gifters) {
            listItems.push(
                <Ons.ListItem
                    tappable={true}
                    onClick={this.handleListItemClick(gifter)}>
                        <div className='left'>
                            <Ons.Icon icon='md-face'/>
                        </div>
                        <div className='center'>
                            {gifters[gifter].name} - {gifters[gifter].popup}
                        </div>
                        <div className='right'>
                            {this.calculateDistanceTo(gifters[gifter].coords)}
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

    render() {
        return (
            <div className="center" style={{height: '100%'}}>
                <Ons.Row style={{width: '100%', height: '50%'}}>
                    <map.Map
                        picture={true}
                        logging={this.props.logging}
                        externalData={this.props.externalData}
                        gps={this.props.gps}
                        layerControl={this.props.layerControl}
                        draggable={this.props.draggable}
                        zoomable={this.props.zoomable}
                        userPosition={this.props.userPosition}
                        userPositionMarkerText={this.props.userPositionMarkerText}/>
                </Ons.Row>

                {this.renderList()}
            </div>
        )
    }
}

module.exports = {
    List: List
}
