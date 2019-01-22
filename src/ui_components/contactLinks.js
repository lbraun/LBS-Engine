'use strict';
const React = require('react');
const Ons = require('react-onsenui');

class ContactLinks extends React.Component {
    constructor(props) {
        super(props);
    }

    // Render contact links as icons
    render() {
        var links = [];
        var contactInfo = this.props.user && this.props.user.contactInformation;

        if (!contactInfo) {
            return null;
        }

        var contactTypes = [
            {setting: "useEmail",    contactType: "email"},
            {setting: "useFacebook", contactType: "facebook"},
            {setting: "usePhone",    contactType: "phone"},
            {setting: "useWhatsapp", contactType: "whatsapp"},
        ];

        for (var i = contactTypes.length - 1; i >= 0; i--) {
            var setting = contactTypes[i].setting;
            var contactType = contactTypes[i].contactType;

            if (contactInfo[setting]) {
                if (this.props.small) {
                    links.push(
                        <Ons.Icon
                            style={{marginRight: "15px"}}
                            icon={`md-${contactType}`}
                            key={contactType} />
                    )
                } else {
                    links.push(
                        <a href={this.getContactLink(contactInfo, contactType)}
                            className="button"
                            style={{
                                marginRight: "5px",
                                height: "40px",
                                width: "40px",
                                textAlign: "center",
                                color: "white",
                            }}
                            key={contactType} >
                                <Ons.Icon icon={`md-${contactType}`} />
                        </a>
                    )
                }
            }
        }

        return links;
    }

    getContactLink(contactInfo, contactType) {
        if (contactType == "facebook") {
            return "https://m.me/" + contactInfo.facebook;
        } else if (contactType == "whatsapp") {
            return "https://wa.me/" + contactInfo.whatsapp;
        } else if (contactType == "email") {
            return "mailto:" + contactInfo.email;
        } else if (contactType == "phone") {
            return "tel:" + contactInfo.phone;
        } else {
            console.log("Error: invalid contact type: " + contactType);
        }
    }
}

module.exports = {
    ContactLinks: ContactLinks
}
