/* @flow */

import { ReducerRegistry } from '../base/redux';

import {
    CLEAR_TOOLBOX_TIMEOUT,
    SET_DEFAULT_TOOLBOX_BUTTONS,
    SET_SUBJECT,
    SET_SUBJECT_SLIDE_IN,
    SET_TOOLBAR_BUTTON,
    SET_TOOLBAR_HOVERED,
    SET_TOOLBOX_ALWAYS_VISIBLE,
    SET_TOOLBOX_ENABLED,
    SET_TOOLBOX_TIMEOUT,
    SET_TOOLBOX_TIMEOUT_MS,
    SET_TOOLBOX_VISIBLE
} from './actionTypes';

declare var interfaceConfig: Object;

/**
 * Returns initial state for toolbox's part of Redux store.
 *
 * @private
 * @returns {{
 *     alwaysVisible: boolean,
 *     hovered: boolean,
 *     primaryToolbarButtons: Map,
 *     secondaryToolbarButtons: Map,
 *     subject: string,
 *     subjectSlideIn: boolean,
 *     timeoutID: number,
 *     timeoutMS: number,
 *     visible: boolean
 * }}
 */
function _getInitialState() {
    // Default toolbox timeout for mobile app.
    let timeoutMS = 5000;

    if (typeof interfaceConfig !== 'undefined'
            && interfaceConfig.INITIAL_TOOLBAR_TIMEOUT) {
        timeoutMS = interfaceConfig.INITIAL_TOOLBAR_TIMEOUT;
    }

    return {
        /**
         * The indicator which determines whether the Toolbox should always be
         * visible.
         *
         * @type {boolean}
         */
        alwaysVisible: false,

        /**
         * The indicator which determines whether the Toolbox is enabled. For
         * example, modules/UI/recording/Recording.js disables the Toolbox.
         *
         * @type {boolean}
         */
        enabled: true,

        /**
         * The indicator which determines whether a Toolbar in the Toolbox is
         * hovered.
         *
         * @type {boolean}
         */
        hovered: false,

        /**
         * A Map of the default buttons of the PrimaryToolbar.
         *
         * @type {Map}
         */
        primaryToolbarButtons: new Map(),

        /**
         * A Map of the default buttons of the SecondaryToolbar.
         *
         * @type {Map}
         */
        secondaryToolbarButtons: new Map(),

        /**
         * The text of the conference subject.
         *
         * @type {string}
         */
        subject: '',

        /**
         * The indicator which determines whether the subject is sliding in.
         *
         * @type {boolean}
         */
        subjectSlideIn: false,

        /**
         * A number, non-zero value which identifies the timer created by a call
         * to setTimeout() with timeoutMS.
         *
         * @type {number|null}
         */
        timeoutID: null,

        /**
         * The delay in milliseconds before timeoutID executes (after its
         * initialization).
         *
         * @type {number}
         */
        timeoutMS,

        /**
         * The indicator which determines whether the Toolbox is visible.
         *
         * @type {boolean}
         */
        visible: false
    };
}

ReducerRegistry.register(
    'features/toolbox',
    (state: Object = _getInitialState(), action: Object) => {
        switch (action.type) {
        case CLEAR_TOOLBOX_TIMEOUT:
            return {
                ...state,
                timeoutID: undefined
            };

        case SET_DEFAULT_TOOLBOX_BUTTONS: {
            const { primaryToolbarButtons, secondaryToolbarButtons } = action;

            return {
                ...state,
                primaryToolbarButtons,
                secondaryToolbarButtons
            };
        }

        case SET_SUBJECT:
            return {
                ...state,
                subject: action.subject
            };

        case SET_SUBJECT_SLIDE_IN:
            return {
                ...state,
                subjectSlideIn: action.subjectSlideIn
            };

        case SET_TOOLBAR_BUTTON:
            return _setButton(state, action);

        case SET_TOOLBAR_HOVERED:
            return {
                ...state,
                hovered: action.hovered
            };

        case SET_TOOLBOX_ALWAYS_VISIBLE:
            return {
                ...state,
                alwaysVisible: action.alwaysVisible
            };

        case SET_TOOLBOX_ENABLED:
            return {
                ...state,
                enabled: action.enabled
            };

        case SET_TOOLBOX_TIMEOUT:
            return {
                ...state,
                timeoutID: action.timeoutID,
                timeoutMS: action.timeoutMS
            };

        case SET_TOOLBOX_TIMEOUT_MS:
            return {
                ...state,
                timeoutMS: action.timeoutMS
            };

        case SET_TOOLBOX_VISIBLE:
            return {
                ...state,
                visible: action.visible
            };
        }

        return state;
    });

/**
 * Sets new value of the button.
 *
 * @param {Object} state - Redux state.
 * @param {Object} action - Dispatched action.
 * @param {Object} action.button - Object describing toolbar button.
 * @param {Object} action.buttonName - The name of the button.
 * @private
 * @returns {Object}
 */
function _setButton(state, { button, buttonName }): Object {
    const { primaryToolbarButtons, secondaryToolbarButtons } = state;
    let selectedButton = primaryToolbarButtons.get(buttonName);
    let place = 'primaryToolbarButtons';

    if (!selectedButton) {
        selectedButton = secondaryToolbarButtons.get(buttonName);
        place = 'secondaryToolbarButtons';
    }

    selectedButton = {
        ...selectedButton,
        ...button
    };

    // In filmstrip-only mode we only show buttons if they're filmstrip-only
    // enabled, so we don't need to update if this isn't the case.
    // FIXME A reducer should be a pure function of the current state and the
    // specified action so it should not use the global variable
    // interfaceConfig. Anyway, we'll move interfaceConfig into the (redux)
    // store so we'll surely revisit the source code bellow.
    if (interfaceConfig.filmStripOnly && !selectedButton.filmstripOnlyEnabled) {
        return {
            ...state
        };
    }

    const updatedToolbar = state[place].set(buttonName, selectedButton);

    return {
        ...state,
        [place]: new Map(updatedToolbar)
    };
}
