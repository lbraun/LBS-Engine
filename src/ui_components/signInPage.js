'use strict';
const React = require('react');
const Ons = require('react-onsenui');

const localeMenu = require('./localeMenu.js');

class SignInPage extends React.Component {
    constructor(props) {
        super(props);
        this.renderLoginButton = this.renderLoginButton.bind(this);
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
        // If already authenticated, just wait for user data to load
        if (this.props.authenticated) {
            return (
                <Ons.Page style={{textAlign: "center"}}>
                    <Ons.Row style={{marginTop: "50px"}}>
                        <Ons.Col>
                            <h1>
                                {this.props.l("app.name")}
                            </h1>
                        </Ons.Col>
                    </Ons.Row>

                    <p>
                        <svg className="progress-circular progress-circular--indeterminate">
                            <circle className="progress-circular__background"/>
                            <circle className="progress-circular__primary progress-circular--indeterminate__primary"/>
                            <circle className="progress-circular__secondary progress-circular--indeterminate__secondary"/>
                        </svg>
                    </p>
                    <p><span>{this.l("loading")}</span></p>
                </Ons.Page>
            );
        } else {
            return (
                <Ons.Page style={{textAlign: "center"}}>
                    <Ons.Row style={{marginTop: "50px"}}>
                        <Ons.Col>
                            <h1>
                                {this.props.l("app.name")}
                            </h1>
                        </Ons.Col>
                    </Ons.Row>

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
                </Ons.Page>
            )
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
}

module.exports = {
    SignInPage: SignInPage
}
