var UIEvents = {
    NICKNAME_CHANGED: "UI.nickname_changed",
    SELECTED_ENDPOINT: "UI.selected_endpoint",
    PINNED_ENDPOINT: "UI.pinned_endpoint",
    LARGEVIDEO_INIT: "UI.largevideo_init",
    /**
     * Notifies that local user created text message.
     */
    MESSAGE_CREATED: "UI.message_created",
    /**
     * Notifies that local user changed language.
     */
    LANG_CHANGED: "UI.lang_changed",
    /**
     * Notifies that local user changed email.
     */
    EMAIL_CHANGED: "UI.email_changed",
    /**
     * Notifies that "start muted" settings changed.
     */
    START_MUTED_CHANGED: "UI.start_muted_changed",
    AUDIO_MUTED: "UI.audio_muted",
    VIDEO_MUTED: "UI.video_muted",
    /**
     * Notifies interested parties when the film strip (remote video's panel)
     * is hidden (toggled) or shown (un-toggled).
     */
    FILM_STRIP_TOGGLED: "UI.filmstrip_toggled"
};
module.exports = UIEvents;