'use strict';

const React = require('react');
const Ons = require('react-onsenui');

const config = require('../data_components/config.json');
const localeMenu = require('./localeMenu.js');

/**
 * Component for displaying the help page.
 */
class Help extends React.Component {
    constructor(props) {
        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.handleListItemClick = this.handleListItemClick.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
        this.render = this.render.bind(this)
        this.renderHelpListItems = this.renderHelpListItems.bind(this)
        this.renderHelpListItem = this.renderHelpListItem.bind(this)
        this.renderPage = this.renderPage.bind(this)
        this.renderRules = this.renderRules.bind(this)
        this.renderRulesEn = this.renderRulesEn.bind(this)
        this.renderContact = this.renderContact.bind(this)
        this.renderLegal = this.renderLegal.bind(this)

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

    /**
     * Handle clicks on items in the list
     * @param {itemId} id of the item
     * @param {e} click event
     */
    handleLinkClick(url, e) {
        window.open(url, "_blank");
    }

    handleBackButtonClick() {
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
        var websiteBaseUrl = "https://lbraun.github.io/geofreebie/";
        var wikiBaseUrl = "https://github.com/lbraun/geofreebie/wiki/";

        var rules = "Rules-(English)";
        var privacy_policy = "privacy_policy_en.html";
        var consent_form = "consent_form_en.pdf";

        if (this.props.locale == "de") {
            rules = "Rules-(German)";
            privacy_policy = "privacy_policy_de.html";
            consent_form = "consent_form_de.pdf";
        }

        var listItems = [];

        listItems.push(this.renderHelpListItemLink(
            "help",
            wikiBaseUrl
        ));

        listItems.push(this.renderHelpListItemLink(
            "rules",
            wikiBaseUrl + rules
        ));

        // listItems.push(this.renderHelpListItem("rules"));
        listItems.push(this.renderHelpListItem("contact"));
        // listItems.push(this.renderHelpListItem("legal"));

        listItems.push(this.renderHelpListItemLink(
            "privacy",
            websiteBaseUrl + privacy_policy
        ));

        listItems.push(this.renderHelpListItemLink(
            "consent",
            websiteBaseUrl + consent_form
        ));

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

    renderHelpListItemLink(pageId, url) {
        return (
            <Ons.ListItem
                modifier={"chevron"}
                tappable={true}
                onClick={this.handleLinkClick.bind(this, url)}
                id={`help-list-item-${pageId}`}
                key={pageId}>
                    {this.l(pageId)}
            </Ons.ListItem>
        );
    }

    renderPage(pageName, renderContent) {
        return (
            <Ons.Page>
                <div style={{margin: "15px"}}>
                    <Ons.Row>
                        <Ons.Col>
                            <Ons.Button onClick={this.handleBackButtonClick}>
                                {this.props.l("app.back")}
                            </Ons.Button>
                        </Ons.Col>

                        <Ons.Col style={{textAlign: "right"}}>
                            <localeMenu.LocaleMenu
                                locale={this.props.locale}
                                handleLocaleChange={this.props.handleLocaleChange} />
                        </Ons.Col>
                    </Ons.Row>

                    <h1>
                        {this.l(pageName)}
                    </h1>

                    {renderContent()}
                </div>
            </Ons.Page>
        );
    }

    renderRules() {
        if (this.props.locale == "de") {
            return this.renderRulesDe();
        } else {
            return this.renderRulesEn();
        }
    }

    renderRulesEn() {
        return (
            <div>
                <p>1. Only post things that you want to give away for free. Those who offer something should not expect anything in exchange.</p>

                <p>2. Users are not allowed to offer anything illegal.</p>

                <p>3. The person offering can choose the recipient of their offer any way they like.</p>

                <p>4. Private messages from strangers on Facebook might not end up in your inbox. Check your message requests too!</p>

                <p>5. Be kind and respectful. You may be blocked from the app if you do not respect the community, its rules, and its members.</p>
            </div>
        );
    }

    renderRulesDe() {
        return (
            <div>
                <p>1. Only post things that you want to give away for free. Those who offer something should not expect anything in exchange.</p>

                <p>2. Users are not allowed to offer anything illegal.</p>

                <p>3. The person offering can choose the recipient of their offer any way they like.</p>

                <p>4. Private messages from strangers on Facebook might not end up in your inbox. Check your message requests too!</p>

                <p>5. Be kind and respectful. You may be blocked from the app if you do not respect the community, its rules, and its members.</p>
            </div>
        );
    }

    renderContact() {
        return (
            <div>
                {this.l("questionsOrConcerns")}
                <br />
                <br />
                <a href={`mailto:${config.app.adminEmail}`}>{config.app.adminEmail}</a>
                <br />
                <br />
                {this.l("thanks")}!
                <br />
                Lucas Braun
            </div>
        );
    }

    renderLegal() {

    }
}


module.exports = {
    Help: Help
}
