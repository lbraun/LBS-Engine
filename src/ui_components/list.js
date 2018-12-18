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
        if (this.props.errorLoadingUsers) {
            return <div>Error: {this.state.error.message}</div>;
        } else if (!this.props.usersAreLoaded) {
            return <div>Loading...</div>;
        } else {
            var users = this.props.users;
            var listItems = [];

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

            return (
                <Ons.List>
                    {listItems}
                </Ons.List>
            )
        }
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
