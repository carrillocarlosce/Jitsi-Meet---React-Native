/* global APP, $, config, interfaceConfig */
/*
 * Copyright @ 2015 Atlassian Pty Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import UIEvents from "../../../service/UI/UIEvents";
import UIUtil from '../util/UIUtil';
import VideoLayout from '../videolayout/VideoLayout';
import Feedback from '../Feedback.js';
import Toolbar from '../toolbars/Toolbar';
import BottomToolbar from '../toolbars/BottomToolbar';


/**
 * Indicates if the recording button should be enabled.
 *
 * @returns {boolean} {true} if the
 * @private
 */
function _isRecordingButtonEnabled() {
    return interfaceConfig.TOOLBAR_BUTTONS.indexOf("recording") !== -1
            && config.enableRecording && APP.conference.isRecordingSupported();
}

/**
 * Request live stream token from the user.
 * @returns {Promise}
 */
function _requestLiveStreamId() {
    const msg = APP.translation.generateTranslationHTML("dialog.liveStreaming");
    const token = APP.translation.translateString("dialog.streamKey");
    const cancelButton
        = APP.translation.generateTranslationHTML("dialog.Cancel");
    const backButton = APP.translation.generateTranslationHTML("dialog.Back");
    const startStreamingButton
        = APP.translation.generateTranslationHTML("dialog.startLiveStreaming");
    const streamIdRequired
        = APP.translation.generateTranslationHTML(
            "liveStreaming.streamIdRequired");

    return new Promise(function (resolve, reject) {
        let dialog = APP.UI.messageHandler.openDialogWithStates({
            state0: {
                html:
                    `<h2>${msg}</h2>
                    <input name="streamId" type="text"
                    data-i18n="[placeholder]dialog.streamKey"
                    placeholder="${token}" autofocus>`,
                persistent: false,
                buttons: [
                    {title: cancelButton, value: false},
                    {title: startStreamingButton, value: true}
                ],
                focus: ':input:first',
                defaultButton: 1,
                submit: function (e, v, m, f) {
                    e.preventDefault();

                    if (v) {
                        if (f.streamId && f.streamId.length > 0) {
                            resolve(UIUtil.escapeHtml(f.streamId));
                            dialog.close();
                            return;
                        }
                        else {
                            dialog.goToState('state1');
                            return false;
                        }
                    } else {
                        reject(APP.UI.messageHandler.CANCEL);
                        dialog.close();
                        return false;
                    }
                }
            },

            state1: {
                html: `<h2>${msg}</h2> ${streamIdRequired}`,
                persistent: false,
                buttons: [
                    {title: cancelButton, value: false},
                    {title: backButton, value: true}
                ],
                focus: ':input:first',
                defaultButton: 1,
                submit: function (e, v, m, f) {
                    e.preventDefault();
                    if (v === 0) {
                        reject(APP.UI.messageHandler.CANCEL);
                        dialog.close();
                    } else {
                        dialog.goToState('state0');
                    }
                }
            }
        });
    });
}

/**
 * Request recording token from the user.
 * @returns {Promise}
 */
function _requestRecordingToken () {
    let msg = APP.translation.generateTranslationHTML("dialog.recordingToken");
    let token = APP.translation.translateString("dialog.token");

    return new Promise(function (resolve, reject) {
        APP.UI.messageHandler.openTwoButtonDialog(
            null, null, null,
            `<h2>${msg}</h2>
             <input name="recordingToken" type="text"
                    data-i18n="[placeholder]dialog.token"
                    placeholder="${token}" autofocus>`,
            false, "dialog.Save",
            function (e, v, m, f) {
                if (v && f.recordingToken) {
                    resolve(UIUtil.escapeHtml(f.recordingToken));
                } else {
                    reject(APP.UI.messageHandler.CANCEL);
                }
            },
            null,
            function () { },
            ':input:first'
        );
    });
}

/**
 * Shows a prompt dialog to the user when they have toggled off the recording.
 *
 * @param recordingType the recording type
 * @returns {Promise}
 * @private
 */
function _showStopRecordingPrompt (recordingType) {
    var title;
    var message;
    var buttonKey;
    if (recordingType === "jibri") {
        title = "dialog.liveStreaming";
        message = "dialog.stopStreamingWarning";
        buttonKey = "dialog.stopLiveStreaming";
    }
    else {
        title = "dialog.recording";
        message = "dialog.stopRecordingWarning";
        buttonKey = "dialog.stopRecording";
    }

    return new Promise(function (resolve, reject) {
        APP.UI.messageHandler.openTwoButtonDialog(
            title,
            null,
            message,
            null,
            false,
            buttonKey,
            function(e,v,m,f) {
                if (v) {
                    resolve();
                } else {
                    reject();
                }
            }
        );
    });
}

/**
 * Moves the element given by {selector} to the top right corner of the screen.
 * @param selector the selector for the element to move
 * @param move {true} to move the element, {false} to move it back to its intial
 * position
 */
function moveToCorner(selector, move) {
    let moveToCornerClass = "moveToCorner";

    if (move && !selector.hasClass(moveToCornerClass))
        selector.addClass(moveToCornerClass);
    else
        selector.removeClass(moveToCornerClass);
}

/**
 * The status of the recorder.
 * FIXME: Those constants should come from the library.
 * @type {{ON: string, OFF: string, AVAILABLE: string,
 * UNAVAILABLE: string, PENDING: string}}
 */
var Status = {
    ON: "on",
    OFF: "off",
    AVAILABLE: "available",
    UNAVAILABLE: "unavailable",
    PENDING: "pending",
    ERROR: "error",
    FAILED: "failed",
    BUSY: "busy"
};

/**
 * Manages the recording user interface and user experience.
 * @type {{init, initRecordingButton, showRecordingButton, updateRecordingState,
 * updateRecordingUI, checkAutoRecord}}
 */
var Recording = {
    /**
     * Initializes the recording UI.
     */
    init (emitter, recordingType) {
        this.eventEmitter = emitter;

        this.updateRecordingState(APP.conference.getRecordingState());

        this.initRecordingButton(recordingType);

        // If I am a recorder then I publish my recorder custom role to notify
        // everyone.
        if (config.iAmRecorder) {
            VideoLayout.enableDeviceAvailabilityIcons(
                APP.conference.localId, false);
            VideoLayout.setLocalVideoVisible(false);
            Feedback.enableFeedback(false);
            Toolbar.enable(false);
            BottomToolbar.enable(false);
        }
    },

    /**
     * Initialise the recording button.
     */
    initRecordingButton(recordingType) {
        let selector = $('#toolbar_button_record');

        if (recordingType === 'jibri') {
            this.baseClass = "fa fa-play-circle";
            this.recordingTitle = "dialog.liveStreaming";
            this.recordingOnKey = "liveStreaming.on";
            this.recordingOffKey = "liveStreaming.off";
            this.recordingPendingKey = "liveStreaming.pending";
            this.failedToStartKey = "liveStreaming.failedToStart";
            this.recordingErrorKey = "liveStreaming.error";
            this.recordingButtonTooltip = "liveStreaming.buttonTooltip";
            this.recordingUnavailable = "liveStreaming.unavailable";
            this.recordingBusy = "liveStreaming.busy";
        }
        else {
            this.baseClass = "icon-recEnable";
            this.recordingTitle = "dialog.recording";
            this.recordingOnKey = "recording.on";
            this.recordingOffKey = "recording.off";
            this.recordingPendingKey = "recording.pending";
            this.failedToStartKey = "recording.failedToStart";
            this.recordingErrorKey = "recording.error";
            this.recordingButtonTooltip = "recording.buttonTooltip";
            this.recordingUnavailable = "recording.unavailable";
            this.recordingBusy = "liveStreaming.busy";
        }

        selector.addClass(this.baseClass);
        selector.attr("data-i18n", "[content]" + this.recordingButtonTooltip);
        selector.attr("content",
            APP.translation.translateString(this.recordingButtonTooltip));

        var self = this;
        selector.click(function () {
            switch (self.currentState) {
                case Status.ON:
                case Status.PENDING: {
                    _showStopRecordingPrompt(recordingType).then(() =>
                        self.eventEmitter.emit(UIEvents.RECORDING_TOGGLED));
                    break;
                }
                case Status.AVAILABLE:
                case Status.OFF: {
                    if (recordingType === 'jibri')
                        _requestLiveStreamId().then((streamId) => {
                            self.eventEmitter.emit( UIEvents.RECORDING_TOGGLED,
                                {streamId: streamId});
                        }).catch(
                            reason => {
                                if (reason !== APP.UI.messageHandler.CANCEL)
                                    console.error(reason);
                            }
                        );
                    else {
                        if (self.predefinedToken) {
                            self.eventEmitter.emit( UIEvents.RECORDING_TOGGLED,
                                {token: self.predefinedToken});
                            return;
                        }

                        _requestRecordingToken().then((token) => {
                            self.eventEmitter.emit( UIEvents.RECORDING_TOGGLED,
                                {token: token});
                        }).catch(
                            reason => {
                                if (reason !== APP.UI.messageHandler.CANCEL)
                                    console.error(reason);
                            }
                        );
                    }
                    break;
                }
                case Status.BUSY: {
                    APP.UI.messageHandler.openMessageDialog(
                        self.recordingTitle,
                        self.recordingBusy
                    );
                    break;
                }
                default: {
                    APP.UI.messageHandler.openMessageDialog(
                        self.recordingTitle,
                        self.recordingUnavailable
                    );
                }
            }
        });
    },

    /**
     * Shows or hides the 'recording' button.
     * @param show {true} to show the recording button, {false} to hide it
     */
    showRecordingButton (show) {
        if (_isRecordingButtonEnabled() && show) {
            $('#toolbar_button_record').css({display: "inline-block"});
        } else {
            $('#toolbar_button_record').css({display: "none"});
        }
    },

    /**
     * Updates the recording state UI.
     * @param recordingState gives us the current recording state
     */
    updateRecordingState(recordingState, error) {
        // I'm the recorder, so I don't want to see any UI related to states.
        if (config.iAmRecorder)
            return;

        // If there's no state change, we ignore the update.
        if (!recordingState || this.currentState === recordingState)
            return;

        this.updateRecordingUI(recordingState, error);
    },

    /**
     * Sets the state of the recording button.
     * @param recordingState gives us the current recording state
     */
    updateRecordingUI (recordingState, error) {
        let buttonSelector = $('#toolbar_button_record');

        let oldState = this.currentState;
        this.currentState = recordingState;

        // TODO: handle recording state=available
        if (recordingState === Status.ON) {

            buttonSelector.removeClass(this.baseClass);
            buttonSelector.addClass(this.baseClass + " active");

            this._updateStatusLabel(this.recordingOnKey, false);
        }
        else if (recordingState === Status.OFF
                || recordingState === Status.UNAVAILABLE
                || recordingState === Status.BUSY
                || recordingState === Status.FAILED) {

            // We don't want to do any changes if this is
            // an availability change.
            if (oldState !== Status.ON
                && oldState !== Status.PENDING)
                return;

            buttonSelector.removeClass(this.baseClass + " active");
            buttonSelector.addClass(this.baseClass);

            let messageKey;
            if (oldState === Status.PENDING)
                messageKey = this.failedToStartKey;
            else
                messageKey = this.recordingOffKey;

            this._updateStatusLabel(messageKey, true);

            setTimeout(function(){
                $('#recordingLabel').css({display: "none"});
            }, 5000);
        }
        else if (recordingState === Status.PENDING) {

            buttonSelector.removeClass(this.baseClass + " active");
            buttonSelector.addClass(this.baseClass);

            this._updateStatusLabel(this.recordingPendingKey, true);
        }
        else if (recordingState === Status.ERROR
                    || recordingState === Status.FAILED) {
            buttonSelector.removeClass(this.baseClass + " active");
            buttonSelector.addClass(this.baseClass);

            this._updateStatusLabel(this.recordingErrorKey, true);
            console.log("Recording failed for the following reason: ", error);
        }

        let labelSelector = $('#recordingLabel');

        // We don't show the label for available state.
        if (recordingState !== Status.AVAILABLE
            && !labelSelector.is(":visible"))
            labelSelector.css({display: "inline-block"});
    },
    // checks whether recording is enabled and whether we have params
    // to start automatically recording
    checkAutoRecord () {
        if (_isRecordingButtonEnabled && config.autoRecord) {
            this.predefinedToken = UIUtil.escapeHtml(config.autoRecordToken);
            this.eventEmitter.emit(UIEvents.RECORDING_TOGGLED,
                                    this.predefinedToken);
        }
    },
    /**
     * Updates the status label.
     * @param textKey the text to show
     * @param isCentered indicates if the label should be centered on the window
     * or moved to the top right corner.
     */
    _updateStatusLabel(textKey, isCentered) {
        let labelSelector = $('#recordingLabel');

        moveToCorner(labelSelector, !isCentered);

        labelSelector.attr("data-i18n", textKey);
        labelSelector.text(APP.translation.translateString(textKey));
    }
};

export default Recording;
