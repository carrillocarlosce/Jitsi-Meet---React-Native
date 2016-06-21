/* global $, APP, JitsiMeetJS */

let $overlay;

/**
 * Internal function that constructs overlay with guidance how to proceed with
 * gUM prompt.
 */
function buildOverlayHtml() {
    let browser = JitsiMeetJS.environment.getBrowserType()
            .split('rtc_browser.')[1] || 'chrome';

    $overlay = $(`
        <div class='overlay_container'>
            <div class='overlay overlay_transparent' />
            <div class='overlay_content'>
                <span class="overlay_icon icon-microphone"></span>
                <span class="overlay_icon icon-camera"></span>
                <span data-i18n='[html]userMedia.${browser}GrantPermissions' 
                    class='overlay_text overlay_text_small'></span>
            </div>
        </div>`);

    APP.translation.translateElement($overlay);
}

export default {
    /**
     * Shows browser-specific overlay with guidance how to proceed with
     * gUM prompt.
     */
    show() {
        !$overlay && buildOverlayHtml();

        $overlay && $overlay.appendTo('body');
    },

    /**
     * Hides browser-specific overlay with guidance how to proceed with
     * gUM prompt.
     */
    hide() {
        $overlay && $overlay.detach();
    }
};