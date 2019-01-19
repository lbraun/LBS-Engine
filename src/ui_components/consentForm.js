'use strict';

const React = require('react');
const Ons = require('react-onsenui');

const config = require('../data_components/config.json');
const localeMenu = require('./localeMenu.js');

class ConsentForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleContinueButtonClick = this.handleContinueButtonClick.bind(this);
        this.state = {};
    }

    /**
     * Localize a string in the context of the sign-in page
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`consentForm.${string}`);
    }

    /**
     * Handle the change of a consent item
     * @param {Event} e the react event object
     */
    handleInputChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });

        this.setState({
            allBoxesChecked: this.state.volunteered
                && this.state.rightToQuit
                && this.state.dataRecording
                && this.state.goodBehavior
        });
    }

    /**
     * Handle a click on the continue button
     * @param {Event} e the react event object
     */
    handleContinueButtonClick(e) {
        this.props.pushUserUpdates({hasConsented: this.state.allBoxesChecked})
    }

    // Render the sign in page
    render() {
        return (
            <Ons.Page>
                <Ons.List>
                    <Ons.ListItem>
                        <div className='left'>
                            <h1>{this.l("title")}</h1>
                        </div>
                    </Ons.ListItem>
                    <Ons.ListItem>
                        <div className='left'>
                            {this.props.l("settings.language")}
                        </div>
                        <div className='right'>
                            <localeMenu.LocaleMenu
                                locale={this.props.locale}
                                handleLocaleChange={this.props.handleLocaleChange} />
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <p>{this.l("description")}</p>

                        <p>
                            <b>{this.l("rightToQuitInfoTitle")}:</b><br />
                            {this.l("rightToQuitInfo")}
                        </p>

                        <p>
                            <b>{this.l("dataRecordingInfoTitle")}:</b><br />
                            {this.l("dataRecordingInfo")}
                        </p>

                        <p>
                            <b>{this.l("moreInfoTitle")}:</b><br />
                            {this.l("moreInfo")} <a href={config.app.projectWebsite}>{this.props.l("app.projectsWebsite")}</a>.
                        </p>

                        <p>{this.l("ifYouHaveAnyQuestions")} <a href={`mailto:${config.app.adminEmail}`}>{config.app.adminEmail}</a>.</p>
                    </Ons.ListItem>
                    <Ons.ListItem>
                        <div>
                            <i>{this.l("instructions")}</i>
                        </div>
                    </Ons.ListItem>

                    <Ons.ListItem tappable={true}>
                        <label className='left'>
                            <Ons.Checkbox inputId="volunteered-check"
                                name="volunteered"
                                checked={this.state.volunteered}
                                onChange={this.handleInputChange} />
                        </label>
                        <label className='center' htmlFor="volunteered-check">
                            {this.l("volunteeredConsent")}
                        </label>
                    </Ons.ListItem>

                    <Ons.ListItem tappable={true}>
                        <label className='left'>
                            <Ons.Checkbox inputId="right-to-quit-check"
                                name="rightToQuit"
                                checked={this.state.rightToQuit}
                                onChange={this.handleInputChange} />
                        </label>
                        <label className='center' htmlFor="right-to-quit-check">
                            {this.l("rightToQuitConsent")}
                        </label>
                    </Ons.ListItem>

                    <Ons.ListItem tappable={true}>
                        <label className='left'>
                            <Ons.Checkbox inputId="data-recording-check"
                                name="dataRecording"
                                checked={this.state.dataRecording}
                                onChange={this.handleInputChange} />
                        </label>
                        <label className='center' htmlFor="data-recording-check">
                            {this.l("dataRecordingConsent")}
                        </label>
                    </Ons.ListItem>

                    <Ons.ListItem tappable={true}>
                        <label className='left'>
                            <Ons.Checkbox inputId="good-behavior-check"
                                name="goodBehavior"
                                checked={this.state.goodBehavior}
                                onChange={this.handleInputChange} />
                        </label>
                        <label className='center' htmlFor="good-behavior-check">
                            {this.l("goodBehaviorConsent")}
                        </label>
                    </Ons.ListItem>

                    <Ons.ListItem>
                        <div className='right'>
                            <Ons.Button
                                onClick={this.handleContinueButtonClick}
                                disabled={this.state.allBoxesChecked ? false : "true"}>
                                    {this.l("continue")}
                            </Ons.Button>
                        </div>
                    </Ons.ListItem>
                </Ons.List>
            </Ons.Page>
        )
    }
}

module.exports = {
    ConsentForm: ConsentForm
}
