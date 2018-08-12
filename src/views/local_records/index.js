import React from 'react';
import {connect} from 'dva';
import { Table, Modal, Button } from 'antd';
import dateFormat from 'dateformat';
import {ReactSoundDisplay} from 'react-sound-display';
import toWav from 'audiobuffer-to-wav';
import toBuffer from 'blob-to-buffer';
import libCache from '../../utils/lib-cache';
import axios from 'axios';

import mp3 from './test0.wav'

class LocalRecords extends React.Component {

	constructor() {
		super();
		this.state = {
			showRecordDisplayModal: false
		};
		this.audio = React.createRef();
		this.handleRecordClick = this.handleRecordClick.bind(this);
		this.closeRecordDisplayModal = this.closeRecordDisplayModal.bind(this);
		this.uploadRecord = this.uploadRecord.bind(this);
		this.deleteRecord = this.deleteRecord.bind(this);
	}

	handleRecordClick(item) {
		this.setState({
			showRecordDisplayModal: true,
			selectedRecord: item
		});
	}

	uploadRecord(record) {
		console.log(record)
		let data = new FormData();
		data.append('name', record.name + new Date().getTime());
		data.append('file', record.blobWav, {type: 'audio/wav'});
		axios({
			method: 'post',
			url: `http://localhost:3000/api/uploadRecord?name=${record.name}`,
			headers: {
				'content-type': 'multipart/form-data'
			},
				data: data
			}).then((response) => {
				console.log(response);
		});
	}

	deleteRecord(record) {
		let result = this.state.records.filter((item) => item.id !== record.id)
		this.setState({
			records: result
		});
		libCache.replaceRecordings(result);
	}

	componentDidMount() {
		let columns = [	
			{
				title: 'Name',
				dataIndex: 'name',
				key: 'name',
				render: (text, item, index) => {
					return <a onClick={e => { this.handleRecordClick(item)}}>{text}</a>
				}
			},
			{
				title: 'Recording Time',
				dataIndex: 'recordingTime',
				key: 'recordingTime'
			},
			{
				title: 'Duration',
				dataIndex: 'duration',
				key: 'duration'
			},
			{
				title: 'Size',
				dataIndex: 'size',
				key: 'size'
			},
			{
				title: 'Upload / Delete',
				dataIndex: 'upload',
				key: 'upload',
				render: (text, record, index) => {
					return (<div>
						 <Button type="primary" shape="circle" icon="upload" onClick={() => { this.uploadRecord(record)}}/>
						 <Button type="danger" shape="circle" icon="delete" onClick={() => { this.deleteRecord(record)}}style={{'marginLeft': '10px'}} />
					</div>)
				}
			}
		];

		this.setState({
			columns,
			records: this.props.records
		});

	}
	componentDidUpdate() {
		var canvas = document.getElementById('canvas');
		if (canvas && this.state.selectedRecord) {
			document.getElementsByTagName('audio')[0] && document.getElementsByTagName('audio')[0].remove();
			
			let audio = new Audio(URL.createObjectURL(this.state.selectedRecord.blob));
			//let audio = new Audio(mp3);
			audio.controls = 'controls';

			audio.preload = 'metadata';

			audio.addEventListener('loadedmetadata', () => {
				if(audio.duration === Infinity) {
					audio.currentTime = 1000000;
				}
			})

			audio.addEventListener('canplaythrough', () => {
				document.getElementById('container').prepend(audio);
			})
	/*		audio.play();
			audio.pause();*/

			var ctx = new AudioContext();
		    var analyser = ctx.createAnalyser();
	    	this.audioSrc = ctx.createMediaElementSource(audio);

	    	//frequency process
	    	var gainNode = ctx.createGain()
			var lowpass = ctx.createBiquadFilter()
			var highpass = ctx.createBiquadFilter()

			this.audioSrc.connect(lowpass)
			lowpass.connect(highpass)
			highpass.connect(gainNode)
			//gainNode.connect(ctx.destination)

			lowpass.type = "lowpass"
			lowpass.frequency.value = 750
			lowpass.gain.value = -1
			highpass.type = "highpass"
			highpass.frequency.value = 20
			highpass.gain.value = -1 



	    	//frequency process end 
	    	gainNode.connect(analyser);
	    	//this.audioSrc.connect(analyser);
	    	analyser.connect(ctx.destination);
		    
	        /*let cwidth = canvas.width,
	        cheight = canvas.height - 2,
	        meterWidth = 10,
	        gap = 2,
	        capHeight = 2,
	        capStyle = '#fff',
	        meterNum = 800 / (10 + 2),
	        capYPositionArray = [],
		    ctx = canvas.getContext('2d'),
		    gradient = ctx.createLinearGradient(0, 0, 0, 300);
		    gradient.addColorStop(1, '#0f0');
		    gradient.addColorStop(0.5, '#ff0');
		    gradient.addColorStop(0, '#f00');
		    function renderFrame() {
		        var array = new Uint8Array(analyser.frequencyBinCount);
		        analyser.getByteFrequencyData(array);
		        var step = Math.round(array.length / meterNum); //sample limited data from the total array
		        ctx.clearRect(0, 0, cwidth, cheight);
		        for (var i = 0; i < meterNum; i++) {
		            var value = array[i * step];
		            if (capYPositionArray.length < Math.round(meterNum)) {
		                capYPositionArray.push(value);
		            };
		            ctx.fillStyle = capStyle;
		            if (value < capYPositionArray[i]) {
		                ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
		            } else {
		                ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
		                capYPositionArray[i] = value;
		            };
		            ctx.fillStyle = gradient; 
		            ctx.fillRect(i * 12 , cheight - value + capHeight, meterWidth, cheight);
		        }
		        requestAnimationFrame(renderFrame);
		    }
		    renderFrame();*/

		    analyser.fftSize = 2048;

		    const bufferLength = analyser.fftSize;
		    const dataArray = new Uint8Array(bufferLength);

		    let canvasCtx = canvas.getContext('2d'),
		    width = canvas.width,
		    height = canvas.height,
		    backgroundColor = '#fff',
		    strokeColor = '#1890ff';

		    canvasCtx.clearRect(0, 0, width, height);

		    function draw() {

		      let drawVisual = requestAnimationFrame(draw);

		      analyser.getByteTimeDomainData(dataArray);

		      canvasCtx.fillStyle = backgroundColor;
		      canvasCtx.fillRect(0, 0, width, height);

		      canvasCtx.lineWidth = 3;
		      canvasCtx.strokeStyle = strokeColor;

		      canvasCtx.beginPath();

		      const sliceWidth = width * 1.0 / bufferLength;
		      let x = 0;

		      for(let i = 0; i < bufferLength; i++) {
		        const v = dataArray[i] / 128.0;
		        const y = v * height/2;

		        if(i === 0) {
		          canvasCtx.moveTo(x, y);
		        } else {
		          canvasCtx.lineTo(x, y);
		        }

		        x += sliceWidth;
		      }

		      canvasCtx.lineTo(canvas.width, canvas.height/2);
		      canvasCtx.stroke();
		    }

		    draw();
		}	    
	}

	closeRecordDisplayModal() {
		this.setState({
			showRecordDisplayModal: false
		});
	}


	render() {
		let {records} = this.state;

		let data = records && records.map((item) => {
			item.key = item.id;
			item.recordingTime = dateFormat(new Date(item.startTime), "dddd, mmmm dS, yyyy, h:MM:ss TT");
			item.duration = (item.stopTime - item.startTime) / 1000 + 's';
			item.size = item.blob.size/1000 + 'kb'
			return item;
		}) || [];

		return (<div id='container'>
			<canvas id='canvas' width="800" height="50" style={{ 'margin': '10px'}}></canvas>
			<Table
				style={{'marginBottom': '10px'}}
				dataSource={data}
				columns={this.state.columns} />
			
		</div>);
	}
}

export default connect()(LocalRecords);