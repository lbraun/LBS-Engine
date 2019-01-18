'use strict';
const React = require('react');
const Ons = require('react-onsenui');

const localeMenu = require('./localeMenu.js');

class SignInPage extends React.Component {
    constructor(props) {
        super(props);
        this.renderMainContent = this.renderMainContent.bind(this);
        this.renderLoginButton = this.renderLoginButton.bind(this);

        // Try logging in automatically
        this.props.login();
    }

    /**
     * Localize a string in the context of the sign-in page
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`signInPage.${string}`);
    }

    // Render the sign in page
    render() {
        return (
            <Ons.Page style={{textAlign: "center"}}>
                <Ons.Row style={{marginTop: "50px"}}>
                    <Ons.Col>
                        <h1>{this.props.l("app.name")}</h1>
                    </Ons.Col>
                </Ons.Row>

                {this.renderMainContent()}
            </Ons.Page>
        );
    }

    renderMainContent() {
        // If not authenticated, render login button and locale menu
        if (!this.props.authenticated) {
            return (
                <div>
                    <Ons.Row>
                        <Ons.Col>
                            {this.renderLoginButton()}
                        </Ons.Col>
                    </Ons.Row>

                    <Ons.Row style={{marginTop: "50px"}}>
                        <Ons.Col>
                            <localeMenu.LocaleMenu
                                locale={this.props.locale}
                                handleLocaleChange={this.props.handleLocaleChange} />
                        </Ons.Col>
                    </Ons.Row>
                </div>
            );
        }

        // If no current user, render spinner and loading message
        if (!this.props.currentUser) {
            return (
                <div>
                    <p>
                        <svg className="progress-circular progress-circular--indeterminate">
                            <circle className="progress-circular__background"/>
                            <circle className="progress-circular__primary progress-circular--indeterminate__primary"/>
                            <circle className="progress-circular__secondary progress-circular--indeterminate__secondary"/>
                        </svg>
                    </p>

                    <p><span>{this.l("loading")}</span></p>
                </div>
            );
        }

        // If not yet approved, just tell user to wait
        if (!this.props.currentUser.approved) {
            return (
                <div>
                    <Ons.Row>
                        <Ons.Col>
                            <h3>{this.l("hi")} {this.props.currentUser.name}!</h3>

                            <p>{this.l("waitForApproval")}</p>
                            <p>{this.l("whileYouAreWaiting")} <a href='https://github.com/lbraun/geofreebie'>{this.props.l("app.projectsWebsite")}</a>.</p>
                        </Ons.Col>
                    </Ons.Row>

                    <Ons.Row style={{marginTop: "50px"}}>
                        <Ons.Col>
                            {this.renderRefreshButton()}
                        </Ons.Col>
                    </Ons.Row>

                    <Ons.Row style={{marginTop: "50px"}}>
                        <Ons.Col>
                            <localeMenu.LocaleMenu
                                locale={this.props.locale}
                                handleLocaleChange={this.props.handleLocaleChange} />
                        </Ons.Col>
                    </Ons.Row>
                </div>
            );
        }
    }

    renderLoginButton() {
        if (this.props.online) {
            return (
                <Ons.Button onClick={this.props.login}>
                    {this.l("logIn")}
                </Ons.Button>
            )
        } else {
            return (
                <div>
                    <Ons.Button onClick={this.props.login} disabled={"true"}>
                        {this.l("logIn")}
                    </Ons.Button>
                    <p>{this.l("youMustBeOnlineInOrderToLogin")}</p>
                </div>
            )
        }
    }

    renderRefreshButton() {
        if (this.props.online) {
            return (
                <Ons.Button onClick={this.props.refresh}>
                    {this.l("refresh")}
                </Ons.Button>
            )
        } else {
            return (
                <div>
                    <Ons.Button onClick={this.props.refresh} disabled={"true"}>
                        {this.l("refresh")}
                    </Ons.Button>
                    <p>{this.l("youMustBeOnlineInOrderToLogin")}</p>
                </div>
            )
        }
    }
}

module.exports = {
    SignInPage: SignInPage
}
