/* @flow */

import { StatusBar } from 'react-native';
import { Immersive } from 'react-native-immersive';

import {
    CONFERENCE_FAILED,
    CONFERENCE_LEFT,
    CONFERENCE_WILL_JOIN
} from '../base/conference';
import { Platform } from '../base/react';
import { MiddlewareRegistry } from '../base/redux';

/**
 * Middleware that captures conference actions and activates or deactivates the
 * full screen mode. On iOS it hides the status bar, and on Android it uses the
 * immersive mode:
 * https://developer.android.com/training/system-ui/immersive.html
 * In immersive mode the status and navigation bars are hidden and thus the
 * entire screen will be covered by our application.
 *
 * @param {Store} store - Redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    let fullScreen;

    switch (action.type) {
    case CONFERENCE_WILL_JOIN: {
        const conference = store.getState()['features/base/conference'];

        fullScreen = !conference.audioOnly;
        break;
    }

    case CONFERENCE_FAILED:
    case CONFERENCE_LEFT:
        fullScreen = false;
        break;

    default:
        fullScreen = null;
        break;
    }

    if (fullScreen !== null) {
        _setFullScreen(fullScreen)
            .catch(err =>
                console.warn(`Failed to set full screen mode: ${err}`));
    }

    return next(action);
});

/**
 * Activates/deactivates the full screen mode. On iOS it will hide the status
 * bar, and on Android it will turn immersive mode on.
 *
 * @param {boolean} fullScreen - True to set full screen mode, false to
 * deactivate it.
 * @private
 * @returns {Promise}
 */
function _setFullScreen(fullScreen: boolean) {
    // XXX The React Native module Immersive is only implemented on Android and
    // throws on other platforms.
    if (Platform.OS === 'android') {
        return fullScreen ? Immersive.on() : Immersive.off();
    }

    // On platforms other than Android go with whatever React Native itself
    // supports.
    StatusBar.setHidden(fullScreen, 'slide');

    return Promise.resolve();
}
