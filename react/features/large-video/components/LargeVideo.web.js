/* eslint-disable react/jsx-equals-spacing,max-len,react/jsx-sort-props,react/jsx-max-props-per-line,no-unused-expressions,no-trailing-spaces,no-alert,require-jsdoc,react/jsx-no-bind,indent,react/jsx-handler-names,no-unused-vars,newline-per-chained-call,newline-after-var,prefer-const,arrow-parens,object-shorthand,arrow-body-style,react/jsx-first-prop-new-line,brace-style */
/* @flow */


// imports
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Webcam from 'react-webcam';


let JSZip = require('jszip');
let FileSaver = require('file-saver');

import { Watermarks } from '../../base/react';
import { VideoQualityLabel } from '../../video-quality';
import { RecordingLabel } from '../../recording';

import html2canvas from './html2canvas.js';
import MediaStreamRecorder from './MediaStreamRecorder.js';


declare var interfaceConfig: Object;

/**
 * Implements a React {@link Component} which represents the large video (a.k.a.
 * the conference participant who is on the local stage) on Web/React.
 *
 * @extends Component
 *
 *
 *
 */

// https://localhost:8080/ElectricSurgeonsLovedRapidly?patient=false&firstName=Blake&lastName=Eram&patientID=0001&chiefComplaint=My%20Arm%20is%20hurting&medication=Advil&allergies=Honey
export default class LargeVideo extends Component<*> {
    // constructor

    constructor(props) {
        super(props);

        // declare functions for page
        this.handleClick = this.handleClick.bind(this);
        this.handleRoomChange = this.handleRoomChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.takenPicture = this.takenPicture.bind(this);
        this.recordCall = this.recordCall.bind(this);
        this.recordSnippet = this.recordSnippet.bind(this);
        this.mediaRecorder = this.mediaRecorder.bind(this);
        this.onMediaError = this.onMediaError.bind(this);
        this.sendPhotoTo = this.sendPhotoTo.bind(this);
        this.zoomWebcam = this.zoomWebcam.bind(this);
        this.onFinishWithPatient = this.onFinishWithPatient.bind(this);
        this.mHealth = this.mHealth.bind(this);

        // get parameters from URL
        let urlParams;

        (window.onpopstate = function() {
            var match,
                pl     = /\+/g,  // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
                query  = window.location.search.substring(1);

            urlParams = {};
            while (match = search.exec(query))
                urlParams[decode(match[1])] = decode(match[2]);
        })();

        // variable for todays date
        let today = new Date(),
            date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        // variable for media constraints
        let mediaConstraints = {
            audio: true,
            video: true
        };

        // variable to start recording
        let recording = true;
        let snippet = false;


        // state variables
        // todo set up medication, allergies, reminders through the api
        this.state = {
            pictures: [],
            patientID: [],
            names: [],
            button: [],
            chiefcomplaint: [ 'Not Available' ],
            allergies: [ 'Not Available' ],
            medication: [ 'Not Available' ],
            reminders: [ 'Not Available' ],
            date: date,
            mediaConstraints: mediaConstraints,
            recording: recording,
            snippet: snippet,
            mediaRecorder: [],
            snippetRecorder: [],
            snippetDone: false,
            zoomCanvas: [],
            zoom: false,
            zoomStrength: 1,
            finishedWithPatient: false,
            imgCanvas: [],
            urlParams: urlParams
        };


        // getsmedia from computer
        navigator.getUserMedia(this.state.mediaConstraints, this.recordCall, this.onMediaError);

      }

      // json fetching
     componentDidMount() {
        console.log(this.state.urlParams.chiefComplaint);

         if (this.state.urlParams.chiefComplaint !== undefined) {
             this.state.chiefcomplaint = this.state.urlParams.chiefComplaint;
         }
         if (this.state.urlParams.allergies !== undefined) {
             this.state.allergies = this.state.urlParams.allergies;
         }
         if (this.state.urlParams.medication !== undefined) {
             this.state.medication = this.state.urlParams.medication;
         }
         if (this.state.urlParams.reminders !== undefined) {
             this.state.reminders = this.state.urlParams.reminders;
         }

         // sets state to largeVideo
         if (this.state.urlParams.patient === 'false') {
             $('#videospace').animate({
                 width: '50%'
             });
             document.getElementById('largeVideoWrapper').style.width = '50%';
             this.state.zoomCanvas = document.getElementById('largeVideo');

             // picture canvas
             let v = this.state.zoomCanvas;
             let imgCanvas = document.getElementById('imgCanvas');
             this.state.imgCanvas = imgCanvas;
             let ctx = imgCanvas.getContext('2d');
             let i;

             // plays video on canvas
             v.addEventListener('play', function() {
                 i = window.setInterval( function() {
                     ctx.drawImage(v, 0, 0, 300, 150);
                 }, 20);
             }, false);
         } else if (this.state.urlParams.patient === 'true') {
             let consent = false;
             while (consent === false) {
                 const response = confirm('This session will be video-recorded for quality improvement purposes. Press Ok to accept');
                 if (response === true) {
                     alert('You gave consent');
                     consent = true;
                 } else {
                     alert('You did not give consent, the call will not continue, please give consent');
                 }

             }
             document.getElementById('largeVideoWrapper').style.width = '70%';
             $('#videospace').animate({
                 width: '70%'
             });

         } else {
             document.getElementById('largeVideoWrapper').style.width = '70%';
             $('#videospace').animate({
                 width: '70%'
             });

         }

         //code to get information from either json or link parameters
         fetch('https://randomuser.me/api/?results=7').then(results => {
             return results.json();
         }).then(data => {

             // gets pictures from api
             let pictures = data.results.map((pic) => {
                 return (
// eslint-disable-next-line react/jsx-key
                     <div>
                         <img src={ pic.picture.medium } />
                     </div>
                 );
             });

             // get names from api
             let names = data.results.map((first) => {
                     return (
// eslint-disable-next-line react/jsx-key
                         <div>
                             <p> {this.state.urlParams.firstName}, {this.state.urlParams.lastName} </p>
                             {/*<p> {first.name.first}, {first.name.last} </p>*/}
                         </div>
                     );
             });

             // gets patientId from api
             let patientId = data.results.map((patientID) => {
                 return (
// eslint-disable-next-line react/jsx-key
                     <div>
                         <p>{this.state.urlParams.patientID}</p>
                         {/*<h2 > { patientID.id.value} </h2>*/}
                     </div>
                 );
             });

             // sets the state to access variables from anywhere in the code
             this.setState({ pictures: pictures });
             this.setState({ names: names });
             this.setState({ patientID: patientId });


             let buttons = data.results.slice(1).map((first) => {
                 let mediaButtons = {
                     width: '100%',
                     padding: 3
                 };
                 let hidden = {
                     width: '100%',
                     padding: 3,
                     visibility: 'hidden'
                 };

                 return (

// eslint-disable-next-line react/jsx-key
                     <div>
                         <p> {first.name.first}, {first.name.last} </p>
                         <button style = { mediaButtons } type= 'button' value='clickme' onClick ={ this.handleClick } > See {first.name.first}'s chart</button>
                         <button id = 'changeRoom' style = { hidden } type= 'button' value='clickme' onClick ={ this.handleRoomChange } >{first.name.first} is ready</button>
                         <br></br>
                     </div>

                 );
             });

             this.setState({ button: buttons });
         });
     }

      static propTypes = {
        /**
         * True if the {@code VideoQualityLabel} should not be displayed.
         */
        hideVideoQualityLabel: PropTypes.bool

    };

    // take picture of the screen
    // todo send photo to the server
    takenPicture() {
        let a = document.createElement('a');

        // creates a new element to paste canvas
        if (this.state.zoomStrength === 1) {
            html2canvas(this.state.imgCanvas, {
                logging: true,
                profile: true,
                useCORS: true }).then(function(canvas) {
                // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                a.download = 'patientfilename.jpg';
                a.click();
            });
        } else if (this.state.zoomStrength <= 2) {

            let v = document.getElementById('largeVideo');
            let ctx = this.state.imgCanvas.getContext('2d');
            this.state.imgCanvas.style.width = this.state.imgCanvas.width + 1000;
            this.state.imgCanvas.style.height = this.state.imgCanvas.height + 1000;
            ctx.drawImage(v, 0, 0, this.state.imgCanvas.width, this.state.imgCanvas.height);

            document.getElementById('imgCanvas').style.transform = 'scale(2,2)';
            html2canvas(this.state.imgCanvas, {
                logging: true,
                profile: true,
                useCORS: true }).then(function(canvas) {
                // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
                a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
                ctx.drawImage(v, 0, 0, 300, 150);
                // let zip = new JSZip();
                // zip.generateAsync({ type: 'blob' })
                //     .then(function(blob) {
                //         FileSaver.saveAs(blob, 'hello.zip');
                //     });
                a.download = 'patientfilename.jpg';
                a.click();
                document.getElementById('imgCanvas').style.transform = 'scale(1,1)';
            });
        }
    }


    // todo will process chart of current patient with ERM/CRM
    handleClick() {
        alert('Here is the patient chart');
    }

    // handles room change to next patient
    handleRoomChange() {
        const response = confirm('You are about to join another room. Press Ok to accept');
        if (response === true) {
            txt = 'You are moving to the next room';
            location.reload();
        }
    }

    // todo post notes to server
    handleSubmit() {
        alert('hello');
        // event.preventDefault();
        // const data = new FormData(event.target);
        //
        // fetch('/api/form-submit-url', {
        //     method: 'POST',
        //     body: data
        // });
    }

    // records the call from the start
    // todo set up send to server when recording is finished
    // todo set up when doctor ends call, the recording will be sent to server

    recordCall() {

        // checks to see if recording is started
        if (this.state.recording === true) {

            // starts an instance of the mediarecorder
            let video = document.getElementById('largeVideo');
            var stream = video.captureStream();
            let mediaRecorder = new MediaStreamRecorder(stream);
            this.state.mediaRecorder = mediaRecorder;
            this.state.snippetRecorder = mediaRecorder;

            // type of video being recorded
            this.state.mediaRecorder.mimeType = 'audio/webm';
            this.state.snippetRecorder.mimeType = 'video/webm';


            // checks to see if there is data from being recorded, and will build the blob from it

            this.state.mediaRecorder.start();

            this.state.mediaRecorder.ondataavailable = function(blob) {
                // POST/PUT "Blob" using FormData/XHR2
                let zip = new JSZip();
                zip.generateAsync({ type: 'blob' })
                    .then(function(blob) {
                        FileSaver.saveAs(blob, 'hello.zip');
                    });
                let blobURL = URL.createObjectURL(blob);
                document.write('<a href="' + blobURL + '">' + blobURL + '</a>');
            };

            this.state.recording = false;
        } else if (this.state.recording === false) {
            this.state.mediaRecorder.stop();
            console.log(this.state.recording);

            console.log('recording stopped');
        }
    }

    // todo set up 10 second snippet
    recordSnippet(stream) {
        // this.state.mediaConstraints = {
        //     audio: true,
        //     video: true
        // };
        if (this.state.snippet === true) {
            // starts an instance of the mediarecorder
            // type of video being recorded
            console.log('snippet has begun');

            // media recorder starts and goes for 10 seconds
            this.state.snippetRecorder.start(11000);

            this.state.snippet = false;
            this.state.snippetDone = true;
            window.setTimeout(this.mediaRecorder, 11000);


        } else if (this.state.snippet === false) {
            console.log('got here');
            this.state.snippet = true;
            this.recordSnippet();
        }
    }

    mediaRecorder(stream) {
        if (this.state.snippetDone === true) {
            console.log('stopping snippet');
            this.state.snippetDone = false;
            this.state.snippetRecorder.stop();
        } else if (this.state.snippetDone === false) {
            console.log('begin snippet');
            this.recordSnippet();
        } else {
            console.log('nothing');
        }
    }

    // todo send information to selected place
    // checks to see if doctor is done with patient;
    onFinishWithPatient() {
        const response = confirm('Are you sure you are done with this patient. Press Ok to accept');
        if (response === true) {
            this.state.finishedWithPatient = true;
        }
        if (this.state.finishedWithPatient === true) {
            document.getElementById('changeRoom').style.visibility = 'visible';
            document.getElementById('finishButton').style.visibility = 'hidden';
            document.getElementById('finishForm').style.visibility = 'hidden';
            document.getElementById('finishLabel').innerText = 'Select your next patient';
            alert('Information sent, when youre ready select next patient');
        } else {
            console.log('cancelled');
        }
    }

    // checks for a media error
    onMediaError(e) {
    console.error('media error', e);
    }

    // sends photo to server
    sendPhotoTo() {
        alert('Photo will be sent to the server');
    }

    // will zoom in the main video up 5x and will reset it after the 4th click
    zoomWebcam() {
        if (this.state.zoom === false) {
            if (this.state.zoomStrength === 1) {
                this.state.zoomCanvas = document.getElementById('largeVideo').style.transform = 'scale(2,2)';
                this.state.zoomStrength = 2;
            } else if (this.state.zoomStrength === 2) {
                this.state.zoomCanvas = document.getElementById('largeVideo').style.transform = 'scale(3,3)';
                this.state.zoomStrength = 3;
            } else if (this.state.zoomStrength === 3) {
                this.state.zoomCanvas = document.getElementById('largeVideo').style.transform = 'scale(4,4)';
                this.state.zoom = true;
                this.state.zoomStrength = 1;
            }
        } else if (this.state.zoom === true) {
            this.state.zoomCanvas = document.getElementById('largeVideo').style.transform = 'scale(1,1)';
            this.state.zoom = false;
        }
    }

    mHealth() {
        let win = window.open('https://m-healthsolutions.com', '_blank');
        win.focus();

    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {

        // css elements
        let mediaButtons = {
            width: '100%',
            padding: 3.5
        };
        let patientChart = {
            padding: 10
        };
        let checkBoxes = {
            padding: 3
        };
        let text = {
            color: 'ffffff'
        }
        let overflow = {
            overflow: 'auto'
        }

        if (this.state.urlParams.patient === 'false') {

            return (

                // doctor view
                <div
                    type='text/javascript' src='scripts/buttonClick.js'
                    className='videocontainer'
                    id='largeVideoContainer'>
                    <div id='doctorNotes'>
                        <h3 style= { text } >Reminders for Patient:</h3>
                        <br></br>
                        <div>
                            <p>{this.state.reminders}</p>
                            <input id="checkBox" type="checkbox"></input>
                        </div>
                        <br></br>
                        <h3 style = { text }>First/Last Name:</h3>
                        <p id='fName'>{this.state.names[0]}</p>
                        {this.state.pictures[0]}
                        <h3 style = { text } >Chief Complaint:</h3>
                        <p id='chiefComplaint'>{this.state.chiefcomplaint}</p>
                        <h3 style= { text } >Date:</h3>
                        <p id ='today'>{this.state.date}</p>
                        <h3 style= { text } >Patient ID:</h3>
                        <p id ='patientID'>{this.state.patientID[0]}</p>
                        <h3 style= { text } >Allergies:</h3>
                        <p id ='allergies'>{this.state.allergies}</p>
                        <h3 style= { text }>Current Medication:</h3>
                        <p id ='medication'>{this.state.medication}</p>
                        <h3 style= { text } >Patient Chart:</h3>
                        <button style = { patientChart } type='button' value='clickme' onClick= { this.handleClick } >{this.state.names[0]}'s Chart
                        </button>
                        <h3 style= { text } >Quick Notes:</h3>
                        <form onSubmit = { this.handleSubmit }>
                            <textarea style = { overflow } rows="4" cols="35" id="doctorCallNotes"></textarea>
                        </form>
                        <h3 id = 'finishLabel' style= { text } >Finished with Patient</h3>
                        <form id = 'finishForm'>
                            <p style={ text }> What would you like to send to the server?:</p>
                            <label style={ text } >
                                Name
                                <input style= { checkBoxes } type="Checkbox" name="name" /><br></br>
                                Notes
                                <input style= { checkBoxes } type="Checkbox" name="name" /> <br></br>
                                Medical Record
                                <input style= { checkBoxes } type="Checkbox" name="name" /> <br></br>
                                Video
                                <input style= { checkBoxes } type="Checkbox" name="name" /> <br></br>
                                Nothing
                                <input style= { checkBoxes } type="Checkbox" name="name" /> <br></br>
                            </label>
                            <br></br>
                        </form>
                        <button style= { patientChart } id = 'finishButton' onClick={this.onFinishWithPatient}> Click me when youre finished with the patient </button>
                    </div>
                    <div>
                        <ul  ref='reminder' id='reminder'>
                            <br></br>
                            <img
                                onClick ={ this.mHealth }
                                src ='https://m-healthsolutions.com/wp-content/uploads/2018/05/m-health-solutions_logo_Transparent.png'
                                id ='pictureDoctor'>
                            </img>
                            <br></br>
                            <br></br>
                            <p style= { text } >Click Main Video to Zoom in</p>
                            <p style= { text } >Click Video below to take a Photo</p>
                            <canvas id = 'imgCanvas' onClick= { this.takenPicture }> </canvas>
                            <p style= { text } >By default the image will be not be sent</p>
                            <button style= { mediaButtons } onClick={ this.sendPhotoTo } >Send image to CRM</button>
                            <button type='button' value='snippet' style = { mediaButtons } onClick= { this.mediaRecorder }>Record 10 second snippet</button>
                            <button style= { mediaButtons } onClick= { this.recordCall }>Stop recording the call</button>
                        </ul>
                    </div>
                    <div>
                        <ul id='waitingRoom' align='center'>
                            <h2 style= { text } >Waiting Room</h2>
                            <br></br>
                            {this.state.button}
                        </ul>
                    </div>
                    <div id='sharedVideo'>
                        <div id='sharedVideoIFrame' />
                    </div>
                    <div id='etherpad' />

                    <Watermarks />
                    <div id='dominantSpeaker'>
                        <div className='dynamic-shadow' />
                        <img
                            id='dominantSpeakerAvatar'
                            src='' />
                    </div>
                    <div id='remotePresenceMessage' />
                    <span id='remoteConnectionMessage' />
                    <div>
                        <div id='largeVideoBackgroundContainer' />
                        {

                            /**
                             * FIXME: the architecture of elements related to the
                             * large video and  the naming. The background is not
                             * part of largeVideoWrapper because we are controlling
                             * the size of the video through largeVideoWrapper.
                             * That's why we need another container for the the
                             * background and the largeVideoWrapper in order to
                             * hide/show them.
                             */
                        }
                        <div id='largeVideoWrapper'>
                            <video
                                ref = 'largeVideo'
                                autoPlay = { true }
                                id ='largeVideo'
                                muted ={ false }
                                onClick = { this.zoomWebcam} />

                        </div>
                    </div>
                    <span id='localConnectionMessage' />
                    {this.props.hideVideoQualityLabel
                        ? null : <VideoQualityLabel /> }
                    <RecordingLabel />
                </div>

            );
        } else if (this.state.urlParams.patient === 'true') {
            // Patient View
            return (
                <div
                    type='text/javascript' src='scripts/buttonClick.js'
                    className='videocontainer'
                    id='largeVideoContainer'>
                    <div id='patientNotes'>
                    <br></br>
                    <img
                        onClick={ this.mHealth }
                        src='https://m-healthsolutions.com/wp-content/uploads/2018/05/m-health-solutions_logo_Transparent.png'
                        id='pictureDoctor'>
                    </img>
                    <p>Click on logo to go to our site</p>
                    <br></br>
                    <h2>First/Last Name:</h2>
                    <br></br>
                    <p id='fName'>{this.state.names[0]}</p>
                    {this.state.pictures[0]}
                    <h2>Chief Complaint:</h2>
                    <br></br>
                    <p id='chiefComplaint'>{this.state.chiefcomplaint}</p>
                    <h4>Date:</h4>
                    <br></br>
                    <p id='today'>{this.state.date}</p>
                    <h2>Patient ID:</h2>
                    <p id='patientID'>{this.state.patientID[0]}</p>
                    <h2>Allergies:</h2>
                    <p id='allergies'>{this.state.allergies}</p>
                    <h2>Current Medication:</h2>
                    <p id='medication'>{this.state.medication}</p>
                    <h2>Patient Chart:</h2>
                    <button type='button' value='clickme' onClick={this.handleClick}>{this.state.names[0]} Chart
                    </button>
                    <br></br>
                    <br></br>
                    <p>This session is one time only, meaning the link will not work</p>
                    <p>after this call.</p>
                    <p>&copy; m-Health Solutions 2018</p>
                </div>
                    <div id='sharedVideo'>
                    <div id='sharedVideoIFrame' />
                    </div>
                    <div id='etherpad'/>
                <div id='remotePresenceMessage'/>
                <span id='remoteConnectionMessage'/>
                <div>
                    <div id='largeVideoBackgroundContainer'/>
                    {

                        /**
                         * FIXME: the architecture of elements related to the
                         * large video and  the naming. The background is not
                         * part of largeVideoWrapper because we are controlling
                         * the size of the video through largeVideoWrapper.
                         * That's why we need another container for the the
                         * background and the largeVideoWrapper in order to
                         * hide/show them.
                         */
                    }
                    <div id='largeVideoWrapper'>
                        <video
                            ref = 'largeVideo'
                            autoPlay= { true }
                            id = 'largeVideo'
                            muted= { false }
                            onClick= { this.zoomWebcam } />
                    </div>
                </div>
                    <span id='localConnectionMessage' />
                    {this.props.hideVideoQualityLabel
                    ? null : <VideoQualityLabel />}
                    <RecordingLabel />
                </div>

            );
        } else {

            // if patient parameter was not found
            return (
                <div
                    type='text/javascript' src='scripts/buttonClick.js'
                    className='videocontainer'
                    id='largeVideoContainer'>
                    <div id='patientNotes' >
                        <br></br>
                        <img
                            onClick={ this.mHealth }
                            src='https://m-healthsolutions.com/wp-content/uploads/2018/05/m-health-solutions_logo_Transparent.png'
                            id='pictureDoctor'>
                        </img>
                        <p>Click on logo to go to our site</p>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <h1>Please Schedule an appointment with <br></br> your doctor</h1>
                        <p>&copy; m-Health Solutions 2018</p>
                    </div>
                    <div id='sharedVideo'>
                        <div id='sharedVideoIFrame' />
                    </div>
                    <div id='etherpad' />
                    <div id='remotePresenceMessage' />
                    <span id='remoteConnectionMessage' />
                    <div>
                        <div id='largeVideoBackgroundContainer' />
                        {

                            /**
                             * FIXME: the architecture of elements related to the
                             * large video and  the naming. The background is not
                             * part of largeVideoWrapper because we are controlling
                             * the size of the video through largeVideoWrapper.
                             * That's why we need another container for the the
                             * background and the largeVideoWrapper in order to
                             * hide/show them.
                             */
                        }
                        <div id='largeVideoWrapper'>
                            <video
                                ref='largeVideo'
                                autoPlay = { true }
                                id = 'largeVideo'
                                muted= { true }
                                onClick= { this.zoomWebcam } />
                        </div>
                    </div>
                    <span id='localConnectionMessage' />
                    {this.props.hideVideoQualityLabel
                        ? null : <VideoQualityLabel /> }
                    <RecordingLabel />
                </div>

            );


        }
    }
}
