// @flow
import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';

import styles from './styles';

import { refreshCalendarEntryList } from '../actions';

import { appNavigate } from '../../app';
import { getLocalizedDateFormatter, translate } from '../../base/i18n';
import { NavigateSectionList } from '../../base/react';
import { openSettings } from '../../mobile/permissions';

type Props = {

    /**
     * Indicates if the list is disabled or not.
     */
    disabled: boolean,

    /**
     * The Redux dispatch function.
     */
    dispatch: Function,

    /**
     * Tells the component if it's being displayed at the moment, or not.
     * Note: as an example, on Android it can happen that the component
     * is rendered but not displayed, because components like ViewPagerAndroid
     * render their children even if they are not visible at the moment.
     */
    displayed: boolean,

    /**
     * The current state of the calendar access permission.
     */
    _calendarAccessStatus: string,

    /**
     * The calendar event list.
     */
    _eventList: Array<Object>,

    /**
     * The translate function.
     */
    t: Function
};

/**
 * Component to display a list of events from the (mobile) user's calendar.
 */
class MeetingList extends Component<Props> {
    /**
     * Default values for the component's props.
     */
    static defaultProps = {
        _eventList: []
    };

    /**
     * Constructor of the MeetingList component.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        const { dispatch, displayed } = props;

        if (displayed) {
            dispatch(refreshCalendarEntryList());
        }

        this._getRenderListEmptyComponent
            = this._getRenderListEmptyComponent.bind(this);
        this._onPress = this._onPress.bind(this);
        this._onRefresh = this._onRefresh.bind(this);
        this._toDisplayableItem = this._toDisplayableItem.bind(this);
        this._toDisplayableList = this._toDisplayableList.bind(this);
        this._toDateString = this._toDateString.bind(this);
    }

    /**
     * Implements React Component's componentWillReceiveProps function.
     *
     * @inheritdoc
     */
    componentWillReceiveProps(newProps) {
        const { displayed } = this.props;

        if (newProps.displayed && !displayed) {
            const { dispatch } = this.props;

            dispatch(refreshCalendarEntryList());
        }
    }

    /**
     * Implements the React Components's render method.
     *
     * @inheritdoc
     */
    render() {
        const { disabled } = this.props;

        return (
            <NavigateSectionList
                disabled = { disabled }
                onPress = { this._onPress }
                onRefresh = { this._onRefresh }
                renderListEmptyComponent = {
                    this._getRenderListEmptyComponent
                }
                sections = { this._toDisplayableList() } />
        );
    }

    _getRenderListEmptyComponent: () => Object;

    /**
     * Returns a list empty component if a custom one has to be rendered instead
     * of the default one in the {@link NavigateSectionList}.
     *
     * @private
     * @returns {Component}
     */
    _getRenderListEmptyComponent() {
        const { _calendarAccessStatus, t } = this.props;

        if (_calendarAccessStatus === 'denied') {
            return (
                <View style = { styles.noPermissionMessageView }>
                    <Text style = { styles.noPermissionMessageText }>
                        { t('calendarSync.permissionMessage') }
                    </Text>
                    <TouchableOpacity
                        onPress = { openSettings }
                        style = { styles.noPermissionMessageButton } >
                        <Text style = { styles.noPermissionMessageButtonText }>
                            { t('calendarSync.permissionButton') }
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    }

    _onPress: string => Function;

    /**
     * Handles the list's navigate action.
     *
     * @private
     * @param {string} url - The url string to navigate to.
     * @returns {void}
     */
    _onPress(url) {
        const { dispatch } = this.props;

        dispatch(appNavigate(url));
    }

    _onRefresh: () => void;

    /**
     * Callback to execute when the list is doing a pull-to-refresh.
     *
     * @private
     * @returns {void}
     */
    _onRefresh() {
        const { dispatch } = this.props;

        dispatch(refreshCalendarEntryList(true));
    }

    _toDisplayableItem: Object => Object;

    /**
     * Creates a displayable object from an event.
     *
     * @private
     * @param {Object} event - The calendar event.
     * @returns {Object}
     */
    _toDisplayableItem(event) {
        return {
            key: `${event.id}-${event.startDate}`,
            lines: [
                event.url,
                this._toDateString(event)
            ],
            title: event.title,
            url: event.url
        };
    }

    _toDisplayableList: () => Array<Object>;

    /**
     * Transforms the event list to a displayable list
     * with sections.
     *
     * @private
     * @returns {Array<Object>}
     */
    _toDisplayableList() {
        const { _eventList, t } = this.props;
        const now = Date.now();
        const nowSection = NavigateSectionList.createSection(
            t('calendarSync.now'),
            'now'
        );
        const nextSection = NavigateSectionList.createSection(
            t('calendarSync.next'),
            'next'
        );
        const laterSection = NavigateSectionList.createSection(
            t('calendarSync.later'),
            'later'
        );

        for (const event of _eventList) {
            const displayableEvent = this._toDisplayableItem(event);

            if (event.startDate < now && event.endDate > now) {
                nowSection.data.push(displayableEvent);
            } else if (event.startDate > now) {
                if (nextSection.data.length
                && nextSection.data[0].startDate !== event.startDate) {
                    laterSection.data.push(displayableEvent);
                } else {
                    nextSection.data.push(displayableEvent);
                }
            }
        }

        const sectionList = [];

        for (const section of [
            nowSection,
            nextSection,
            laterSection
        ]) {
            if (section.data.length) {
                sectionList.push(section);
            }
        }

        return sectionList;
    }

    _toDateString: Object => string;

    /**
     * Generates a date (interval) string for a given event.
     *
     * @private
     * @param {Object} event - The event.
     * @returns {string}
     */
    _toDateString(event) {
        const startDateTime
            = getLocalizedDateFormatter(event.startDate).format('lll');
        const endTime
            = getLocalizedDateFormatter(event.endDate).format('LT');

        return `${startDateTime} - ${endTime}`;
    }
}

/**
 * Maps redux state to component props.
 *
 * @param {Object} state - The redux state.
 * @returns {{
 *      _eventList: Array
 * }}
 */
export function _mapStateToProps(state: Object) {
    const calendarSyncState = state['features/calendar-sync'];

    return {
        _calendarAccessStatus: calendarSyncState.calendarAccessStatus,
        _eventList: calendarSyncState.events
    };
}

export default translate(connect(_mapStateToProps)(MeetingList));
