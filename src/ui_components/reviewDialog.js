'use strict';
const React = require('react');
const Ons = require('react-onsenui');

/**
 * Dialog popup allowing the user to complet a review
 */
class ReviewDialog extends React.Component {
    constructor(props) {
        super(props);

        this.handleCancelClick = this.handleCancelClick.bind(this);
        this.handleSubmitClick = this.handleSubmitClick.bind(this);

        this.state = {
            _otherUserId: null,
            responses: {},
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
        var review = {
            _id: this.props.review._id,
            _userId: this.props.review._userId,
            _otherUserId: this.state._otherUserId,
            offerTitle: this.props.review.offerTitle,
            responses: this.state.responses,
            status: "submitted",
        };

        this.props.onSubmit(review);
    }

    render() {
        return(
            <Ons.Modal onCancel={this.props.onCancel}
                isOpen={!!this.props.review}
                cancelable>
                    <Ons.Page style={{height: "90%"}}>
                        <Ons.List>
                            {this.renderQuestions()}

                            <Ons.ListItem key={"submit"}>
                                <Ons.Button onClick={this.handleSubmitClick}>
                                    {this.l("submit")}
                                </Ons.Button>
                            </Ons.ListItem>

                            <Ons.ListItem key={"cancel"}>
                                <Ons.Button onClick={this.handleCancelClick}>
                                    {this.l("cancel")}
                                </Ons.Button>
                            </Ons.ListItem>
                        </Ons.List>
                    </Ons.Page>
            </Ons.Modal>
        );
    }

    renderQuestions() {
        if (!this.props.review) return null;

        var responses = this.props.review.responses;
        var questionListItems = [];

        questionListItems.push(
            <Ons.ListItem key={"otherUserId"}>
                <div className="list-item__title">
                    <b>To whom did you give your offer?</b>
                </div>
                <div className="list-item__subtitle">
                    <input type="text"
                        name="otherUserId"
                        className="text-input text-input--transparent"
                        style={{width: "100%"}}
                        placeholder={"Other user id"}
                        value={this.state._otherUserId}>
                    </input>
                </div>
            </Ons.ListItem>
        );

        for (var questionName in responses) {
            var response = responses[questionName];

            questionListItems.push(
                <Ons.ListItem key={questionName}>
                    <div className="list-item__title">
                        <b>{this.l(questionName)}</b>
                    </div>
                    <div className="list-item__subtitle">
                        <input type="text"
                            name={questionName}
                            className="text-input text-input--transparent"
                            style={{width: "100%"}}
                            value={this.state.responses[questionName]}>
                        </input>
                    </div>
                </Ons.ListItem>
            );
        }

        return questionListItems;
    }
}

module.exports = {
    ReviewDialog: ReviewDialog
}
