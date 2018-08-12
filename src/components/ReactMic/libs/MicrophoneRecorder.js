import AudioContext from './AudioContext';

let analyser;
let audioCtx;
let mediaRecorder;
let chunks = [];
let startTime;
let stream;
let mediaOptions;
let blobObject;
let onStartCallback;
let onStopCallback;

let _writeString = (view, offset, string) => {
      for (var i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
      }
  }

let _floatTo16BitPCM = (output, offset, input) => {
      for (var i = 0; i < input.length; i++, offset += 2) {
          var s = Math.max(-1, Math.min(1, input[i]));
          output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
  }

let  _encodeWAV = (samples) => {
    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buffer);
    let numChannels = 1;
    let sampleRate = 44100;

    /* RIFF identifier */
    _writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    _writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    _writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    _writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    _floatTo16BitPCM(view, 44, samples);

    return view;
  }

const constraints = { audio: true, video: false }; // constraints - only audio needed

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

export class MicrophoneRecorder {
  constructor(onStart, onStop, options) {
    onStartCallback= onStart;
    onStopCallback= onStop;
    mediaOptions= options;
  }

  startRecording=() => {

    startTime = Date.now();

    if(mediaRecorder) {

      if(audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if(mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        return;
      }

      if(audioCtx && mediaRecorder && mediaRecorder.state === 'inactive') {
        mediaRecorder.start(10);
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        if(onStartCallback) { onStartCallback() };
      }
    } else {
      if (navigator.mediaDevices) {
        console.log('getUserMedia supported.');

        navigator.mediaDevices.getUserMedia(constraints).then((str) => {
          stream = str;
          if(MediaRecorder.isTypeSupported(mediaOptions.mimeType)) {
            mediaRecorder = new MediaRecorder(str, mediaOptions);
          } else {
            mediaRecorder = new MediaRecorder(str);
          }

          if(onStartCallback) { onStartCallback() };

          mediaRecorder.onstop = this.onStop;
          mediaRecorder.ondataavailable = (event) => {
            chunks.push(event.data);
          }

          audioCtx = AudioContext.getAudioContext();
          analyser = AudioContext.getAnalyser();

          audioCtx.resume();
          mediaRecorder.start(10);

          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          //source.connect(audioCtx.createMediaStreamDestination());

          console.log(audioCtx.destination)
          var audio = new Audio();
/*          var o = audioCtx.createOscillator();
          o.start();
          var dest = audioCtx.createMediaStreamDestination();
          o.connect(dest);*/
          audio.src = URL.createObjectURL(stream);
          audio.play();

        });
      } else {
        alert('Your browser does not support audio recording');
      }
    }

  }

  stopRecording() {
    if(mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      audioCtx.suspend();
    }
  }

  onStop(evt) {
    //const blob = new Blob(chunks, { 'type' : mediaOptions.mimeType });
    const blob = new Blob(chunks, { 'type' : 'audio/wav' });

    const blobObject =  {
      blob      : blob,
      blobWav   : new Blob([_encodeWAV(chunks)], { 'type': 'audio/wav'}),
      startTime : startTime,
      stopTime  : Date.now(),
      options   : mediaOptions,
      blobURL   : window.URL.createObjectURL(blob)
    }

    chunks = [];
    if(onStopCallback) { onStopCallback(blobObject) };

  }

}
