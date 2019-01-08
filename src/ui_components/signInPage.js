'use strict';
const React = require('react');
const Ons = require('react-onsenui');

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
            <Ons.Page>
                <Ons.Row height="100%">
                    <Ons.Col verticalAlign="center">
                        <h1 style={{textAlign: "center"}}>
                            {this.l("appName")}
                        </h1>
                        <p style={{textAlign: "center"}}>
                            {this.renderLoginButton()}
                        </p>
                    </Ons.Col>
                </Ons.Row>
            </Ons.Page>
        )
    }

    renderLoginButton() {
        if (this.props.authenticated) {
            return (<span>{this.l("loading")}</span>)
        } else {
            return (<Ons.Button onClick={this.props.login}>{this.l("logIn")}</Ons.Button>)
        }
    }
}

module.exports = {
    SignInPage: SignInPage
}
