import React from 'react';
import { AsyncStorage } from 'AsyncStorage';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ApiCalendar from 'react-google-calendar-api';
import '../App.css';
import step1 from '../assets/Step1.png';
import step2 from '../assets/Step2.png';
import step3 from '../assets/Step3.png';
import step4 from '../assets/Step4.png';

export default class LoginMessageGuide extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    return(
      <Modal className="settingsModal" show={this.props.show} onHide={(e) => this.props.onClose()} size="lg">
        <Modal.Header closeButton>
          <div className="header1" style={{"marginBottom":"0px"}}>Login Information</div>
        </Modal.Header>
        <Modal.Body>
          <p style={{marginTop:"10px"}}>Hello! Please follow the instructions to login. This application is not yet verified by Google and will remain this way in open testing. Note: There is a limit of 100 total users for the lifetime of this project. If you want to learn how to host a local copy/view the source code visit <a href="https://github.com/jameskokoska/GooglyCalendar">https://github.com/jameskokoska/GooglyCalendar</a>. You may continue without logging in, however you will lose the majority of functionality.</p>
          
          <div className="fadeIn" style={{justifyContent:"center",display:"flex",flexDirection:"row",flexWrap:"wrap",marginHorizontal: "10px"}}>
            <div style={{margin: "6px"}}>
              <img src={step1} style={{width:"370px", borderRadius:"10px"}}/>
              <p style={{textAlign:"center"}}>Step 1: Click <i>Advanced</i></p>
            </div>
            <div style={{margin: "6px"}}>
              <img src={step2} style={{width:"370px", borderRadius:"10px"}}/>
              <p style={{textAlign:"center"}}>Step 2: Click <i>Go to jameskokoska.github.io (unsafe)</i></p>
            </div>
            <div style={{margin: "6px"}}>
              <img src={step3} style={{width:"370px", borderRadius:"10px"}}/>
              <p style={{textAlign:"center"}}>Step 3: Click <i>Allow</i> on the popup</p>
            </div>
            <div style={{margin: "6px"}}>
              <img src={step4} style={{width:"370px", borderRadius:"10px"}}/>
              <p style={{textAlign:"center"}}>Step 4: Click <i>Allow</i></p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => this.props.onClose()} style={{'marginRight':"15px"}}>
            Continue without login
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}