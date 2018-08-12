import React, { Component } from 'react';
import ReactMic from '../ReactMic/components/ReactMic';

export default class Microphone extends Component {

  render() {
    const { record, onStop } = this.props;

    return (<ReactMic
            record={record}
            onStop={onStop}
            strokeColor="#0096ef"
            visualSetting="sinewave"
            mimeType="audio/wav"
            />)
  }
}