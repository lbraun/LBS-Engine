'use strict';

const React = require('react');
const Ons = require('react-onsenui');

/**
 * Component for displaying the help page.
 */
class Help extends React.Component {
    constructor(props) {
        super(props);
        this.handleListItemClick = this.handleListItemClick.bind(this);
        this.onDeviceBackButton = this.onDeviceBackButton.bind(this);

        this.state = {
            rulesPageIsOpen: false,
            contactPageIsOpen: false,
            legalPageIsOpen: false,
        }
    }

    /**
     * Localize a string in the context of the help page
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`help.${string}`);
    }

    /**
     * Handle clicks on items in the list
     * @param {itemId} id of the item
     * @param {e} click event
     */
    handleListItemClick(item, e) {
        this.setState({
            rulesPageIsOpen: item == "rules",
            contactPageIsOpen: item == "contact",
            legalPageIsOpen: item == "legal",
        });
    }

    onDeviceBackButton() {
        this.setState({
            rulesPageIsOpen: false,
            contactPageIsOpen: false,
            legalPageIsOpen: false,
        });
    }

    render() {
        if (this.state.rulesPageIsOpen) {
            return this.renderPage("rules", this.renderRules);
        } else if (this.state.contactPageIsOpen) {
            return this.renderPage("contact", this.renderContact);
        } else if (this.state.legalPageIsOpen) {
            return this.renderPage("legal", this.renderLegal);
        } else {
            return (
                <Ons.Page>
                    <Ons.Row height="100%">
                        <Ons.Col verticalAlign="center">
                            <Ons.List>
                                {this.renderHelpListItems()}
                            </Ons.List>
                        </Ons.Col>
                    </Ons.Row>
                </Ons.Page>
            );
        }
    }

    renderHelpListItems() {
        var listItems = [];

        listItems.push(this.renderHelpListItem("rules"));
        listItems.push(this.renderHelpListItem("contact"));
        listItems.push(this.renderHelpListItem("legal"));

        return listItems;
    }

    renderHelpListItem(pageId) {
        return (
            <Ons.ListItem
                modifier={"chevron"}
                tappable={true}
                onClick={this.handleListItemClick.bind(this, pageId)}
                id={`help-list-item-${pageId}`}
                key={pageId}>
                    {this.l(pageId)}
            </Ons.ListItem>
        );
    }

    renderPage(pageName, renderContent) {
        return (
            <Ons.Page onDeviceBackButton={this.onDeviceBackButton}>
                <div style={{margin: "15px"}}>
                    <Ons.Button onClick={this.onDeviceBackButton}>
                        {this.props.l("app.back")}
                    </Ons.Button>

                    <h1>
                        {this.l(pageName)}
                    </h1>

                    {renderContent()}
                </div>
            </Ons.Page>
        );
    }

    renderRules() {
        return (
            <div>Blah bla bla</div>
        );
    }

    renderContact() {
        return (
            <div>Blah bla bla</div>
        );
    }

    renderLegal() {
        return (
            <div>Blah bla bla</div>
        );
    }
}


module.exports = {
    Help: Help
}
