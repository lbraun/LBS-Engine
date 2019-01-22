'use strict';
const React = require('react');
const Ons = require('react-onsenui');

/**
 * Alert dialog allowing the user to confirm they really want to take an action
 */
class ConfirmDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Ons.AlertDialog
                isOpen={this.props.isOpen}
                onCancel={this.props.cancelAction}
                cancelable>
                    <div className="alert-dialog-title">
                        {this.props.l("app.areYouSure")}
                    </div>

                    <div className="alert-dialog-content">
                        {this.props.l("app.thisCannotBeUndone")}
                    </div>

                    <div className="alert-dialog-footer">
                        <Ons.Button onClick={this.props.cancelAction} className="alert-dialog-button">
                            {this.props.l("app.cancel")}
                        </Ons.Button>
                    </div>
                    <div className="alert-dialog-footer">
                        <Ons.Button onClick={this.props.confirmAction} className="alert-dialog-button">
                            {this.props.confirmActionName}
                        </Ons.Button>
                    </div>
            </Ons.AlertDialog>
        );
    }
}

module.exports = {
    ConfirmDialog: ConfirmDialog
}
