import React from 'react';
import { connect } from 'dva';
import { Select, Row, Col, Button, Input, Modal } from 'antd';
import ReactSimpleTimer from 'react-simple-timer';
import uuid from 'uuid';
import toWav from 'audiobuffer-to-wav';
import blobToArrayBuffer from 'blob-to-arraybuffer';

import Microphone from '../../components/Microphone';
import libCache from '../../utils/lib-cache';
import './index.css';

const Option = Select.Option;

class Record extends React.Component {
	constructor(props) {
		super(props);
	    this.state = {
	      record: false,
	      duration: 2,
	      namingPopup: false,
	      recordingName: ''
	    }
	    this.play = this.play.bind(this);
	    this.durationChange = this.durationChange.bind(this);
	    this.onStop = this.onStop.bind(this);
	    this.handleSaveRecording = this.handleSaveRecording.bind(this);
	    this.handleCancelNaming = this.handleCancelNaming.bind(this);
	    this.handleRecordingNameChange = this.handleRecordingNameChange.bind(this);
	}

	play() {
		this.props.handleRecordChange();
	    this.setState({
	      record: true
	    })
	    setTimeout(() => {
	    	let that = this;
	      that.setState({
	        record: false
	      });
	      that.props.handleRecordChange();
	    }, this.state.duration * 1000)
	}

	durationChange(val) {
		this.setState({
		  duration: val
		})
	}

	onStop(recording) {
		const id = uuid.v1();
		window.recording = recording;
		console.log(recording)
		recording.id = id;
		this.setState({
			recording: recording,
			namingPopup: true
		});
	}

	handleSaveRecording() {
		let recording = this.state.recording;
		recording.name = this.state.recordingName;

		libCache.storeRecording(recording.id, recording);
		libCache.getAllStoredRecordings().then((response=[]) => {
			this.props.handleRecordsChange(response);
		})
		window.location.reload();
	}

	handleCancelNaming() {
		this.setState({
			namingPopup: false
		})
	}

	handleRecordingNameChange(event) {
		this.setState({
			recordingName: event.target.value
		})
	}

	render() {
		return (<div style={{"marginTop": "100px"}}>
        <Row style={{"marginBottom": "10px"}}>
        <Col span={12}>
            <Microphone
            	record={this.state.record}
            	onStop={this.onStop}
            ></Microphone>
          </Col>
          <Col span={2}><b>Duration: </b></Col>
          <Col span={2}>
            <Select 
            	defaultValue={this.state.duration} 
            	width="100%" 
            	onChange={this.durationChange}
            	disabled={this.state.record}>
              <Option value="10">10s</Option>
              <Option value="20">20s</Option>
              <Option value="30">30s</Option>
              <Option value="40">40s</Option>
              <Option value="50">50s</Option>
              <Option value="60">60s</Option>
            </Select>
          </Col>
          <Col span={2}>
	            <Button
					type="primary"
					disabled={this.state.record}
					onClick={this.play}>Start Record</Button>
			</Col>
        </Row>
        <Row>
			<Col span={6}>
				<div style={{"fontSize": "50px"}}>
					<ReactSimpleTimer play={this.state.record}/>
				</div>
			</Col>
        </Row>

        <Modal
        	title="Naming"
        	visible={this.state.namingPopup}
        	okText="Save"
        	onOk={this.handleSaveRecording}
        	onCancel={this.handleCancelNaming}
        >
        <p>Please name the local recording</p>
        <Input placeholder="recording name" value={this.state.recordingName} onChange={this.handleRecordingNameChange}></Input>
        </Modal>
      </div>);
	}
}

export default connect()(Record);