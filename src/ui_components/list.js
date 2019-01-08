'use strict';

const React = require('react');
const Ons = require('react-onsenui');

/**
 * Component for displaying the list view.
 */
class List extends React.Component {
    constructor(props) {
        super(props);
        this.handleListItemClick = this.handleListItemClick.bind(this);
    }

    /**
     * Localize a string in the context of the list
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`list.${string}`);
    }

    /**
     * Handle clicks on users in the list
     * @param {userId} id of the user
     * @param {e} click event
     */
    handleListItemClick(userId, e) {
        this.props.onListItemClick(userId);
    }

    /**
     * Returns text describing the user's availability
     * @param {User} the user to describe
     */
    availablityText(user) {
        if (user.available) {
            var text = this.props.l("offerForm.available");

            // Show distance to user if it has been calculated
            if (user.distanceToUser) {
                return text += ` - ${user.distanceToUser} m`;
            } else {
                return text += ` - ${this.l("locationIsUnavailable")}`;
            }
        } else {
            return this.props.l("offerForm.notAvailable");
        }
    }

    // Render the list
    renderUserList() {
        var listItems = [];

        if (this.props.errorLoadingUsers) {
            var errorMessage = this.props.errorLoadingUsers.message;

            if (errorMessage == "Failed to fetch") {
                errorMessage = this.l("fetchFailure");
            }

            listItems.push(
                <Ons.ListItem key="0">
                    {this.l("error")}: {errorMessage}
                </Ons.ListItem>
            );
        } else if (!this.props.usersAreLoaded) {
            listItems.push(
                <Ons.ListItem key="0">
                    {this.l("loading")}
                </Ons.ListItem>
            );
        } else if (this.props.users.length == 0) {
            listItems.push(
                <Ons.ListItem key="0">
                    {this.l("noUsers")}
                </Ons.ListItem>
            );
        } else {
            var users = this.props.users;

            for (let i in users) {
                var user = users[i];
                var clickable = user.available && !!(user.shareLocation || this.props.currentUser.coords);

                listItems.push(
                    <Ons.ListItem
                        tappable={clickable}
                        onClick={clickable ? this.handleListItemClick.bind(this, user._id) : null}
                        id={`user-list-item-${user._id}`}
                        key={user._id}>
                            <div className="left">
                                <Ons.Icon icon="md-face"/>
                            </div>
                            <div className="center">
                                <div className="list-item__title">
                                    {user.name}
                                </div>
                                <div>
                                    {user.offerDescription} - {user.contactInformation}
                                </div>
                                <div className="list-item__subtitle">
                                    {this.availablityText(user)}
                                </div>
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
