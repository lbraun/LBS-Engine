'use strict';
const React = require('react');
const Ons = require('react-onsenui');

const reportLink = require('./reportLink.js');

/**
 * Dialog popup allowing the user to complet a review
 */
class ReviewDialog extends React.Component {
    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmitClick = this.handleSubmitClick.bind(this);
        this.handleCancelClick = this.handleCancelClick.bind(this);

        this.state = this.defaultState();
    }

    defaultState() {
        return {
            _otherUserId: "",
            question1: "",
            question2: "",
            question3: "",
            question4: "",
            validationFailed: false,
        };
    }

    /**
     * Localize a string in the context of the dashboard
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`review.${string}`);
    }

    /**
     * Handle the change of a form element
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
     * Handle clicks on the cancel button
     * @param {e} click event
     */
    handleCancelClick(e) {
        this.props.onCancel();
    }

    /**
     * Handle clicks on the submit button
     * @param {e} click event
     */
    handleSubmitClick(e) {
        var validationFailed = !(
            this.state._otherUserId
            && this.state.question1
            && this.state.question2
            && this.state.question3
            && this.state.question4
        );

        this.setState({
            validationFailed: validationFailed
        });

        if (!validationFailed) {
            var review = {
                _id: this.props.review._id,
                _userId: this.props.review._userId,
                offerTitle: this.props.review.offerTitle,
                _otherUserId: this.state._otherUserId,
                question1: this.state.question1,
                question2: this.state.question2,
                question3: this.state.question3,
                question4: this.state.question4,
                status: "submitted",
            };

            this.props.onSubmit(review);
            this.setState(this.defaultState());
        }
    }

    render() {
        if (!this.props.review) {
            return null;
        }

        return(
            <Ons.Modal onCancel={this.props.onCancel}
                isOpen={!!this.props.review}
                cancelable>
                    <Ons.Page>
                        <Ons.List>
                            <Ons.ListItem key={"title"}>
                                <div className="list-item__title">
                                    <h3>
                                        {this.l("questionsAbout")} "{this.props.review.offerTitle}"
                                    </h3>
                                </div>
                            </Ons.ListItem>

                            {this.renderQuestions()}
                            {this.renderValidationMessage()}

                            <Ons.ListItem key={"buttons"}>
                                <div className="left">
                                    <Ons.Button
                                        onClick={this.handleCancelClick}
                                        style={{backgroundColor: "#d9534f"}}>
                                            {this.props.l("app.cancel")}
                                    </Ons.Button>
                                </div>
                                <div className="right">
                                    <Ons.Button onClick={this.handleSubmitClick}>
                                        {this.props.l("app.submit")}
                                    </Ons.Button>
                                </div>
                            </Ons.ListItem>

                            <Ons.ListItem key={"reportLink"}>
                                <reportLink.ReportLink
                                    currentUserId={this.props.currentUserId}
                                    l={this.props.l}
                                    otherUserId={this.props.review._otherUserId} />
                            </Ons.ListItem>
                        </Ons.List>
                    </Ons.Page>
            </Ons.Modal>
        );
    }

    renderQuestions() {
        var questionListItems = [];
        var questionName = "_otherUserId";

        questionListItems.push(this.renderQuestion(questionName));

        for (var i = 1; i <= 4; i++) {
            var questionName = `question${i}`;
            questionListItems.push(this.renderQuestion(questionName));
        }

        return questionListItems;
    }

    renderQuestion(questionName) {
        return (
            <Ons.ListItem key={questionName}>
                <div className="list-item__title">
                    <b>{this.l(questionName)}</b>
                </div>
                <div className="list-item__subtitle" style={{textAlign: "right"}}>
                    <Ons.Select modifier="material"
                        name={questionName}
                        value={this.state[questionName]}
                        onChange={this.handleInputChange}>
                            {this.renderAnswerOptions(questionName)}
                    </Ons.Select>
                </div>
            </Ons.ListItem>
        );
    }

    renderAnswerOptions(questionName) {
        var answers = this.getAnswersFor(questionName);
        var answerOptions = [];

        for (var i = 0; i < answers.length; i++) {
            answerOptions.push(
                <option value={answers[i].value} key={i}>
                    {answers[i].text || this.l(answers[i].value)}
                </option>
            );
        }

        return answerOptions;
    }

    getAnswersFor(questionName) {
        var answerKey = {
            _otherUserId: this.props.users.map(this.asSelectOption),
            question1: [
                {value: "email"},
                {value: "facebook"},
                {value: "phone"},
                {value: "whatsapp"},
                {value: "other"},
            ],
            question2: [
                {value: "atMyHome"},
                {value: "atTheirHome"},
                {value: "atSomeoneElsesHome"},
                {value: "atMyWork"},
                {value: "atTheirWork"},
                {value: "inAnotherPublicPlace"},
                {value: "weDidntMeetInPerson"},
            ],
            question3: [
                {value: "verySatisfied"},
                {value: "satisfied"},
                {value: "slightlyDissatisfied"},
                {value: "veryDissatisfied"},
            ],
            question4: [
                {value: "veryLikely"},
                {value: "likely"},
                {value: "unlikely"},
                {value: "veryUnlikely"},
            ],
        };

        return answerKey[questionName] || [];
    }

    asSelectOption(user) {
        return {value: user._id, text: user.name}
    }

    renderValidationMessage() {
        if (this.state.validationFailed) {
            return (
                <Ons.ListItem key={"validationMessage"} style={{color: "#d9534f"}}>
                    <i>
                        {this.l("validationFailed")}
                    </i>
                </Ons.ListItem>
            );
        }
    }
}

module.exports = {
    ReviewDialog: ReviewDialog
}
