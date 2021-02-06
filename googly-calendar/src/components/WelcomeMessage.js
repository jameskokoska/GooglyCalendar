import React from 'react';
import { AsyncStorage } from 'AsyncStorage';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ApiCalendar from 'react-google-calendar-api';
import '../App.css';

export default class WelcomeMessage extends React.Component{
  constructor(props){
    super(props);
    this.state={welcomeOpenState: true}

  }
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name==='closeWelcome') {
      AsyncStorage.setItem('lastSignIn', global.version);
      this.setState({welcomeOpenState: false})
    }
  }
  determineButton(){
    if(this.props.signStatus){
      return (
        <Button variant="primary" onClick={(e) => this.handleItemClick(e, "closeWelcome")}>
          Continue
        </Button>
    )
    } else {
      return (
        <div>
          <Button variant="outline-secondary" onClick={(e) => this.handleItemClick(e, "closeWelcome")} style={{'marginRight':"15px"}}>
            Continue without login
          </Button>
          <Button variant="primary" onClick={() => this.props.googleLogin(true)}>
            Login
          </Button>
        </div>
      )
    }
  }
  render(){
    var welcomeOpenTogether=false;
    if(this.props.welcomeOpen===true&&this.state.welcomeOpenState===true){
      welcomeOpenTogether=true;
    }
    var welcomeMessage="Hello! Please login by clicking the button below."
    var welcomeMessage2='The aim of this application is to turn your Google Calendar into a task list. It was written in React and the source code can be found here: <a href="https://github.com/jameskokoska/GooglyCalendar">https://github.com/jameskokoska/GooglyCalendar</a>'
    if(this.props.signStatus===true){
      welcomeMessage="A new update was released: version "+global.version;
      welcomeMessage2="";
    }
    return(
      <Modal className="settingsModal" backdrop="static" show={welcomeOpenTogether} onHide={(e) => this.handleItemClick(e, "closeWelcome")} size="lg">
        <Modal.Header>
          <div className="header1" style={{"marginBottom":"0px"}}>Welcome!</div>
        </Modal.Header>
        <Modal.Body>
          <p style={{marginTop:"10px"}}>{welcomeMessage}</p>
          <p dangerouslySetInnerHTML={{ __html: welcomeMessage2 }}></p>
          <div className="header3">{"What's New? v"+ global.version}</div>
          {global.changeLog.map(function(changeLogElement){
            if(changeLogElement.includes(global.version)){
              return <b key={changeLogElement}><li>{changeLogElement}</li></b>
            } else {
              return <li key={changeLogElement}>{changeLogElement}</li>
            }
          })}
        </Modal.Body>
        <Modal.Footer>
          {this.determineButton()}
        </Modal.Footer>
      </Modal>
    )
  }
}