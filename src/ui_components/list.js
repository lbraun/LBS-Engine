'use strict';

const React = require('react');
const Ons = require('react-onsenui');

/**
 * Component for displaying the list view.
 */
class List extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * Localize a string in the context of the list
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`list.${string}`);
    }

    render() {
        return (
            <Ons.Page>
                <Ons.Row height="100%">
                    <Ons.Col verticalAlign="center">
                        <Ons.List>
                            <UserListItems
                                l={this.props.l}
                                online={this.props.online}
                                currentUser={this.props.currentUser}
                                defaultPicture={this.props.defaultPicture}
                                handleListItemClick={this.props.handleListItemClick}
                                usersAreLoaded={this.props.usersAreLoaded}
                                errorLoadingUsers={this.props.errorLoadingUsers}
                                users={this.props.users} />
                        </Ons.List>
                    </Ons.Col>
                </Ons.Row>
            </Ons.Page>
        )
    }
}

class UserListItems extends React.Component {
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

    renderUserPicture(user) {
        if (user.picture && this.props.online) {
            var picture = user.picture;
        } else {
            var picture = this.props.defaultPicture;
        }

        return (
            <img className="list-item__thumbnail"
                src={picture}
                alt="Profile picture" />
        );
    }

    /**
     * Returns text describing the user's availability
     * @param {User} the user to describe
     */
    availablityText(user) {
        var status = user.offer ?
            (user.offer.available ? "available" : "notAvailable") :
            "noOffer";

        var text = this.props.l("offerForm." + status)

        // Show distance to user if it has been calculated
        if (user.distanceToUser) {
            return text += ` - ${user.distanceToUser} m`;
        } else {
            return text += ` - ${this.l("locationIsUnavailable")}`;
        }
    }

    /**
     * Handle clicks on users in the list
     * @param {userId} id of the user
     * @param {e} click event
     */
    handleListItemClick(userId, e) {
        this.props.handleListItemClick(userId);
    }

    // Render the list items
    render() {
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
                var clickable = user.coords && !!(user.shareLocation || this.props.currentUser.coords);

                if (!user.offer && this.props.usersWithOffersOnly) { continue; }

                listItems.push(
                    <Ons.ListItem
                        tappable={clickable}
                        onClick={clickable ? this.handleListItemClick.bind(this, user._id) : null}
                        id={`user-list-item-${user._id}`}
                        key={user._id}>
                            <div className="left">
                                {this.renderUserPicture(user)}
                            </div>
                            <div className="center">
                                <div className="list-item__title">
                                    {user.offer && user.offer.title}
                                </div>
                                <div className="list-item__subtitle">
                                    {this.availablityText(user)}
                                </div>
                            </div>
                    </Ons.ListItem>
                )
            }
        }

        return (listItems);
    }
}

module.exports = {
    UserListItems: UserListItems,
    List: List
}
