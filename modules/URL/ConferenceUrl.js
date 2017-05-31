const logger = require("jitsi-meet-logger").getLogger(__filename);

/**
 * The modules stores information about the URL used to start the conference and
 * provides utility methods for dealing with conference URL and reloads.
 */
export default class ConferenceUrl {
    /**
     * Initializes the module.
     *
     * @param location an object which stores provides the info about conference
     * URL(would be 'window.location' for the Web app). The params below are
     * described based on the following example URL:
     *
     * https://example.com:8888/SomeConference1245?opt=1#somehash
     *
     * @param location.href full URL with all parameters, would be the whole URL
     * from the example string above.
     * @param location.host the host part of the URL, 'example.com' from
     * the sample URL above.
     * @param location.pathname the path part of the URL, would be
     * '/SomeConference1245' from the example above.
     * @param location.protocol the protocol part of the URL, would be 'https:'
     * from the sample URL.
     */
    constructor(location) {
        /**
         * A simplified version of the conference URL stripped out of
         * the parameters which should be used for sending invites.
         * Example:
         * https://example.com:8888/SomeConference1245
         * @type {string}
         */
        this.inviteURL
            = location.protocol + "//" + location.host + location.pathname;
        logger.info("Stored original conference URL: " + location.href);
        logger.info("Conference URL for invites: " + this.inviteURL);
    }
    /**
     * Obtains the conference invite URL.
     * @return {string} the URL pointing o the conference which is mean to be
     * used to invite new participants.
     */
    getInviteUrl() {
        return this.inviteURL;
    }
}
