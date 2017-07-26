/* @flow */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setToolbarHovered } from '../actions';
import ToolbarButton from './ToolbarButton';

/**
 * Implements a toolbar in React/Web. It is a strip that contains a set of
 * toolbar items such as buttons. Toolbar is commonly placed inside of a
 * Toolbox.
 *
 * @class Toolbar
 * @extends Component
 */
class Toolbar extends Component {
    _renderToolbarButton: Function;

    /**
     * Base toolbar component's property types.
     *
     * @static
     */
    static propTypes = {
        /**
         * Children of current React component.
         */
        children: React.PropTypes.element,

        /**
         * Toolbar's class name.
         */
        className: React.PropTypes.string,

        /**
         * Used to dispatch an action when a button is clicked or on mouse
         * out/in event.
         */
        dispatch: React.PropTypes.func,

        /**
         * Map with toolbar buttons.
         */
        toolbarButtons: React.PropTypes.instanceOf(Map),

        /**
         * Indicates the position of the tooltip.
         */
        tooltipPosition:
            React.PropTypes.oneOf([ 'bottom', 'left', 'right', 'top' ])
    };

    /**
     * Constructor of Primary toolbar class.
     *
     * @param {Object} props - Object containing React component properties.
     */
    constructor(props) {
        super(props);

        // Bind callbacks to preverse this.
        this._renderToolbarButton = this._renderToolbarButton.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render(): ReactElement<*> {
        const { className } = this.props;

        return (
            <div
                className = { `toolbar ${className}` }
                onMouseOut = { this._onMouseOut }
                onMouseOver = { this._onMouseOver }>
                {
                    [ ...this.props.toolbarButtons.entries() ]
                    .reduce(this._renderToolbarButton, [])
                }
                {
                    this.props.children
                }
            </div>
        );
    }

    /**
     * Dispatches an action signalling that toolbar is no being hovered.
     *
     * @protected
     * @returns {Object} Dispatched action.
     */
    _onMouseOut() {
        this.props.dispatch(setToolbarHovered(false));
    }

    /**
     * Dispatches an action signalling that toolbar is now being hovered.
     *
     * @protected
     * @returns {Object} Dispatched action.
     */
    _onMouseOver() {
        this.props.dispatch(setToolbarHovered(true));
    }

    /**
     * Renders toolbar button. Method is passed to reduce function.
     *
     * @param {Array} acc - Toolbar buttons array.
     * @param {Array} keyValuePair - Key value pair containing button and its
     * key.
     * @private
     * @returns {Array} Array of toolbar buttons.
     */
    _renderToolbarButton(acc: Array<*>,
                         keyValuePair: Array<*>): Array<ReactElement<*>> {
        const [ key, button ] = keyValuePair;

        if (button.component) {
            acc.push(
                <button.component
                    key = { key }
                    tooltipPosition = { this.props.tooltipPosition } />
            );

            return acc;
        }

        const { tooltipPosition } = this.props;

        const { onClick, onMount, onUnmount } = button;

        const onClickHandler
            = (...args) =>
                onClick(this.props.dispatch, ...args);

        acc.push(
            <ToolbarButton
                button = { button }
                key = { key }
                onClick = { onClickHandler }
                onMount = { onMount }
                onUnmount = { onUnmount }
                tooltipPosition = { tooltipPosition } />
        );

        return acc;
    }
}

export default connect()(Toolbar);
