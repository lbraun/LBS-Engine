'use strict';

const React = require('react');
const Ons = require('react-onsenui');
const geolib = require('geolib');

// Custom imports
const config = require('../data_components/config.json');

/**
 * Component for displaying the list view.
 */
class List extends React.Component {

    constructor(props) {
        super(props);
        this.handleListItemClick = this.handleListItemClick.bind(this);
    }

    /**
     * Handle clicks on users in the list
     * @param {userId} id of the user
     * @param {e} click event
     */
    handleListItemClick(userId, e) {
        this.props.onListItemClick(userId);
    }

    // Render the list
    renderUserList() {
        var listItems = [];

        if (this.props.errorLoadingUsers) {
            listItems.push(
                <Ons.ListItem key="0">
                    Error: {this.state.error.message}
                </Ons.ListItem>
            );
        } else if (!this.props.usersAreLoaded) {
            listItems.push(
                <Ons.ListItem key="0">
                    Loading...
                </Ons.ListItem>
            );
        } else if (this.props.users.length == 0) {
            listItems.push(
                <Ons.ListItem key="0">
                    There are no other users in the system right now.
                    Please check back later!
                </Ons.ListItem>
            );
        } else {
            var users = this.props.users;

            for (let i in users) {
                var user = users[i];
                var clickable = !!(user.shareLocation || this.props.userPosition);

                listItems.push(
                    <Ons.ListItem
                        tappable={clickable}
                        onClick={clickable ? this.handleListItemClick.bind(this, user.id) : null}
                        id={`user-list-item-${user.id}`}
                        key={user.id}>
                            <div className='left'>
                                <Ons.Icon icon='md-face'/>
                            </div>
                            <div className='center'>
                                {user.name} - {user.offerDescription} - {user.contactInformation}
                            </div>
                            <div className='right'>
                                {this.props.userPosition && user.distanceToUser ? `${user.distanceToUser} m` : null}
                                {clickable ? null : "Location is private"}
                            </div>
                    </Ons.ListItem>
                )
            }
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
                {this.renderUserList()}
            </div>
        )
    }
}

module.exports = {
    List: List
}
