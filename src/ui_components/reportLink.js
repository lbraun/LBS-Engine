'use strict';
const React = require('react');
const Ons = require('react-onsenui');

const config = require('../data_components/config.json');

class ReportLink extends React.Component {
    constructor(props) {
        super(props);
    }

    // Render a prefilled mailto link
    render() {
        var mailtoLink = "mailto:";
        mailtoLink += config.app.adminEmail;
        mailtoLink += "?subject=";
        mailtoLink += this.props.l("app.reportEmailSubject");
        mailtoLink += ": " + this.props.currentUserId;
        mailtoLink += " > " + this.props.otherUserId;
        mailtoLink += "&body=";
        mailtoLink += this.props.l("app.reportEmailBody");

        return (
            <a href={mailtoLink}>
                {this.props.l("app.report")}
            </a>
        )
    }
}

module.exports = {
    ReportLink: ReportLink
}
