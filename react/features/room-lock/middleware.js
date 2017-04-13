/* global APP */
const logger = require('jitsi-meet-logger').getLogger(__filename);

import UIEvents from '../../../service/UI/UIEvents';

import {
    CONFERENCE_FAILED,
    LOCK_STATE_CHANGED,
    SET_PASSWORD_FAILED
} from '../base/conference';
import JitsiMeetJS from '../base/lib-jitsi-meet';
import { MiddlewareRegistry } from '../base/redux';

import { _showPasswordDialog } from './actions';

/**
 * Middleware that captures conference failed and checks for password required
 * error and requests a dialog for user to enter password.
 *
 * @param {Store} store - Redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {

    switch (action.type) {
    case CONFERENCE_FAILED: {
        const JitsiConferenceErrors = JitsiMeetJS.errors.conference;

        if (action.conference
            && JitsiConferenceErrors.PASSWORD_REQUIRED === action.error) {
            // XXX temporary solution while some components are not listening
            // for lock state updates in redux
            if (typeof APP !== 'undefined') {
                APP.UI.emitEvent(UIEvents.TOGGLE_ROOM_LOCK, true);
            }

            store.dispatch(_showPasswordDialog(action.conference));
        }
        break;
    }
    case LOCK_STATE_CHANGED: {
        // TODO Remove this logic when all components interested in the lock
        // state change event are moved into react/redux.
        if (typeof APP !== 'undefined') {
            APP.UI.emitEvent(UIEvents.TOGGLE_ROOM_LOCK, action.locked);
        }

        break;
    }
    case SET_PASSWORD_FAILED:
        return _notifySetPasswordError(store, next, action);
    }

    return next(action);
});

/**
 * Handles errors that occur when a password is failed to be set.
 *
 * @param {Store} store - The Redux store in which the specified action is being
 * dispatched.
 * @param {Dispatch} next - The Redux dispatch function to dispatch the
 * specified action to the specified store.
 * @param {Action} action - The Redux action SET_PASSWORD_ERROR which has the
 * error type that should be handled.
 * @private
 * @returns {Object} The new state that is the result of the reduction of the
 * specified action.
 */
function _notifySetPasswordError(store, next, action) {
    if (typeof APP !== 'undefined') {
        // TODO remove this logic when displaying of error messages on web is
        // handled through react/redux
        if (action.error
            === JitsiMeetJS.errors.conference.PASSWORD_NOT_SUPPORTED) {
            logger.warn('room passwords not supported');
            APP.UI.messageHandler.showError(
                'dialog.warning', 'dialog.passwordNotSupported');
        } else {
            logger.warn('setting password failed', action.error);
            APP.UI.messageHandler.showError(
                'dialog.lockTitle', 'dialog.lockMessage');
        }
    }

    return next(action);
}
