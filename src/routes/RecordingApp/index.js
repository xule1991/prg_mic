import React from 'react';
import { connect } from 'dva';
import { Layout, Tabs, Col, Row } from 'antd';

import Record from '../../views/record';
import LocalRecords from '../../views/local_records';
import libCache from '../../utils/lib-cache';
import AudioContext from '../../components/ReactMic/libs/AudioContext';
import classnames from 'classnames';

import styles from './index.css';

const { Header, Content } = Layout;
const TabPane = Tabs.TabPane;

class RecordingApp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {play: true, audio: new Audio(), record: true};
    this.handleRecordsChange = this.handleRecordsChange.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleRecordChange = this.handleRecordChange.bind(this);
  }

  componentDidMount() {
    libCache.getAllStoredRecordings().then((response=[]) => {
      this.setState({
        records: response
      })
    });

    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((str) => {
      let stream = str;
      let mediaRecorder = new MediaRecorder(str);
      mediaRecorder.ondataavailable = (event) => {
        //chunks.push(event.data);
      }

      let audioCtx = AudioContext.getAudioContext();
      let analyser = AudioContext.getAnalyser();

      audioCtx.resume();
      mediaRecorder.start(10);
      const source = audioCtx.createMediaStreamSource(stream);
      this.state.audio.src = URL.createObjectURL(stream);
    });
  }

  handleRecordsChange(records) {
    this.setState({
      records: records
    })
  }

  handleTabChange(val) {
    console.log(val)
    if (val === "1") {
      this.setState({
        play: true
      })
    } else {
      this.setState({
        play:false
      })
    }
  }

  handleRecordChange() {
    this.setState({record: !this.state.record})
  }

  render() {
    if (this.state.play && this.state.record) {
      console.log(this.state.audio)
      //newly added
      this.state.audio.play()
    } else {
      this.state.audio.pause()
    }

    return (
      <div className="page-wrapper">
        <Layout>
          <Header className={classnames(styles.header)} style={{"width": "100%", "zIndex": "1000", "position": "fixed"}}><a href="#" className="navbar-brand">Heart Sound Recording System</a></Header>
          <Layout style={{"marginTop": "64px"}}>
            <Content className={styles.content}>
              <Row>
                <Col span={1}></Col>
                <Col span={22}>
                  <h1 style={{"textAlign": "center", "textDecoration": "underline"}}>Recording App</h1>
                  <div style={{"clear":"both"}}></div>
                  <Tabs defaultActiveKey="1" onChange={this.handleTabChange}>
                      <TabPane tab="Record" key="1">
                        <Record handleRecordsChange={this.handleRecordsChange} handleRecordChange={this.handleRecordChange}></Record>
                      </TabPane>
                      <TabPane tab="Local Records" key="2">
                          <LocalRecords records={this.state.records}></LocalRecords>
                      </TabPane>
                  </Tabs>
                </Col>
                <Col span={1}></Col>
              </Row>
            </Content>     
          </Layout>
        </Layout>
      </div>
    );
  }
}

RecordingApp.propTypes = {
};

export default connect()(RecordingApp);
