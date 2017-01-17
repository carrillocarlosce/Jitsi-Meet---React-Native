/* global APP, interfaceConfig */

import React, { Component } from 'react';

/**
 * The CSS style of the element with CSS class <tt>rightwatermark</tt>.
 */
const RIGHT_WATERMARK_STYLE = {
    backgroundImage: 'url(images/rightwatermark.png)'
};

/**
 * A Web Component which renders watermarks such as Jits, brand, powered by,
 * etc.
 */
export class Watermarks extends Component {
    /**
     * Initializes a new Watermarks instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        const showBrandWatermark
            = interfaceConfig.SHOW_BRAND_WATERMARK
                && !interfaceConfig.filmStripOnly;
        const showJitsiWatermark
            = interfaceConfig.SHOW_JITSI_WATERMARK
                && !interfaceConfig.filmStripOnly;
        const showJitsiWatermarkForGuests
            = interfaceConfig.SHOW_WATERMARK_FOR_GUESTS;

        this.state = {
            brandWatermarkLink:
                showBrandWatermark ? interfaceConfig.BRAND_WATERMARK_LINK : '',
            jitsiWatermarkLink:
                showJitsiWatermark || showJitsiWatermarkForGuests
                    ? interfaceConfig.JITSI_WATERMARK_LINK : '',
            showBrandWatermark,
            showJitsiWatermark,
            showJitsiWatermarkForGuests,
            showPoweredBy: interfaceConfig.SHOW_POWERED_BY
        };
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div>
                {
                    this._renderJitsiWatermark()
                }
                {
                    this._renderBrandWatermark()
                }
                {
                    this._renderPoweredBy()
                }
            </div>
        );
    }

    /**
     * Renders a brand watermark if it is enabled.
     *
     * @private
     * @returns {ReactElement|null} Watermark element or null.
     */
    _renderBrandWatermark() {
        if (this.state.showBrandWatermark) {
            return (
                <a
                    href = { this.state.brandWatermarkLink }
                    target = '_new'>
                    <div
                        className = 'watermark rightwatermark'
                        style = { RIGHT_WATERMARK_STYLE } />
                </a>
            );
        }

        return null;
    }

    /**
     * Renders a Jitsi watermark if it is enabled.
     *
     * @private
     * @returns {ReactElement|null}
     */
    _renderJitsiWatermark() {
        if (this.state.showJitsiWatermark
            || (APP.tokenData.isGuest
                    && this.state.showJitsiWatermarkForGuests)) {
            return (
                <a
                    href = { this.state.jitsiWatermarkLink }
                    target = '_new'>
                    <div className = 'watermark leftwatermark' />
                </a>
            );
        }

        return null;
    }

    /**
     * Renders a powered by block if it is enabled.
     *
     * @private
     * @returns {ReactElement|null}
     */
    _renderPoweredBy() {
        if (this.state.showPoweredBy) {
            return (
                <a
                    className = 'poweredby'
                    href = 'http://jitsi.org'
                    target = '_new'>
                    <span data-i18n = 'poweredby' /> jitsi.org
                </a>
            );
        }

        return null;
    }
}
