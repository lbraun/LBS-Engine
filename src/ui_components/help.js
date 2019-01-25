'use strict';

const React = require('react');
const Ons = require('react-onsenui');

const config = require('../data_components/config.json');

/**
 * Component for displaying the help page.
 */
class Help extends React.Component {
    constructor(props) {
        super(props);
        this.handleListItemClick = this.handleListItemClick.bind(this);
        this.onDeviceBackButton = this.onDeviceBackButton.bind(this);

        this.state = {
            rulesPageIsOpen: false,
            contactPageIsOpen: false,
            legalPageIsOpen: false,
        }
    }

    /**
     * Localize a string in the context of the help page
     * @param {string} string to be localized
     */
    l(string) {
        return this.props.l(`help.${string}`);
    }

    /**
     * Handle clicks on items in the list
     * @param {itemId} id of the item
     * @param {e} click event
     */
    handleListItemClick(item, e) {
        this.setState({
            rulesPageIsOpen: item == "rules",
            contactPageIsOpen: item == "contact",
            legalPageIsOpen: item == "legal",
        });
    }

    onDeviceBackButton() {
        this.setState({
            rulesPageIsOpen: false,
            contactPageIsOpen: false,
            legalPageIsOpen: false,
        });
    }

    render() {
        if (this.state.rulesPageIsOpen) {
            return this.renderPage("rules", this.renderRules);
        } else if (this.state.contactPageIsOpen) {
            return this.renderPage("contact", this.renderContact);
        } else if (this.state.legalPageIsOpen) {
            return this.renderPage("legal", this.renderLegal);
        } else {
            return (
                <Ons.Page>
                    <Ons.Row height="100%">
                        <Ons.Col verticalAlign="center">
                            <Ons.List>
                                {this.renderHelpListItems()}
                            </Ons.List>
                        </Ons.Col>
                    </Ons.Row>
                </Ons.Page>
            );
        }
    }

    renderHelpListItems() {
        var listItems = [];

        listItems.push(this.renderHelpListItem("rules"));
        listItems.push(this.renderHelpListItem("contact"));
        listItems.push(this.renderHelpListItem("legal"));

        return listItems;
    }

    renderHelpListItem(pageId) {
        return (
            <Ons.ListItem
                modifier={"chevron"}
                tappable={true}
                onClick={this.handleListItemClick.bind(this, pageId)}
                id={`help-list-item-${pageId}`}
                key={pageId}>
                    {this.l(pageId)}
            </Ons.ListItem>
        );
    }

    renderPage(pageName, renderContent) {
        return (
            <Ons.Page onDeviceBackButton={this.onDeviceBackButton}>
                <div style={{margin: "15px"}}>
                    <Ons.Button onClick={this.onDeviceBackButton}>
                        {this.props.l("app.back")}
                    </Ons.Button>

                    <h1>
                        {this.l(pageName)}
                    </h1>

                    {renderContent()}
                </div>
            </Ons.Page>
        );
    }

    renderRules() {
        return (
            <div>
                <p>
                    Hier nochmal alle WICHTIGEN REGELN zur Nutzung dieser Gruppe für euch zusammengefasst:

                    1. Hier sollen nur Beiträge gepostet werden von Sachen, die ihr VERSCHENKEN wollt. Der Name der Gruppe sagt deutlich: Wer etwas verschenkt, sollte keine Gegenleistungen erwarten. (Ansonsten: Kommentarlose Löschung des Beitrags.)

                    2. Wenn ihr etwas sucht, nutzt bitte die dafür vorgesehene Gruppe: [Übers Handy am besten über "Veranstaltungen" aufzurufen!!!] https://www.facebook.com/events/229226263869316/?ref=3

                    3. Gesuche, Verkäufe oder gar Werbung (dazu zählen auch Gutscheine bzw. Rabattcodes) sowie das Verschenken von lebenden und toten Tieren, tierschutzwidrigem Zubehör oder illegalen Artikel (Medikamente, Raubkopien, Plagiate) haben hier nichts zu suchen und werden kommentarlos gelöscht. (Bei Posts für den guten Zweck wird nach vorheriger (!) Absprache mit den Admins ein Auge zugedrückt.)

                    4. Verschenkt werden sollen hier Dinge, die nutzbar sind. Dies schließt volldefekte Artikel aus. Liegen nur kleine bekannte Defekte vor, die auch für Laien mit einfachen Handgriffen zu reparieren sind, so weist bitte darauf hin.

                    5. Wie ihr euer Geschenk vergebt, bleibt euch überlassen. Ob ihr z.B. nach dem first-come-first-served Verfahren vorgeht oder auslost, ihr entscheidet.

                    6. Löscht bitte alte Posts mit Dingen, die bereits erfolgreich verschenkt wurden.

                    7. Persönliche Nachrichten von Menschen außerhalb eurer Freunde-Liste landen gerne mal bei den Nachrichtenanfragen, welche ihr unter euren Nachrichten abrufen könnt. Schaut auch dort mal rein.

                    8. Gepöbel gegen andere Gruppenmitglieder und Admins sind nicht nett. Darum möchten wir so etwas hier nicht sehen... Ebenso ist das Blockieren von einem oder mehreren Admins nicht gestattet. Geldangebote führen zur sofortigen Blockierung.

                    9. Unzuverlässige Mitglieder sind - ohne Ausnahmen - den Admins zu melden. Lasst euch nicht durch scheinheilige Entschuldigungen verunsichern. Wir führen eine Liste auf der jeder einen "Freifahrtschein" hat.

                    !!! Denkt bitte daran: Bei Verstößen gegen die Gruppenregeln kann es passieren, dass wir die/denjenigen aus der Gruppe verweisen...!!!

                    PS: Falls Ihr keine Lust auf Facebook habt, gibt es in der Stadt auch noch mehrere Möglichkeiten, wo Ihr die Sachen direkt loswerden könnt. (Angaben ohne Gewähr)

                    Advent-Kirche, Horstmarer Landweg
                    AVM Recyclinghof Eulerstraße, Mecklenbeck und Roxel
                    Bushaltestelle Metzer Straße, Hammer Straße
                    Hotel Guter Hirte, St. Mauritz
                    Paul-Gerhard Haus im Café
                    Sankt Josef Kirche, Hammer Straße
                    Sankt Margareta Kirche, Hegerskamp
                    Skagerrakstraße / Warendorferstraße
                    Bücherregal Rosenstraße
                    Bücherregal Meesenstiege

                    Bei der Reparatur vermeintlich defekter Artikel könnt ihr hier Hilfe finden:
                    https://repaircafe-muenster.de/
                </p>

                <p>
                    For more see: <a href="https://groups.freecycle.org/group/BournemouthUK/admin/65978">https://groups.freecycle.org/group/BournemouthUK/admin/65978</a>.
                </p>
            </div>
        );
    }

    renderContact() {
        return (
            <div>
                {this.props.l("consentForm.ifYouHaveAnyQuestions")} <a href={`mailto:${config.app.adminEmail}`}>{config.app.adminEmail}</a>
            </div>
        );
    }

    renderLegal() {
        return (
            <div>We will take all precautions with your data.</div>
        );
    }
}


module.exports = {
    Help: Help
}
