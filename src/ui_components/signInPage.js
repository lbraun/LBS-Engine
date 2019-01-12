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
        return (
            <Ons.Page style={{textAlign: "center"}}>
                <Ons.Row style={{marginTop: "50px"}}>
                    <Ons.Col>
                        <h1>
                            {this.l("appName")}
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

    renderLoginButton() {
        if (this.props.authenticated) {
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
            )
        } else {
            return (<Ons.Button onClick={this.props.login}>{this.l("logIn")}</Ons.Button>)
        }
    }
}

module.exports = {
    SignInPage: SignInPage
}
