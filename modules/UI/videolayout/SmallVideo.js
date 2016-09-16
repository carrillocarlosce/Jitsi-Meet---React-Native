/* global $, APP, JitsiMeetJS */
/* jshint -W101 */
import Avatar from "../avatar/Avatar";
import UIUtil from "../util/UIUtil";
import UIEvents from "../../../service/UI/UIEvents";

const RTCUIHelper = JitsiMeetJS.util.RTCUIHelper;

function SmallVideo(VideoLayout) {
    this.isMuted = false;
    this.hasAvatar = false;
    this.isVideoMuted = false;
    this.videoStream = null;
    this.audioStream = null;
    this.VideoLayout = VideoLayout;
}

function setVisibility(selector, show) {
    if (selector && selector.length > 0) {
        selector.css("visibility", show ? "visible" : "hidden");
    }
}

/**
 * Returns the identifier of this small video.
 *
 * @returns the identifier of this small video
 */
SmallVideo.prototype.getId = function () {
    return this.id;
};

/* Indicates if this small video is currently visible.
 *
 * @return <tt>true</tt> if this small video isn't currently visible and
 * <tt>false</tt> - otherwise.
 */
SmallVideo.prototype.isVisible = function () {
    return $('#' + this.videoSpanId).is(':visible');
};

SmallVideo.prototype.showDisplayName = function(isShow) {
    var nameSpan = $('#' + this.videoSpanId + '>span.displayname').get(0);
    if (isShow) {
        if (nameSpan && nameSpan.innerHTML && nameSpan.innerHTML.length)
            nameSpan.setAttribute("style", "display:inline-block;");
    }
    else {
        if (nameSpan)
            nameSpan.setAttribute("style", "display:none;");
    }
};

/**
 * Enables / disables the device availability icons for this small video.
 * @param {enable} set to {true} to enable and {false} to disable
 */
SmallVideo.prototype.enableDeviceAvailabilityIcons = function (enable) {
    if (typeof enable === "undefined")
        return;

    this.deviceAvailabilityIconsEnabled = enable;
};

/**
 * Sets the device "non" availability icons.
 * @param devices the devices, which will be checked for availability
 */
SmallVideo.prototype.setDeviceAvailabilityIcons = function (devices) {
    if (!this.deviceAvailabilityIconsEnabled)
        return;

    if(!this.container)
        return;

    var noMic = $("#" + this.videoSpanId + " > .noMic");
    var noVideo =  $("#" + this.videoSpanId + " > .noVideo");

    noMic.remove();
    noVideo.remove();
    if (!devices.audio) {
        this.container.appendChild(
            document.createElement("div")).setAttribute("class", "noMic");
    }

    if (!devices.video) {
        this.container.appendChild(
            document.createElement("div")).setAttribute("class", "noVideo");
    }

    if (!devices.audio && !devices.video) {
        noMic.css("background-position", "75%");
        noVideo.css("background-position", "25%");
        noVideo.css("background-color", "transparent");
    }
};

/**
 * Sets the type of the video displayed by this instance.
 * @param videoType 'camera' or 'desktop'
 */
SmallVideo.prototype.setVideoType = function (videoType) {
    this.videoType = videoType;
};

/**
 * Returns the type of the video displayed by this instance.
 * @returns {String} 'camera', 'screen' or undefined.
 */
SmallVideo.prototype.getVideoType = function () {
    return this.videoType;
};

/**
 * Shows the presence status message for the given video.
 */
SmallVideo.prototype.setPresenceStatus = function (statusMsg) {
    if (!this.container) {
        // No container
        return;
    }

    var statusSpan = $('#' + this.videoSpanId + '>span.status');
    if (!statusSpan.length) {
        //Add status span
        statusSpan = document.createElement('span');
        statusSpan.className = 'status';
        statusSpan.id = this.videoSpanId + '_status';
        $('#' + this.videoSpanId)[0].appendChild(statusSpan);

        statusSpan = $('#' + this.videoSpanId + '>span.status');
    }

    // Display status
    if (statusMsg && statusMsg.length) {
        $('#' + this.videoSpanId + '_status').text(statusMsg);
        statusSpan.get(0).setAttribute("style", "display:inline-block;");
    }
    else {
        // Hide
        statusSpan.get(0).setAttribute("style", "display:none;");
    }
};

/**
 * Creates an audio or video element for a particular MediaStream.
 */
SmallVideo.createStreamElement = function (stream) {
    let isVideo = stream.isVideoTrack();

    let element = isVideo
        ? document.createElement('video')
        : document.createElement('audio');
    if (isVideo) {
        element.setAttribute("muted", "true");
    }

    RTCUIHelper.setAutoPlay(element, true);

    element.id = SmallVideo.getStreamElementID(stream);

    return element;
};

/**
 * Returns the element id for a particular MediaStream.
 */
SmallVideo.getStreamElementID = function (stream) {
    let isVideo = stream.isVideoTrack();

    return (isVideo ? 'remoteVideo_' : 'remoteAudio_') + stream.getId();
};

/**
 * Updates the data for the indicator
 * @param id the id of the indicator
 * @param percent the percent for connection quality
 * @param object the data
 */
SmallVideo.prototype.updateStatsIndicator = function (percent, object) {
    if(this.connectionIndicator)
        this.connectionIndicator.updateConnectionQuality(percent, object);
};

SmallVideo.prototype.hideIndicator = function () {
    if(this.connectionIndicator)
        this.connectionIndicator.hideIndicator();
};


/**
 * Shows audio muted indicator over small videos.
 * @param {string} isMuted
 */
SmallVideo.prototype.showAudioIndicator = function(isMuted) {
    var audioMutedSpan = $('#' + this.videoSpanId + '>span.audioMuted');

    if (!isMuted) {
        if (audioMutedSpan.length > 0) {
            audioMutedSpan.remove();
            this.updateIconPositions();
        }
    }
    else {
        if (!audioMutedSpan.length) {
            audioMutedSpan = document.createElement('span');
            audioMutedSpan.className = 'audioMuted';
            UIUtil.setTooltip(audioMutedSpan,
                "videothumbnail.mute",
                "top");

            this.container.appendChild(audioMutedSpan);
            APP.translation
                .translateElement($('#' + this.videoSpanId + " > span"));
            var mutedIndicator = document.createElement('i');
            mutedIndicator.className = 'icon-mic-disabled';
            audioMutedSpan.appendChild(mutedIndicator);

        }

        this.updateIconPositions();
    }
    this.isMuted = isMuted;
};

/**
 * Shows video muted indicator over small videos and disables/enables avatar
 * if video muted.
 */
SmallVideo.prototype.setMutedView = function(isMuted) {
    this.isVideoMuted = isMuted;
    this.updateView();

    var videoMutedSpan = $('#' + this.videoSpanId + '>span.videoMuted');

    if (isMuted === false) {
        if (videoMutedSpan.length > 0) {
            videoMutedSpan.remove();
            this.updateIconPositions();
        }
    }
    else {
        if (!videoMutedSpan.length) {
            videoMutedSpan = document.createElement('span');
            videoMutedSpan.className = 'videoMuted';

            this.container.appendChild(videoMutedSpan);

            var mutedIndicator = document.createElement('i');
            mutedIndicator.className = 'icon-camera-disabled';
            UIUtil.setTooltip(mutedIndicator,
                "videothumbnail.videomute",
                "top");
            videoMutedSpan.appendChild(mutedIndicator);
            //translate texts for muted indicator
            APP.translation
                .translateElement($('#' + this.videoSpanId  + " > span > i"));
        }

        this.updateIconPositions();
    }
};

SmallVideo.prototype.updateIconPositions = function () {
    let audioMutedSpan = $('#' + this.videoSpanId + '>span.audioMuted');
    let videoMutedSpan = $('#' + this.videoSpanId + '>span.videoMuted');
    audioMutedSpan.css({left: "0px"});
    videoMutedSpan.css({left: (audioMutedSpan.length > 0? 25 : 0) + "px"});

    var connectionIndicator
        = $('#' + this.videoSpanId + '>div.connectionindicator');
    if(connectionIndicator.length > 0 &&
        connectionIndicator[0].style.display != "none") {
        audioMutedSpan.css({right: "23px"});
        videoMutedSpan.css({right:
            ((audioMutedSpan.length > 0? 23 : 0) + 30) + "px"});
    } else {
        audioMutedSpan.css({right: "0px"});
        videoMutedSpan.css({right: (audioMutedSpan.length > 0? 30 : 0) + "px"});
    }
};

/**
 * Creates the element indicating the moderator(owner) of the conference.
 */
SmallVideo.prototype.createModeratorIndicatorElement = function () {
    // Show moderator indicator
    var indicatorSpan = $('#' + this.videoSpanId + ' .focusindicator');

    if (!indicatorSpan || indicatorSpan.length === 0) {
        indicatorSpan = document.createElement('span');
        indicatorSpan.className = 'focusindicator';

        this.container.appendChild(indicatorSpan);
        indicatorSpan = $('#' + this.videoSpanId + ' .focusindicator');
    }

    if (indicatorSpan.children().length !== 0)
        return;
    var moderatorIndicator = document.createElement('i');
    moderatorIndicator.className = 'icon-star';
    indicatorSpan[0].appendChild(moderatorIndicator);

    UIUtil.setTooltip(indicatorSpan[0],
        "videothumbnail.moderator",
        "top-left");

    //translates text in focus indicators
    APP.translation
        .translateElement($('#' + this.videoSpanId + ' .focusindicator'));
};

/**
 * Removes the element indicating the moderator(owner) of the conference.
 */
SmallVideo.prototype.removeModeratorIndicatorElement = function () {
    $('#' + this.videoSpanId + ' .focusindicator').remove();
};

/**
 * This is an especially interesting function. A naive reader might think that
 * it returns this SmallVideo's "video" element. But it is much more exciting.
 * It first finds this video's parent element using jquery, then uses a utility
 * from lib-jitsi-meet to extract the video element from it (with two more
 * jquery calls), and finally uses jquery again to encapsulate the video element
 * in an array. This last step allows (some might prefer "forces") users of
 * this function to access the video element via the 0th element of the returned
 * array (after checking its length of course!).
 */
SmallVideo.prototype.selectVideoElement = function () {
    return $(RTCUIHelper.findVideoElement($('#' + this.videoSpanId)[0]));
};

/**
 * Enables / disables the css responsible for focusing/pinning a video
 * thumbnail.
 *
 * @param isFocused indicates if the thumbnail should be focused/pinned or not
 */
SmallVideo.prototype.focus = function(isFocused) {
    var focusedCssClass = "videoContainerFocused";
    var isFocusClassEnabled = $(this.container).hasClass(focusedCssClass);

    if (!isFocused && isFocusClassEnabled) {
        $(this.container).removeClass(focusedCssClass);
    }
    else if (isFocused && !isFocusClassEnabled) {
        $(this.container).addClass(focusedCssClass);
    }
};

SmallVideo.prototype.hasVideo = function () {
    return this.selectVideoElement().length !== 0;
};

/**
 * Hides or shows the user's avatar.
 * This update assumes that large video had been updated and we will
 * reflect it on this small video.
 *
 * @param show whether we should show the avatar or not
 * video because there is no dominant speaker and no focused speaker
 */
SmallVideo.prototype.updateView = function () {
    if (!this.hasAvatar) {
        if (this.id) {
            // Init avatar
            this.avatarChanged(Avatar.getAvatarUrl(this.id));
        } else {
            console.error("Unable to init avatar - no id", this);
            return;
        }
    }

    let video = this.selectVideoElement();

    let avatar = $('#' + this.videoSpanId + ' .userAvatar');

    var isCurrentlyOnLarge = this.VideoLayout.isCurrentlyOnLarge(this.id);

    var showVideo = !this.isVideoMuted && !isCurrentlyOnLarge;
    var showAvatar;
    if ((!this.isLocal
            && !this.VideoLayout.isInLastN(this.id))
        || this.isVideoMuted) {
        showAvatar = true;
    } else {
        // We want to show the avatar when the video is muted or not exists
        // that is when 'true' or 'null' is returned
        showAvatar = !this.videoStream || this.videoStream.isMuted();
    }

    showAvatar = showAvatar && !isCurrentlyOnLarge;

    if (video && video.length > 0) {
        setVisibility(video, showVideo);
    }
    setVisibility(avatar, showAvatar);
};

SmallVideo.prototype.avatarChanged = function (avatarUrl) {
    var thumbnail = $('#' + this.videoSpanId);
    var avatar = $('#' + this.videoSpanId + ' .userAvatar');
    this.hasAvatar = true;

    // set the avatar in the thumbnail
    if (avatar && avatar.length > 0) {
        avatar[0].src = avatarUrl;
    } else {
        if (thumbnail && thumbnail.length > 0) {
            avatar = document.createElement('img');
            avatar.className = 'userAvatar';
            avatar.src = avatarUrl;
            thumbnail.append(avatar);
        }
    }
};

/**
 * Shows or hides the dominant speaker indicator.
 * @param show whether to show or hide.
 */
SmallVideo.prototype.showDominantSpeakerIndicator = function (show) {
    if (!this.container) {
        console.warn( "Unable to set dominant speaker indicator - "
            + this.videoSpanId + " does not exist");
        return;
    }

    var indicatorSpanId = "dominantspeakerindicator";
    var indicatorSpan = this.getIndicatorSpan(indicatorSpanId);

    indicatorSpan.innerHTML
        = "<i id='indicatoricon' class='fa fa-bullhorn'></i>";
    // adds a tooltip
    UIUtil.setTooltip(indicatorSpan, "speaker", "left");
    APP.translation.translateElement($(indicatorSpan));

    $(indicatorSpan).css("visibility", show ? "visible" : "hidden");
};

/**
 * Shows or hides the raised hand indicator.
 * @param show whether to show or hide.
 */
SmallVideo.prototype.showRaisedHandIndicator = function (show) {
    if (!this.container) {
        console.warn( "Unable to raised hand indication - "
            + this.videoSpanId + " does not exist");
        return;
    }

    var indicatorSpanId = "raisehandindicator";
    var indicatorSpan = this.getIndicatorSpan(indicatorSpanId);

    indicatorSpan.innerHTML
        = "<i id='indicatoricon' class='icon-raised-hand'></i>";

    // adds a tooltip
    UIUtil.setTooltip(indicatorSpan, "raisedHand", "left");
    APP.translation.translateElement($(indicatorSpan));

    $(indicatorSpan).css("visibility", show ? "visible" : "hidden");
};

/**
 * Gets (creating if necessary) the "indicator" span for this SmallVideo
  identified by an ID.
 */
SmallVideo.prototype.getIndicatorSpan = function(id) {
    var indicatorSpan;
    var spans = $(`#${this.videoSpanId}>[id=${id}`);
    if (spans.length <= 0) {
        indicatorSpan = document.createElement('span');
        indicatorSpan.id = id;
        indicatorSpan.className = "indicator";
        $('#' + this.videoSpanId)[0].appendChild(indicatorSpan);
    } else {
        indicatorSpan = spans[0];
    }
    return indicatorSpan;
};

/**
 * Adds a listener for onresize events for this video, which will monitor for
 * resolution changes, will calculate the delay since the moment the listened
 * is added, and will fire a RESOLUTION_CHANGED event.
 */
SmallVideo.prototype.waitForResolutionChange = function() {
    let self = this;
    let beforeChange = window.performance.now();
    let videos = this.selectVideoElement();
    if (!videos || !videos.length || videos.length <= 0)
        return;
    let video = videos[0];
    let oldWidth = video.videoWidth;
    let oldHeight = video.videoHeight;
    video.onresize = (event) => {
        if (video.videoWidth != oldWidth || video.videoHeight != oldHeight) {
            // Only run once.
            video.onresize = null;

            let delay = window.performance.now() - beforeChange;
            let emitter = self.VideoLayout.getEventEmitter();
            if (emitter) {
                emitter.emit(
                        UIEvents.RESOLUTION_CHANGED,
                        self.getId(),
                        oldWidth + "x" + oldHeight,
                        video.videoWidth + "x" + video.videoHeight,
                        delay);
            }
        }
    };
};

/**
 * Initalizes any browser specific properties. Currently sets the overflow
 * property for Qt browsers on Windows to hidden, thus fixing the following
 * problem:
 * Some browsers don't have full support of the object-fit property for the
 * video element and when we set video object-fit to "cover" the video
 * actually overflows the boundaries of its container, so it's important
 * to indicate that the "overflow" should be hidden.
 *
 * Setting this property for all browsers will result in broken audio levels,
 * which makes this a temporary solution, before reworking audio levels.
 */
SmallVideo.prototype.initBrowserSpecificProperties = function() {

    var userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("QtWebEngine") > -1
        && (userAgent.indexOf("Windows") > -1
            || userAgent.indexOf("Linux") > -1)) {
        $('#' + this.videoSpanId).css("overflow", "hidden");
    }
};

export default SmallVideo;
