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
        this.handleListItemClick = this.handleListItemClick.bind(this);
    }

    /**
     * Handle clicks on items in the list
     * @param {Integer} integer index of the list item
     */
    handleListItemClick(e) {
        var listItemId = parseInt(e.target.parentElement.id);
        console.log("Clicking on gifter " + listItemId)
        this.props.onListItemClick(listItemId);
    }

    // Render the list
    renderGifterList() {
        var gifters = this.props.getGifters();
        var listItems = [];

        for (let i in gifters) {
            var gifter = gifters[i];
            var clickable = !!(gifter.locationPublic || this.props.userPosition);

            listItems.push(
                <Ons.ListItem
                    id={gifter.id}
                    tappable={clickable}
                    onClick={clickable ? this.handleListItemClick : null}
                    key={'gifter' + gifter.id}>
                        <div className='left'>
                            <Ons.Icon icon='md-face'/>
                        </div>
                        <div className='center'>
                            {gifter.name} - {gifter.giftDescription} - {gifter.contactInformation}
                        </div>
                        <div className='right'>
                            {this.props.userPosition ? `${gifter.distanceToUser} m` : null}
                            {clickable ? null : "Location is private"}
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
                        centerPosition={this.props.centerPosition}
                        userPositionMarkerText={this.props.userPositionMarkerText}
                        selectedGifterId={this.props.selectedGifterId}
                        calculateDistanceTo={this.props.calculateDistanceTo}/>
                </Ons.Row>

                {this.renderGifterList()}
            </div>
        )
    }
}

module.exports = {
    List: List
}
