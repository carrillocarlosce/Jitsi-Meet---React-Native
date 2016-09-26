/* global $, APP, interfaceConfig */
/* jshint -W101 */

import FilmStrip from './FilmStrip';
import LargeContainer from './LargeContainer';
import UIEvents from "../../../service/UI/UIEvents";
import UIUtil from "../util/UIUtil";

// FIXME should be 'video'
export const VIDEO_CONTAINER_TYPE = "camera";

const FADE_DURATION_MS = 300;

/**
 * Get stream id.
 * @param {JitsiTrack?} stream
 */
function getStreamOwnerId(stream) {
    if (!stream) {
        return;
    }
    // local stream doesn't have method "getParticipantId"
    if (stream.isLocal()) {
        return APP.conference.getMyUserId();
    } else {
        return stream.getParticipantId();
    }
}

/**
 * Returns an array of the video dimensions, so that it keeps it's aspect
 * ratio and fits available area with it's larger dimension. This method
 * ensures that whole video will be visible and can leave empty areas.
 *
 * @return an array with 2 elements, the video width and the video height
 */
function getDesktopVideoSize(videoWidth,
                             videoHeight,
                             videoSpaceWidth,
                             videoSpaceHeight) {

    let aspectRatio = videoWidth / videoHeight;

    let availableWidth = Math.max(videoWidth, videoSpaceWidth);
    let availableHeight = Math.max(videoHeight, videoSpaceHeight);

    videoSpaceHeight -= FilmStrip.getFilmStripHeight();

    if (availableWidth / aspectRatio >= videoSpaceHeight) {
        availableHeight = videoSpaceHeight;
        availableWidth = availableHeight * aspectRatio;
    }

    if (availableHeight * aspectRatio >= videoSpaceWidth) {
        availableWidth = videoSpaceWidth;
        availableHeight = availableWidth / aspectRatio;
    }

    return [ availableWidth, availableHeight ];
}


/**
 * Returns an array of the video dimensions. It respects the
 * VIDEO_LAYOUT_FIT config, to fit the video to the screen, by hiding some parts
 * of it, or to fit it to the height or width.
 *
 * @param videoWidth the original video width
 * @param videoHeight the original video height
 * @param videoSpaceWidth the width of the video space
 * @param videoSpaceHeight the height of the video space
 * @return an array with 2 elements, the video width and the video height
 */
function getCameraVideoSize(videoWidth,
                            videoHeight,
                            videoSpaceWidth,
                            videoSpaceHeight) {

    let aspectRatio = videoWidth / videoHeight;

    let availableWidth = videoWidth;
    let availableHeight = videoHeight;

    if (interfaceConfig.VIDEO_LAYOUT_FIT == 'height') {
        availableHeight = videoSpaceHeight;
        availableWidth = availableHeight*aspectRatio;
    }
    else if (interfaceConfig.VIDEO_LAYOUT_FIT == 'width') {
        availableWidth = videoSpaceWidth;
        availableHeight = availableWidth/aspectRatio;
    }
    else if (interfaceConfig.VIDEO_LAYOUT_FIT == 'both') {
        availableWidth = Math.max(videoWidth, videoSpaceWidth);
        availableHeight = Math.max(videoHeight, videoSpaceHeight);

        if (availableWidth / aspectRatio < videoSpaceHeight) {
            availableHeight = videoSpaceHeight;
            availableWidth = availableHeight * aspectRatio;
        }

        if (availableHeight * aspectRatio < videoSpaceWidth) {
            availableWidth = videoSpaceWidth;
            availableHeight = availableWidth / aspectRatio;
        }
    }


    return [ availableWidth, availableHeight ];
}

/**
 * Returns an array of the video horizontal and vertical indents,
 * so that if fits its parent.
 *
 * @return an array with 2 elements, the horizontal indent and the vertical
 * indent
 */
function getCameraVideoPosition(videoWidth,
                                videoHeight,
                                videoSpaceWidth,
                                videoSpaceHeight) {
    // Parent height isn't completely calculated when we position the video in
    // full screen mode and this is why we use the screen height in this case.
    // Need to think it further at some point and implement it properly.
    if (UIUtil.isFullScreen()) {
        videoSpaceHeight = window.innerHeight;
    }

    let horizontalIndent = (videoSpaceWidth - videoWidth) / 2;
    let verticalIndent = (videoSpaceHeight - videoHeight) / 2;

    return { horizontalIndent, verticalIndent };
}

/**
 * Returns an array of the video horizontal and vertical indents.
 * Centers horizontally and top aligns vertically.
 *
 * @return an array with 2 elements, the horizontal indent and the vertical
 * indent
 */
function getDesktopVideoPosition(videoWidth,
                                 videoHeight,
                                 videoSpaceWidth,
                                 videoSpaceHeight) {

    let horizontalIndent = (videoSpaceWidth - videoWidth) / 2;

    let verticalIndent = 0;// Top aligned

    return { horizontalIndent, verticalIndent };
}

/**
 * Container for user video.
 */
export class VideoContainer extends LargeContainer {
    // FIXME: With Temasys we have to re-select everytime
    get $video () {
        return $('#largeVideo');
    }

    get id () {
        return getStreamOwnerId(this.stream);
    }

    constructor (onPlay, emitter) {
        super();
        this.stream = null;
        this.videoType = null;
        this.localFlipX = true;
        this.emitter = emitter;

        this.isVisible = false;

        this.$avatar = $('#dominantSpeaker');
        this.$wrapper = $('#largeVideoWrapper');

        this.avatarHeight = $("#dominantSpeakerAvatar").height();

        // This does not work with Temasys plugin - has to be a property to be
        // copied between new <object> elements
        //this.$video.on('play', onPlay);
        this.$video[0].onplay = onPlay;
    }

    /**
     * Enables a filter on the video which indicates that there are some
     * problems with the media connection.
     *
     * @param {boolean} enable <tt>true</tt> if the filter is to be enabled or
     * <tt>false</tt> otherwise.
     */
    enableVideoProblemFilter (enable) {
        this.$video.toggleClass("videoProblemFilter", enable);
    }

    /**
     * Get size of video element.
     * @returns {{width, height}}
     */
    getStreamSize () {
        let video = this.$video[0];
        return {
            width: video.videoWidth,
            height: video.videoHeight
        };
    }

    /**
     * Calculate optimal video size for specified container size.
     * @param {number} containerWidth container width
     * @param {number} containerHeight container height
     * @returns {{availableWidth, availableHeight}}
     */
    getVideoSize (containerWidth, containerHeight) {
        let { width, height } = this.getStreamSize();
        if (this.stream && this.isScreenSharing()) {
            return getDesktopVideoSize( width,
                height,
                containerWidth,
                containerHeight);
        } else {
            return getCameraVideoSize(  width,
                height,
                containerWidth,
                containerHeight);
        }
    }

    /**
     * Calculate optimal video position (offset for top left corner)
     * for specified video size and container size.
     * @param {number} width video width
     * @param {number} height video height
     * @param {number} containerWidth container width
     * @param {number} containerHeight container height
     * @returns {{horizontalIndent, verticalIndent}}
     */
    getVideoPosition (width, height, containerWidth, containerHeight) {
        if (this.stream && this.isScreenSharing()) {
            return getDesktopVideoPosition( width,
                height,
                containerWidth,
                containerHeight);
        } else {
            return getCameraVideoPosition(  width,
                height,
                containerWidth,
                containerHeight);
        }
    }

    resize (containerWidth, containerHeight, animate = false) {
        let [width, height]
            = this.getVideoSize(containerWidth, containerHeight);
        let { horizontalIndent, verticalIndent }
            = this.getVideoPosition(width, height,
            containerWidth, containerHeight);

        // update avatar position
        let top = containerHeight / 2 - this.avatarHeight / 4 * 3;

        this.$avatar.css('top', top);

        this.$wrapper.animate({
            width: width,
            height: height,

            top: verticalIndent,
            bottom: verticalIndent,

            left: horizontalIndent,
            right: horizontalIndent
        }, {
            queue: false,
            duration: animate ? 500 : 0
        });
    }

    /**
     * Update video stream.
     * @param {JitsiTrack?} stream new stream
     * @param {string} videoType video type
     */
    setStream (stream, videoType) {
        // detach old stream
        if (this.stream) {
            this.stream.detach(this.$video[0]);
        }

        this.stream = stream;
        this.videoType = videoType;

        if (!stream) {
            return;
        }

        stream.attach(this.$video[0]);
        let flipX = stream.isLocal() && this.localFlipX;
        this.$video.css({
            transform: flipX ? 'scaleX(-1)' : 'none'
        });
    }

    /**
     * Changes the flipX state of the local video.
     * @param val {boolean} true if flipped.
     */
    setLocalFlipX(val) {
        this.localFlipX = val;
        if(!this.$video || !this.stream || !this.stream.isLocal())
            return;
        this.$video.css({
            transform: this.localFlipX ? 'scaleX(-1)' : 'none'
        });
    }

    /**
     * Check if current video stream is screen sharing.
     * @returns {boolean}
     */
    isScreenSharing () {
        return this.videoType === 'desktop';
    }

    /**
     * Show or hide user avatar.
     * @param {boolean} show
     */
    showAvatar (show) {
        // TO FIX: Video background need to be black, so that we don't have a
        // flickering effect when scrolling between videos and have the screen
        // move to grey before going back to video. Avatars though can have the
        // default background set.
        // In order to fix this code we need to introduce video background or
        // find a workaround for the video flickering.
        $("#largeVideoContainer").css("background",
            (show) ? interfaceConfig.DEFAULT_BACKGROUND : "#000");

        this.$avatar.css("visibility", show ? "visible" : "hidden");

        this.emitter.emit(UIEvents.LARGE_VIDEO_AVATAR_DISPLAYED, show);
    }

    // We are doing fadeOut/fadeIn animations on parent div which wraps
    // largeVideo, because when Temasys plugin is in use it replaces
    // <video> elements with plugin <object> tag. In Safari jQuery is
    // unable to store values on this plugin object which breaks all
    // animation effects performed on it directly.

    show () {
        // its already visible
        if (this.isVisible) {
            return Promise.resolve();
        }

        let $wrapper = this.$wrapper;
        return new Promise((resolve) => {
            this.$wrapper.css('visibility', 'visible').fadeTo(
                FADE_DURATION_MS,
                1,
                () => {
                    this.isVisible = true;
                    resolve();
                }
            );
        });
    }

    hide () {
        // as the container is hidden/replaced by another container
        // hide its avatar
        this.showAvatar(false);

        // its already hidden
        if (!this.isVisible) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            this.$wrapper.fadeTo(FADE_DURATION_MS, 0, () => {
                this.$wrapper.css('visibility', 'hidden');
                this.isVisible = false;
                resolve();
            });
        });
    }

    /**
     * @return {boolean} switch on dominant speaker event if on stage.
     */
    stayOnStage () {
        return false;
    }
}
