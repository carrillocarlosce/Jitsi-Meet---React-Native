/* @flow */

import { NativeModules } from 'react-native';

import {
    CONFERENCE_FAILED,
    CONFERENCE_JOINED,
    CONFERENCE_LEFT,
    CONFERENCE_WILL_JOIN,
    CONFERENCE_WILL_LEAVE
} from '../../base/conference';
import { MiddlewareRegistry } from '../../base/redux';

/**
 * Middleware that captures Redux actions and uses the ExternalAPI module to
 * turn them into native events so the application knows about them.
 *
 * @param {Store} store - Redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const result = next(action);

    switch (action.type) {
    case CONFERENCE_FAILED:
    case CONFERENCE_JOINED:
    case CONFERENCE_LEFT:
    case CONFERENCE_WILL_JOIN:
    case CONFERENCE_WILL_LEAVE: {
        const { conference, room, type, ...data } = action;

        // For the above (redux) actions, conference and/or room identify a
        // JitsiConference instance. The external API cannot transport such an
        // object so we have to transport an "equivalent".
        if (conference || room) {
            // We have chosen to identify the object in question by the
            // (supposedly) associated location URL. (FIXME Actually, the redux
            // state locationURL is not really asssociated with the
            // JitsiConference instance. The value of localtionURL is utilized
            // in order to initialize the JitsiConference instance but the value
            // of locationURL at the time of CONFERENCE_WILL_LEAVE and
            // CONFERENCE_LEFT will not be the value with which the
            // JitsiConference instance being left.)
            const { locationURL }
                = store.getState()['features/base/connection'];

            if (!locationURL) {
                // The (redux) action cannot be fully converted to an (external
                // API) event.
                break;
            }

            data.url = locationURL.href;
        }

        // The (externa API) event's name is the string representation of the
        // (redux) action's type.
        let name = type.toString();

        // XXX We are using Symbol for (redux) action types at the time of this
        // writing so the Symbol's description should be used.
        if (name.startsWith('Symbol(') && name.endsWith(')')) {
            name = name.slice(7, -1);
        }

        _sendEvent(name, data);
        break;
    }
    }

    return result;
});

/**
 * Sends a specific event to the native counterpart of the External API. Native
 * apps may listen to such events via the mechanisms provided by the (native)
 * mobile Jitsi Meet SDK.
 *
 * @param {string} name - The name of the event to send.
 * @param {Object} data - The details/specifics of the event to send determined
 * by/associated with the specified {@code name}.
 * @private
 * @returns {void}
 */
function _sendEvent(name: string, data: Object) {
    NativeModules.ExternalAPI.sendEvent(name, data);
}
