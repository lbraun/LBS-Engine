'use strict';

const React = require('react');
const Ons = require('react-onsenui');
const geolib = require('geolib');

// Custom imports
const config = require('../data_components/config.json');
const layers = require('../data_components/layers.json');

/**
 * Component for displaying the list view.
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
        console.log("Clicking on freecycler " + listItemId)
        this.props.onListItemClick(listItemId);
    }

    // Render the list
    renderFreecyclerList() {
        var freecyclers = this.props.getFreecyclers();
        var listItems = [];

        for (let i in freecyclers) {
            var freecycler = freecyclers[i];
            var clickable = !!(freecycler.shareLocation || this.props.userPosition);

            listItems.push(
                <Ons.ListItem
                    id={freecycler.id}
                    tappable={clickable}
                    onClick={clickable ? this.handleListItemClick : null}
                    key={'freecycler' + freecycler.id}>
                        <div className='left'>
                            <Ons.Icon icon='md-face'/>
                        </div>
                        <div className='center'>
                            {freecycler.name} - {freecycler.offerDescription} - {freecycler.contactInformation}
                        </div>
                        <div className='right'>
                            {this.props.userPosition ? `${freecycler.distanceToUser} m` : null}
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
                {this.renderFreecyclerList()}
            </div>
        )
    }
}

module.exports = {
    List: List
}
