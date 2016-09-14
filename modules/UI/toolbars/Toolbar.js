/* global APP, $, config, interfaceConfig, JitsiMeetJS */
/* jshint -W101 */
import UIUtil from '../util/UIUtil';
import UIEvents from '../../../service/UI/UIEvents';
import SideContainerToggler from "../side_pannels/SideContainerToggler";

let roomUrl = null;
let emitter = null;


/**
 * Opens the invite link dialog.
 */
function openLinkDialog () {
    let inviteAttributes;

    if (roomUrl === null) {
        inviteAttributes = 'data-i18n="[value]roomUrlDefaultMsg" value="' +
            APP.translation.translateString("roomUrlDefaultMsg") + '"';
    } else {
        inviteAttributes = "value=\"" + encodeURI(roomUrl) + "\"";
    }

    let title = APP.translation.generateTranslationHTML("dialog.shareLink");
    APP.UI.messageHandler.openTwoButtonDialog(
        null, null, null,
        '<h2>' + title + '</h2>'
        + '<input id="inviteLinkRef" type="text" '
        + inviteAttributes + ' onclick="this.select();" readonly>',
        false, "dialog.Invite",
        function (e, v) {
            if (v && roomUrl) {
                JitsiMeetJS.analytics.sendEvent('toolbar.invite.button');
                emitter.emit(UIEvents.USER_INVITED, roomUrl);
            }
            else {
                JitsiMeetJS.analytics.sendEvent('toolbar.invite.cancel');
            }
        },
        function (event) {
            if (roomUrl) {
                document.getElementById('inviteLinkRef').select();
            } else {
                if (event && event.target) {
                    $(event.target).find('button[value=true]')
                        .prop('disabled', true);
                }
            }
        },
        function (e, v, m, f) {
            if(!v && !m && !f)
                JitsiMeetJS.analytics.sendEvent('toolbar.invite.close');
        }
    );
}

const buttonHandlers = {
    "toolbar_button_profile": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.profile.toggled');
        emitter.emit(UIEvents.TOGGLE_PROFILE);
    },
    "toolbar_button_mute": function () {
        let sharedVideoManager = APP.UI.getSharedVideoManager();

        if (APP.conference.audioMuted) {
            // If there's a shared video with the volume "on" and we aren't
            // the video owner, we warn the user
            // that currently it's not possible to unmute.
            if (sharedVideoManager
                && sharedVideoManager.isSharedVideoVolumeOn()
                && !sharedVideoManager.isSharedVideoOwner()) {
                UIUtil.animateShowElement(
                    $("#unableToUnmutePopup"), true, 5000);
            }
            else {
                JitsiMeetJS.analytics.sendEvent('toolbar.audio.unmuted');
                emitter.emit(UIEvents.AUDIO_MUTED, false, true);
            }
        } else {
            JitsiMeetJS.analytics.sendEvent('toolbar.audio.muted');
            emitter.emit(UIEvents.AUDIO_MUTED, true, true);
        }
    },
    "toolbar_button_camera": function () {
        if (APP.conference.videoMuted) {
            JitsiMeetJS.analytics.sendEvent('toolbar.video.enabled');
            emitter.emit(UIEvents.VIDEO_MUTED, false);
        } else {
            JitsiMeetJS.analytics.sendEvent('toolbar.video.disabled');
            emitter.emit(UIEvents.VIDEO_MUTED, true);
        }
    },
    "toolbar_button_security": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.lock.clicked');
        emitter.emit(UIEvents.ROOM_LOCK_CLICKED);
    },
    "toolbar_button_link": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.invite.clicked');
        openLinkDialog();
    },
    "toolbar_button_chat": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.chat.toggled');
        emitter.emit(UIEvents.TOGGLE_CHAT);
    },
    "toolbar_contact_list": function () {
        JitsiMeetJS.analytics.sendEvent(
            'toolbar.contacts.toggled');
        emitter.emit(UIEvents.TOGGLE_CONTACT_LIST);
    },
    "toolbar_button_etherpad": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.etherpad.clicked');
        emitter.emit(UIEvents.ETHERPAD_CLICKED);
    },
    "toolbar_button_sharedvideo": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.sharedvideo.clicked');
        emitter.emit(UIEvents.SHARED_VIDEO_CLICKED);
    },
    "toolbar_button_desktopsharing": function () {
        if (APP.conference.isSharingScreen) {
            JitsiMeetJS.analytics.sendEvent('toolbar.screen.disabled');
        } else {
            JitsiMeetJS.analytics.sendEvent('toolbar.screen.enabled');
        }
        emitter.emit(UIEvents.TOGGLE_SCREENSHARING);
    },
    "toolbar_button_fullScreen": function() {
        JitsiMeetJS.analytics.sendEvent('toolbar.fullscreen.enabled');
        UIUtil.buttonClick("toolbar_button_fullScreen",
            "icon-full-screen icon-exit-full-screen");
        emitter.emit(UIEvents.FULLSCREEN_TOGGLE);
    },
    "toolbar_button_sip": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.sip.clicked');
        showSipNumberInput();
    },
    "toolbar_button_dialpad": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.sip.dialpad.clicked');
        dialpadButtonClicked();
    },
    "toolbar_button_settings": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.settings.toggled');
        emitter.emit(UIEvents.TOGGLE_SETTINGS);
    },
    "toolbar_button_hangup": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.hangup');
        emitter.emit(UIEvents.HANGUP);
    },
    "toolbar_button_login": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.authenticate.login.clicked');
        emitter.emit(UIEvents.AUTH_CLICKED);
    },
    "toolbar_button_logout": function () {
        JitsiMeetJS.analytics.sendEvent('toolbar.authenticate.logout.clicked');
        // Ask for confirmation
        APP.UI.messageHandler.openTwoButtonDialog(
            "dialog.logoutTitle",
            null,
            "dialog.logoutQuestion",
            null,
            false,
            "dialog.Yes",
            function (evt, yes) {
                if (yes) {
                    emitter.emit(UIEvents.LOGOUT);
                }
            }
        );
    },
    "toolbar_film_strip": function () {
        JitsiMeetJS.analytics.sendEvent(
            'toolbar.filmstrip.toggled');
        emitter.emit(UIEvents.TOGGLE_FILM_STRIP);
    },
    "toolbar_button_raisehand": function () {
        JitsiMeetJS.analytics.sendEvent(
            'toolbar.raiseHand.clicked');
        APP.conference.maybeToggleRaisedHand();
    }
};

const defaultToolbarButtons = {
    'microphone': {
        id: 'toolbar_button_mute',
        className: "button icon-microphone",
        shortcut: 'M',
        shortcutAttr: 'mutePopover',
        shortcutFunc: function() {
            JitsiMeetJS.analytics.sendEvent('shortcut.audiomute.toggled');
            APP.conference.toggleAudioMuted();
        },
        shortcutDescription: "keyboardShortcuts.mute",
        popups: [
            {
                id: "micMutedPopup",
                className: "loginmenu",
                dataAttr: "[html]toolbar.micMutedPopup"
            },
            {
                id: "unableToUnmutePopup",
                className: "loginmenu",
                dataAttr: "[html]toolbar.unableToUnmutePopup"
            }
        ],
        content: "Mute / Unmute",
        i18n: "[content]toolbar.mute"
    },
    'camera': {
        id: 'toolbar_button_camera',
        className: "button icon-camera",
        shortcut: 'V',
        shortcutAttr: 'toggleVideoPopover',
        shortcutFunc: function() {
            JitsiMeetJS.analytics.sendEvent('shortcut.videomute.toggled');
            APP.conference.toggleVideoMuted();
        },
        shortcutDescription: "keyboardShortcuts.videoMute",
        content: "Start / stop camera",
        i18n: "[content]toolbar.videomute"
    },
    'desktop': {
        id: 'toolbar_button_desktopsharing',
        className: 'button icon-share-desktop',
        shortcut: 'D',
        shortcutAttr: 'toggleDesktopSharingPopover',
        shortcutFunc: function() {
            JitsiMeetJS.analytics.sendEvent('shortcut.screen.toggled');
            APP.conference.toggleScreenSharing();
        },
        shortcutDescription: 'keyboardShortcuts.toggleScreensharing',
        content: 'Share screen',
        i18n: '[content]toolbar.sharescreen'
    },
    'security': {
        id: 'toolbar_button_security'
    },
    'invite': {
        id: 'toolbar_button_link',
        className: 'button icon-link',
        content: 'Invite others',
        i18n: '[content]toolbar.invite'
    },
    'chat': {
        id: 'toolbar_button_chat',
        shortcut: 'C',
        shortcutAttr: 'toggleChatPopover',
        shortcutFunc: function() {
            JitsiMeetJS.analytics.sendEvent('shortcut.chat.toggled');
            APP.UI.toggleChat();
        },
        shortcutDescription: 'keyboardShortcuts.toggleChat',
        sideContainerId: 'chat_container'
    },
    'contacts': {
        id: 'toolbar_contact_list',
        sideContainerId: 'contacts_container'
    },
    'profile': {
        id: 'toolbar_button_profile',
        sideContainerId: 'profile_container'
    },
    'etherpad': {
        id: 'toolbar_button_etherpad'
    },
    'fullscreen': {
        id: 'toolbar_button_fullScreen',
        className: "button icon-full-screen",
        shortcut: 'F',
        shortcutAttr: 'toggleFullscreenPopover',
        shortcutFunc: function() {
            JitsiMeetJS.analytics.sendEvent('shortcut.fullscreen.toggled');
            APP.UI.toggleFullScreen();
        },
        shortcutDescription: "keyboardShortcuts.toggleChat",
        content: "Enter / Exit Full Screen",
        i18n: "[content]toolbar.fullscreen"
    },
    'settings': {
        id: 'toolbar_button_settings',
        sideContainerId: "settings_container"
    },
    'hangup': {
        id: 'toolbar_button_hangup',
        className: "button icon-hangup",
        content: "Hang Up",
        i18n: "[content]toolbar.hangup"
    },
    'filmstrip': {
        id: 'toolbar_film_strip',
        shortcut: "F",
        shortcutAttr: "filmstripPopover",
        shortcutFunc: function() {
            JitsiMeetJS.analytics.sendEvent("shortcut.film.toggled");
            APP.UI.toggleFilmStrip();
        },
        shortcutDescription: "keyboardShortcuts.toggleFilmstrip"
    },
    'raisehand': {
        id: "toolbar_button_raisehand",
        className: "button icon-raised-hand",
        shortcut: "R",
        shortcutAttr: "raiseHandPopover",
        shortcutFunc: function() {
            JitsiMeetJS.analytics.sendEvent("shortcut.raisehand.clicked");
            APP.conference.maybeToggleRaisedHand();
        },
        shortcutDescription: "keyboardShortcuts.raiseHand",
        content: "Raise Hand",
        i18n: "[content]toolbar.raiseHand"
    }
};

function dialpadButtonClicked() {
    //TODO show the dialpad box
}

function showSipNumberInput () {
    let defaultNumber = config.defaultSipNumber
        ? config.defaultSipNumber
        : '';

    let sipMsg = APP.translation.generateTranslationHTML("dialog.sipMsg");
    APP.UI.messageHandler.openTwoButtonDialog(
        null, null, null,
        `<h2>${sipMsg}</h2>
            <input name="sipNumber" type="text" value="${defaultNumber}" autofocus>`,
        false, "dialog.Dial",
        function (e, v, m, f) {
            if (v && f.sipNumber) {
                emitter.emit(UIEvents.SIP_DIAL, f.sipNumber);
            }
        },
        null, null, ':input:first'
    );
}

const Toolbar = {
    init (eventEmitter) {
        emitter = eventEmitter;
        // The toolbar is enabled by default.
        this.enabled = true;
        this.toolbarSelector = $("#mainToolbarContainer");
        this.extendedToolbarSelector = $("#extendedToolbar");

        // First hide all disabled buttons in the extended toolbar.
        // TODO: Make the extended toolbar dynamically created.
        UIUtil.hideDisabledButtons(defaultToolbarButtons);

        // Initialise the main toolbar. The main toolbar will only take into
        // account it's own configuration from interface_config.
        this._initMainToolbarButtons();

        Object.keys(defaultToolbarButtons).forEach(
            id => {
                if (UIUtil.isButtonEnabled(id)) {
                    var button = defaultToolbarButtons[id];

                    if (button.shortcut)
                        APP.keyboardshortcut.registerShortcut(
                            button.shortcut,
                            button.shortcutAttr,
                            button.shortcutFunc,
                            button.shortcutDescription
                        );
                }
            }
        );

        Object.keys(buttonHandlers).forEach(
            buttonId => $(`#${buttonId}`).click(function(event) {
                !$(this).prop('disabled') && buttonHandlers[buttonId](event);
            })
        );

        APP.UI.addListener(UIEvents.SIDE_TOOLBAR_CONTAINER_TOGGLED,
            function(containerId, isVisible) {
                Toolbar._handleSideToolbarContainerToggled( containerId,
                                                            isVisible);
            });

        if(!APP.tokenData.isGuest) {
            $("#toolbar_button_profile").addClass("unclickable");
        }
    },
    /**
     * Enables / disables the toolbar.
     * @param {e} set to {true} to enable the toolbar or {false}
     * to disable it
     */
    enable (e) {
        this.enabled = e;
        if (!e && this.isVisible())
            this.hide(false);
    },
    /**
     * Indicates if the bottom toolbar is currently enabled.
     * @return {this.enabled}
     */
    isEnabled() {
        return this.enabled;
    },
    /**
     * Updates the room invite url.
     */
    updateRoomUrl (newRoomUrl) {
        roomUrl = newRoomUrl;

        // If the invite dialog has been already opened we update the
        // information.
        let inviteLink = document.getElementById('inviteLinkRef');
        if (inviteLink) {
            inviteLink.value = roomUrl;
            inviteLink.select();
            $('#inviteLinkRef').parent()
                .find('button[value=true]').prop('disabled', false);
        }
    },

    /**
     * Unlocks the lock button state.
     */
    unlockLockButton () {
        if ($("#toolbar_button_security").hasClass("icon-security-locked"))
            UIUtil.buttonClick("toolbar_button_security",
                                "icon-security icon-security-locked");
    },

    /**
     * Updates the lock button state to locked.
     */
    lockLockButton () {
        if ($("#toolbar_button_security").hasClass("icon-security"))
            UIUtil.buttonClick("toolbar_button_security",
                                "icon-security icon-security-locked");
    },

    /**
     * Shows or hides authentication button
     * @param show <tt>true</tt> to show or <tt>false</tt> to hide
     */
    showAuthenticateButton (show) {
        if (UIUtil.isButtonEnabled('authentication') && show) {
            $('#authentication').css({display: "inline"});
        } else {
            $('#authentication').css({display: "none"});
        }
    },

    showEtherpadButton () {
        if (!$('#toolbar_button_etherpad').is(":visible")) {
            $('#toolbar_button_etherpad').css({display: 'inline-block'});
        }
    },

    // Shows or hides the 'shared video' button.
    showSharedVideoButton () {
        if (UIUtil.isButtonEnabled('sharedvideo')
                && config.disableThirdPartyRequests !== true) {
            $('#toolbar_button_sharedvideo').css({display: "inline-block"});
        } else {
            $('#toolbar_button_sharedvideo').css({display: "none"});
        }
    },

    // checks whether desktop sharing is enabled and whether
    // we have params to start automatically sharing
    checkAutoEnableDesktopSharing () {
        if (UIUtil.isButtonEnabled('desktop')
            && config.autoEnableDesktopSharing) {
            emitter.emit(UIEvents.TOGGLE_SCREENSHARING);
        }
    },

    // Shows or hides SIP calls button
    showSipCallButton (show) {
        if (APP.conference.sipGatewayEnabled()
            && UIUtil.isButtonEnabled('sip') && show) {
            $('#toolbar_button_sip').css({display: "inline-block"});
        } else {
            $('#toolbar_button_sip').css({display: "none"});
        }
    },

    // Shows or hides the dialpad button
    showDialPadButton (show) {
        if (UIUtil.isButtonEnabled('dialpad') && show) {
            $('#toolbar_button_dialpad').css({display: "inline-block"});
        } else {
            $('#toolbar_button_dialpad').css({display: "none"});
        }
    },

    /**
     * Displays user authenticated identity name(login).
     * @param authIdentity identity name to be displayed.
     */
    setAuthenticatedIdentity (authIdentity) {
        if (authIdentity) {
            let selector = $('#toolbar_auth_identity');
            selector.css({display: "list-item"});
            selector.text(authIdentity);
        } else {
            $('#toolbar_auth_identity').css({display: "none"});
        }
    },

    /**
     * Shows/hides login button.
     * @param show <tt>true</tt> to show
     */
    showLoginButton (show) {
        if (UIUtil.isButtonEnabled('authentication') && show) {
            $('#toolbar_button_login').css({display: "list-item"});
        } else {
            $('#toolbar_button_login').css({display: "none"});
        }
    },

    /**
     * Shows/hides logout button.
     * @param show <tt>true</tt> to show
     */
    showLogoutButton (show) {
        if (UIUtil.isButtonEnabled('authentication') && show) {
            $('#toolbar_button_logout').css({display: "list-item"});
        } else {
            $('#toolbar_button_logout').css({display: "none"});
        }
    },

    /**
     * Update the state of the button. The button has blue glow if desktop
     * streaming is active.
     */
    updateDesktopSharingButtonState () {
        let button = $("#toolbar_button_desktopsharing");
        if (APP.conference.isSharingScreen) {
            button.addClass("glow");
        } else {
            button.removeClass("glow");
        }
    },

    /**
     * Marks video icon as muted or not.
     * @param {boolean} muted if icon should look like muted or not
     */
    markVideoIconAsMuted (muted) {
        $('#toolbar_button_camera').toggleClass("icon-camera-disabled", muted);
    },

    /**
     * Marks video icon as disabled or not.
     * @param {boolean} disabled if icon should look like disabled or not
     */
    markVideoIconAsDisabled (disabled) {
        var $btn = $('#toolbar_button_camera');

        $btn
            .prop("disabled", disabled)
            .attr("data-i18n", disabled
                ? "[content]toolbar.cameraDisabled"
                : "[content]toolbar.videomute")
            .attr("shortcut", disabled ? "" : "toggleVideoPopover");

        disabled
            ? $btn.attr("disabled", "disabled")
            : $btn.removeAttr("disabled");

        APP.translation.translateElement($btn);

        disabled && this.markVideoIconAsMuted(disabled);
    },

    /**
     * Marks audio icon as muted or not.
     * @param {boolean} muted if icon should look like muted or not
     */
    markAudioIconAsMuted (muted) {
        $('#toolbar_button_mute').toggleClass("icon-microphone",
            !muted).toggleClass("icon-mic-disabled", muted);
    },

    /**
     * Marks audio icon as disabled or not.
     * @param {boolean} disabled if icon should look like disabled or not
     */
    markAudioIconAsDisabled (disabled) {
        var $btn = $('#toolbar_button_mute');

        $btn
            .prop("disabled", disabled)
            .attr("data-i18n", disabled
                ? "[content]toolbar.micDisabled"
                : "[content]toolbar.mute")
            .attr("shortcut", disabled ? "" : "mutePopover");

        disabled
            ? $btn.attr("disabled", "disabled")
            : $btn.removeAttr("disabled");

        APP.translation.translateElement($btn);

        disabled && this.markAudioIconAsMuted(disabled);
    },

    /**
     * Indicates if the toolbar is currently hovered.
     * @return {boolean} true if the toolbar is currently hovered,
     * false otherwise
     */
    isHovered() {
        var hovered = false;
        this.toolbarSelector.find('*').each(function () {
            let id = $(this).attr('id');
            if ($(`#${id}:hover`).length > 0) {
                hovered = true;
                // break each
                return false;
            }
        });
        if (hovered)
            return true;
        if ($("#bottomToolbar:hover").length > 0
            || $("#extendedToolbar:hover").length > 0
            || SideContainerToggler.isHovered()) {
            return true;
        }
        return false;
    },

    /**
     * Returns true if this toolbar is currently visible, or false otherwise.
     * @return <tt>true</tt> if currently visible, <tt>false</tt> - otherwise
     */
    isVisible() {
        return this.toolbarSelector.hasClass("slideInY");
    },

    /**
     * Hides the toolbar with animation or not depending on the animate
     * parameter.
     */
    hide() {
        this.toolbarSelector.toggleClass("slideInY").toggleClass("slideOutY");

        let slideInAnimation = (SideContainerToggler.isVisible)
                                    ? "slideInExtX"
                                    : "slideInX";
        let slideOutAnimation = (SideContainerToggler.isVisible)
                                    ? "slideOutExtX"
                                    : "slideOutX";

        this.extendedToolbarSelector.toggleClass(slideInAnimation)
            .toggleClass(slideOutAnimation);
    },

    /**
     * Shows the toolbar with animation or not depending on the animate
     * parameter.
     */
    show() {
        if (this.toolbarSelector.hasClass("slideOutY"))
            this.toolbarSelector.toggleClass("slideOutY");

        let slideInAnimation = (SideContainerToggler.isVisible)
                                ? "slideInExtX"
                                : "slideInX";
        let slideOutAnimation = (SideContainerToggler.isVisible)
                                ? "slideOutExtX"
                                : "slideOutX";

        if (this.extendedToolbarSelector.hasClass(slideOutAnimation))
            this.extendedToolbarSelector.toggleClass(slideOutAnimation);

        this.toolbarSelector.toggleClass("slideInY");
        this.extendedToolbarSelector.toggleClass(slideInAnimation);
    },

    registerClickListeners(listener) {
        $('#mainToolbarContainer').click(listener);

        $("#extendedToolbar").click(listener);
    },

    /**
     * Handles the side toolbar toggle.
     */
    _handleSideToolbarContainerToggled(containerId, isVisible) {
        Object.keys(defaultToolbarButtons).forEach(
            id => {
                if (!UIUtil.isButtonEnabled(id))
                    return;

                var button = defaultToolbarButtons[id];

                if (button.sideContainerId
                    && button.sideContainerId === containerId) {
                    UIUtil.buttonClick(button.id, "selected");
                    return;
                }
            }
        );
    },

    /**
     * Initialise main toolbar buttons.
     */
    _initMainToolbarButtons() {
        interfaceConfig.MAIN_TOOLBAR_BUTTONS.forEach((value, index) => {
            if (value && value in defaultToolbarButtons) {
                let button = defaultToolbarButtons[value];
                this._addMainToolbarButton(
                    button,
                    (index === 0),
                    (index === interfaceConfig.MAIN_TOOLBAR_BUTTONS.length -1));
            }
        });
    },

    /**
     * Adds the given button to the main (top) toolbar.
     *
     * @param {Object} the button to add.
     * @param {boolean} isFirst indicates if this is the first button in the
     * toolbar
     * @param {boolean} isLast indicates if this is the last button in the
     * toolbar
     */
    _addMainToolbarButton(button, isFirst, isLast) {
        let buttonElement = document.createElement("a");
        if (button.className)
            buttonElement.className = button.className
                                    + ((isFirst) ? " first" : "")
                                    + ((isLast) ? " last" : "");

        buttonElement.id = button.id;

        if (button.shortcutAttr)
            buttonElement.setAttribute("shortcut", button.shortcutAttr);

        if (button.content)
            buttonElement.setAttribute("content", button.content);

        if (button.i18n)
            buttonElement.setAttribute("data-i18n", button.i18n);

        buttonElement.setAttribute("data-container", "body");
        buttonElement.setAttribute("data-toggle", "popover");
        buttonElement.setAttribute("data-placement", "bottom");
        this._addPopups(buttonElement, button.popups);

        document.getElementById("mainToolbar")
            .appendChild(buttonElement);
    },

    _addPopups(buttonElement, popups = []) {
        popups.forEach((popup) => {
            let popupElement = document.createElement("ul");
            popupElement.id = popup.id;
            popupElement.className = popup.className;
            let liElement = document.createElement("li");
            liElement.setAttribute("data-i18n", popup.dataAttr);
            popupElement.appendChild(liElement);
            buttonElement.appendChild(popupElement);
        });
    }
};

export default Toolbar;
