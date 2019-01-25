'use strict';

const React = require('react');
const Ons = require('react-onsenui');

const localeMenu = require('./localeMenu.js');

class LsnsSurvey extends React.Component {
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmitClick = this.handleSubmitClick.bind(this);

        this.state = {
            question1: "",
            question2: "",
            question3: "",
            question4: "",
            question5: "",
            question6: "",
            validationFailed: false,
        };
    }

    /**
     * Localize a string in the context of the page
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`lsnsSurvey.${string}`);
    }

    /**
     * Handle the change of a form item
     * @param {Event} e the react event object
     */
    handleInputChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    /**
     * Handle clicks on the submit button
     * @param {e} click event
     */
    handleSubmitClick(e) {
        var validationFailed = !(
            this.state.question1
            && this.state.question2
            && this.state.question3
            && this.state.question4
            && this.state.question5
            && this.state.question6
        );

        this.setState({
            validationFailed: validationFailed
        });

        if (!validationFailed) {
            var lsnsSurvey = [
                {questionId: "question1", response: this.state.question1},
                {questionId: "question2", response: this.state.question2},
                {questionId: "question3", response: this.state.question3},
                {questionId: "question4", response: this.state.question4},
                {questionId: "question5", response: this.state.question5},
                {questionId: "question6", response: this.state.question6},
            ];

            this.props.pushUserUpdates({
                lsnsSurvey: lsnsSurvey,
                hasCompletedLsnsSurvey: true,
            });
        }
    }

    // Render the survey
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
                    </Ons.ListItem>

                    {this.renderQuestions()}
                    {this.renderValidationMessage()}

                    <Ons.ListItem id="submit-button">
                        <div className="right">
                            <Ons.Button onClick={this.handleSubmitClick}>
                                {this.props.l("app.next")}
                            </Ons.Button>
                        </div>
                    </Ons.ListItem>
                </Ons.List>
            </Ons.Page>
        )
    }

    // Render the lsnsSurvey questions
    renderQuestions() {
        var questionListItems = [];

        for (var i = 1; i <= 6; i++) {
            questionListItems.push(this.renderRadioQuestion(`question${i}`));
        }

        return questionListItems;
    }

    renderRadioQuestion(questionName) {
        return (
            <div key={questionName}>
                <Ons.ListItem key={questionName + "Question"}>
                    <div className="list-item__title" style={{marginTop: "50px"}}>
                        <b>{this.l(questionName)}</b>
                    </div>
                </Ons.ListItem>
                {this.renderRadioOptions(questionName)}
            </div>
        );
    }

    renderRadioOptions(questionName) {
        var answers = this.getAnswersFor(questionName);
        var answerOptions = [];

        for (var i = 0; i < answers.length; i++) {
            var answerKey = questionName + "Answer" + i;

            answerOptions.push(
                <Ons.ListItem key={answerKey} tappable={true}>
                    <label className="left">
                        <Ons.Radio
                            inputId={answerKey}
                            modifier="material"
                            name={questionName}
                            onChange={this.handleInputChange}
                            value={answers[i].value} />
                    </label>
                    <label htmlFor={answerKey} className="center">
                        {answers[i].text || this.l(answers[i].value)}
                    </label>
                </Ons.ListItem>
            );
        }

        return answerOptions;
    }

    getAnswersFor(questionName) {
        // 0 = None
        // 1 = One
        // 2 = Two
        // 3 = Three or four
        // 4 = Five to eight
        // 5 = Nine or more

        return [
            {value: "0"},
            {value: "1"},
            {value: "2"},
            {value: "3"},
            {value: "4"},
            {value: "5"},
        ];
    }

    renderValidationMessage() {
        if (this.state.validationFailed) {
            return (
                <Ons.ListItem key={"validationMessage"} style={{color: "#d9534f"}}>
                    <i>
                        {this.props.l("app.allFieldsMustBeCompleted")}
                    </i>
                </Ons.ListItem>
            );
        }
    }
}

module.exports = {
    LsnsSurvey: LsnsSurvey
}
