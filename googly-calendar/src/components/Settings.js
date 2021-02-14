import React from 'react';
import ApiCalendar from 'react-google-calendar-api';
import { AsyncStorage } from 'AsyncStorage';
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import settingsIcon from "../assets/cog-solid.svg"
import Button from 'react-bootstrap/Button'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import ButtonStyle from "./ButtonStyle"
import {getStorage,syncData} from "../functions/DataFunctions"
import { HexColorPicker } from "react-colorful";
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Switch from "react-switch";
import '../App.css';

export default class Settings extends React.Component{
  constructor(props) {
    super(props);
    this.state ={
      settingsOpen: false, 
      signStatus: this.props.signStatus,
      currentFontAccent: "",
      currentFontParagraph: "",
    };
    this.loadSavedFonts = this.loadSavedFonts.bind(this);
    this.importedData = "";
  }

  componentDidMount(){
    this.loadSavedFonts();
  }

  async loadSavedFonts(){
    var currentFontAccent = await getStorage("currentFontAccent","Pier Sans");
    this.changeFont(currentFontAccent, "accent");
    var currentFontParagraph = await getStorage("currentFontParagraph","Calibri");
    this.changeFont(currentFontParagraph, "paragraph");

    this.setState({
      currentFontAccent:currentFontAccent,
      currentFontParagraph:currentFontParagraph,
    })
  }

  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name === 'openSettings') {
      this.setState({
        settingsOpen: true,
      })
    } else if (name==='closeSettings') {
      //Reload events on exit of settings
      this.props.resetCalendarObjects();
      this.setState({
        settingsOpen: false,
      })
    } else if (name === 'signInOut') {
      if(this.props.signStatus){
        this.props.googleLogin(false);
      } else {
        this.props.googleLogin(true);
      }
    }
  }

  handleChange(event,props) {
    if(event.target.name==="resetPomoStats"){
      AsyncStorage.setItem('pomoTotalSec', 0);
      this.setState({
        settingsOpen: false,
      })
    }
  }

  changeFont(value, type){
    if(type==="accent"){
      AsyncStorage.setItem('currentFontAccent', value);
      if(value==="Pier Sans"){
        document.documentElement.style.setProperty('--font-normal', "PierSans");
        document.documentElement.style.setProperty('--font-bold', "PierSansBold");
      } else if (value==="Open Sans"){
        document.documentElement.style.setProperty('--font-normal', "OpenSans");
        document.documentElement.style.setProperty('--font-bold', "OpenSansBold");
      } else if (value==="Roboto"){
        document.documentElement.style.setProperty('--font-normal', "Roboto");
        document.documentElement.style.setProperty('--font-bold', "RobotoBold");
      } else if (value==="Nunito"){
        document.documentElement.style.setProperty('--font-normal', "NunitoSans");
        document.documentElement.style.setProperty('--font-bold', "NunitoSansBold");
      } else if (value==="Fredoka One"){
        document.documentElement.style.setProperty('--font-normal', "FredokaOne");
        document.documentElement.style.setProperty('--font-bold', "FredokaOne");
      } else if (value==="Carter One"){
        document.documentElement.style.setProperty('--font-normal', "CarterOne");
        document.documentElement.style.setProperty('--font-bold', "CarterOne");
      } else if (value==="Calibri"){
        document.documentElement.style.setProperty('--font-normal', "Calibri");
        document.documentElement.style.setProperty('--font-bold', "CalibriBold");
      }
    } else {
      AsyncStorage.setItem('currentFontParagraph', value);
      if(value==="Pier Sans"){
        document.documentElement.style.setProperty('--font-paragraph', "PierSans");
      } else if (value==="Open Sans"){
        document.documentElement.style.setProperty('--font-paragraph', "OpenSans");
      } else if (value==="Roboto"){
        document.documentElement.style.setProperty('--font-paragraph', "Roboto");
      } else if (value==="Nunito"){
        document.documentElement.style.setProperty('--font-paragraph', "NunitoSans");
      } else if (value==="Fredoka One"){
        document.documentElement.style.setProperty('--font-paragraph', "FredokaOne");
      } else if (value==="Carter One"){
        document.documentElement.style.setProperty('--font-paragraph', "CarterOne");
      } else if (value==="Calibri"){
        document.documentElement.style.setProperty('--font-paragraph', "Calibri");
      }
    }
  }

  render(){
    var signInOutLabel;
    if(this.props.signStatus){
      signInOutLabel = "Logout"
    } else {
      signInOutLabel = "Login"
    }

    if(global.settings===undefined){
      global.settings=settingsOptions;
    }
    if(global.settingsColour===undefined){
      global.settingsColour=settingsOptionsColour();
    }
    var allData = JSON.stringify(Object.entries(localStorage));
    return(
      <div>
        <img alt="open settings" onClick={(e) => this.handleItemClick(e, "openSettings")} src={settingsIcon} className="settingsIcon"/>
        <Modal show={this.state.settingsOpen} onHide={(e) => this.handleItemClick(e, "closeSettings")} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {global.settings.map( (setting, index)=>
                {return <SettingsContainer key={index} setting={setting}/>}
              )}
              <Form.Group>
                <Button name="resetPomoStats" variant="outline-secondary" onClick={(e) => {this.handleChange(e, this.props); this.props.showToast("Reset pomodoro stats")}}>
                  Reset Pomodoro Stats
                </Button>
              </Form.Group>

              <Form.Group>
                <Form.Label>Custom accent font</Form.Label>
                <Form.Control as="select" onChange={(event)=>{this.changeFont(event.target.value, "accent")}}>
                  <option>Select font...</option>
                  <option className="pierSans">Pier Sans</option>
                  <option className="openSans">Open Sans</option>
                  <option className="roboto">Roboto</option>
                  <option className="nunito">Nunito</option>
                  <option className="fredokaOne">Fredoka One</option>
                  <option className="carterOne">Carter One</option>
                  <option className="calibri">Calibri</option>
                </Form.Control>
              </Form.Group>

              <Form.Group>
                <Form.Label>Custom paragraph font</Form.Label>
                <Form.Control as="select" onChange={(event)=>{this.changeFont(event.target.value, "paragraph")}}>
                  <option>Select font...</option>
                  <option className="pierSans">Pier Sans</option>
                  <option className="openSans">Open Sans</option>
                  <option className="roboto">Roboto</option>
                  <option className="nunito">Nunito</option>
                  <option className="fredokaOne">Fredoka One</option>
                  <option className="carterOne">Carter One</option>
                  <option className="calibri">Calibri</option>
                </Form.Control>
              </Form.Group>

              <Form.Group>
                <Accordion defaultActiveKey="10">
                  <Card>
                    <Card.Header style={{"padding":"4px"}}>
                      <Accordion.Toggle as={Button} variant="outline-primary" eventKey="0">
                        ▼ Set custom course colours... 
                      </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                      <div style={{width:"100%",justifyContent:"space-evenly",display:"flex",flexDirection:"row",flexWrap:"wrap"}}>
                        {global.settingsColour.length===0 ? <div style={{margin:10}}>There are no courses found. Please follow the course formatting below.</div> : global.settingsColour.map( (settingColour, index)=>
                          {return <SettingsContainerColor key={settingColour.keyName+index.toString()} settingColour={settingColour}/>}
                        )}
                      </div>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              </Form.Group>

              <Form.Group>
                <Form.Label>Saved data and settings</Form.Label>
                <Form.Control value={allData} onFocus={(event) => event.target.select()}/>
                <Form.Text className="text-muted">
                  Above is all the saved data and settings
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Import saved data and settings</Form.Label>
                <div style={{display:"flex",flexDirection: "row"}}>
                  <Form.Control onChange={(form)=>{this.importedData = form.target.value}} placeholder={"[[\"@AsyncStorage:lastSignIn\",\"3.9.0\"],[\"@AsyncStorage:workMinutes\",..."}/>
                  <Button onClick={async ()=>{var success = await syncData(this.importedData); this.handleItemClick("e", "closeSettings"); success===0 ? this.props.showToast("Failed to sync settings and data") : this.props.showToast("Synced " + success + " settings/data entries")}}>Sync</Button>
                </div>
                <Form.Text className="text-muted">
                  Paste settings here and hit the 'Sync' button
                </Form.Text>
              </Form.Group>
            </Form>
            <p><b>Course codes</b> have the following format; at the beginning of an event name: "XXX999" or "XXXY999". <br/>3 letters or 4 letters followed by 3 numbers.</p>
            <p>You can <b>sort</b> each category by clicking each category header.</p>
            <p>Closing settings will reload the calendar.</p>
            <p>
              This project is open source, feel free to check out the code here: <a href="https://github.com/jameskokoska/GooglyCalendar">https://github.com/jameskokoska/GooglyCalendar</a> 
              <Form.Text style={{"float":"right"}} className="text-muted">
                {"v"+global.version}
              </Form.Text>
            </p>
           
          </Modal.Body>
          <Modal.Footer>
            <div onClick={(e) => this.handleItemClick(e, "signInOut")} style={{"left":"5px","position":"absolute"}}>
              <ButtonStyle label={signInOutLabel}/>
            </div>
            <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "closeSettings")}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

class SettingsContainerColor extends React.Component{
  setColor(color){
    AsyncStorage.setItem(this.props.settingColour.keyName, color);
  }
  render(){
    return(
      <Form.Group style={{"paddingTop":"5px","paddingBottom":"3px", "paddingLeft":"10px","paddingRight":"10px"}}>
        <Form.Label>{this.props.settingColour.course.toUpperCase() + " course color:"}</Form.Label>
        <HexColorPicker color={this.props.settingColour.currentValue} onChange={(color)=>{this.setColor(color)}}/>
      </Form.Group>
    )
  }
}

class SettingsContainer extends React.Component{
  handleChange(form, key, checked) {
    if(checked===true)
      AsyncStorage.setItem(key, form.target.checked);
    else 
      AsyncStorage.setItem(key, form.target.value);
  }
  render(){
    if(this.props.setting.type==="text"){
      return(
        <Form.Group>
          <Form.Label>{this.props.setting.title}</Form.Label>
          <Form.Control onChange={(form) => {this.handleChange(form,this.props.setting.keyName)}} placeholder={this.props.setting.placeHolder} defaultValue={this.props.setting.currentValue}/>
          <Form.Text className="text-muted">
            {this.props.setting.description}
          </Form.Text>
        </Form.Group>
      )
    } else if(this.props.setting.type==="textDouble"){
      return(
        <Form.Group>
          <Form.Label>{this.props.setting.title}</Form.Label>
          <div>
            <Form.Control onChange={(form) => {this.handleChange(form,this.props.setting.keyName1)}} placeholder={this.props.setting.placeHolder1} defaultValue={this.props.setting.currentValue1} style={{width:"70px", display:"inline-block", marginLeft:"0px", marginRight:"5px"}}/>
            {this.props.setting.subtitle1}
            <Form.Control onChange={(form) => {this.handleChange(form,this.props.setting.keyName2)}} placeholder={this.props.setting.placeHolder2} defaultValue={this.props.setting.currentValue2} style={{width:"70px", display:"inline-block", marginLeft:"20px", marginRight:"5px"}}/>
            {this.props.setting.subtitle2}
          </div>
          <Form.Text className="text-muted">
            {this.props.setting.description}
          </Form.Text>
        </Form.Group>
      )
    } else if(this.props.setting.type==="check"){
      return(
        <Form.Group>
          <Form.Check onChange={(form) => {this.handleChange(form,this.props.setting.keyName,true)}} type="checkbox" label={this.props.setting.title} defaultChecked={this.props.setting.currentValue==="true"}/>
          <Form.Text className="text-muted">
            {this.props.setting.description}
          </Form.Text>
        </Form.Group>
      )
    } else if(this.props.setting.type==="textColour"){
      return(
        <Form.Group>
          <Form.Label>{this.props.setting.title}</Form.Label>
          <div style={{display:"flex",flexDirection: "row"}}>
          <Form.Control onChange={(form) => {this.handleChange(form,this.props.setting.keyName1)}} placeholder={this.props.setting.placeHolder1} defaultValue={this.props.setting.currentValue1}/>
          <OverlayTrigger rootClose trigger="click" placement="bottom" overlay={colourPopover(this.props.setting.currentValue2,this.props.setting.keyName2)}>
            <Button variant="outline-primary">Colour</Button>
          </OverlayTrigger>
          </div>
          <Form.Text className="text-muted">
            {this.props.setting.description}
          </Form.Text>
        </Form.Group>
      )
    } else {
      return <div/>
    }
  }
}

export function getSettingsValue(keyName){
  var settingsList = global.settings;
  if(settingsList===undefined)
    return 0;
  for(var x = 0; x<settingsList.length;x++){
    if(settingsList[x].keyName===keyName){
      if(settingsList[x].currentValue==="true"||settingsList[x].currentValue==="false"){
        return settingsList[x].currentValue==="true"
      }
      return settingsList[x].currentValue;
    } else if (settingsList[x].keyName1 !== undefined && settingsList[x].keyName1===keyName) {
      if(settingsList[x].currentValue1==="true"||settingsList[x].currentValue1==="false"){
        return settingsList[x].currentValue1==="true"
      }
      return settingsList[x].currentValue1;
    } else if (settingsList[x].keyName2 !== undefined && settingsList[x].keyName2===keyName) {
      if(settingsList[x].currentValue2==="true"||settingsList[x].currentValue2==="false"){
        return settingsList[x].currentValue2==="true"
      }
      return settingsList[x].currentValue2;
    }
  }

  settingsList = global.settingsColour;
  if(settingsList===undefined)
    return 0;
  for(x = 0; x<settingsList.length;x++){
    if(settingsList[x].keyName===keyName){
      return settingsList[x].currentValue;
    }
  }
  return 0;
}


export const settingsOptionsColour = () => {
  if(global.courses===undefined||global.courses===[]){
    return [];
  }
  var courses = global.courses;
  var settingsOptionColour = [];
  
  for(var x = 0; x<courses.length;x++){
    var currentColour = {};
    currentColour.keyName = "courseColor"+courses[x];
    currentColour.currentValue = "";
    currentColour.course = courses[x]
    settingsOptionColour.push(currentColour)
  }
  return settingsOptionColour
}

function colourPopover(currentValue,keyName) {
  return(
    <Popover>
      <Popover.Content>
        <HexColorPicker color={currentValue} onChange={(color)=>{AsyncStorage.setItem(keyName, color);}}/>
      </Popover.Content>
    </Popover>
  )
}

//getSettingsValue("keyName")
export const settingsOptions = [
  {
    "keyName1" : "calendarID",
    "keyName2" : "calendarIDColor1",
    "defaultValue1" : "primary",
    "defaultValue2" : "#64b5f6",
    "placeHolder1" : "example@group.calendar.google.com",
    "currentValue1" : "",
    "currentValue2" : "",
    "title" : "Calendar ID 1",
    "description" : "By keeping this blank, it will be the default calendar.",
    "type" : "textColour"
  },
  {
    "keyName1" : "calendarID2",
    "keyName2" : "calendarIDColor2",
    "defaultValue1" : "",
    "defaultValue2" : "#64b5f6",
    "placeHolder1" : "example@group.calendar.google.com",
    "currentValue1" : "",
    "currentValue2" : "",
    "title" : "Calendar ID 2",
    "description" : "By keeping this blank, it will not attempt to load a second calendar.",
    "type" : "textColour"
  },
  {
    "keyName1" : "calendarID3",
    "keyName2" : "calendarIDColor3",
    "defaultValue1" : "",
    "defaultValue2" : "#64b5f6",
    "placeHolder1" : "example@group.calendar.google.com",
    "currentValue1" : "",
    "currentValue2" : "",
    "title" : "Calendar ID 3",
    "description" : "By keeping this blank, it will not attempt to load a third calendar.",
    "type" : "textColour"
  },
  {
    "keyName" : "numEvents",
    "defaultValue" : "500",
    "currentValue" : "",
    "title" : "Number of events to load",
    "placeHolder" : "",
    "description" : "The number of events to load from your calendar.",
    "type" : "text" 
  },
  {
    "keyName" : "hoursBefore",
    "defaultValue" : "24",
    "currentValue" : "",
    "title" : "Number of hours before to load",
    "placeHolder" : "24",
    "description" : "The number of hours before the current time to load events from.",
    "type" : "text" 
  },
  {
    "keyName" : "nextWeekShow",
    "defaultValue" : "7",
    "currentValue" : "",
    "title" : "Number of days to view",
    "placeHolder" : "7",
    "description" : "The number of days of events to display in the Task List.",
    "type" : "text" 
  },
  {
    "keyName" : "skipWeeks",
    "defaultValue" : "true",
    "currentValue" : "",
    "title" : "Day View: scroll through weeks",
    "description" : "Day View arrows skip through weeks instead of single days",
    "type" : "check"
  },
  {
    "keyName" : "useEventColours",
    "defaultValue" : "true",
    "currentValue" : "",
    "title" : "Use event colours",
    "description" : "Use the colours set for the event. If no colour is set it will default to blue. This overwrites course colours.",
    "type" : "check" 
  },
  {
    "keyName" : "autoDark",
    "defaultValue" : "true",
    "currentValue" : "",
    "title" : "Auto dark mode",
    "description" : "Changes the colour theme automatically based on the time of day.",
    "type" : "check" 
  },
  {
    "keyName" : "darkMode",
    "defaultValue" : "false",
    "currentValue" : "",
    "title" : "Dark mode",
    "description" : "Toggles between light and dark modes. Ensure 'auto Dark Mode' is off.",
    "type" : "check" 
  },
  {
    "keyName" : "enableAnimations",
    "defaultValue" : "true",
    "currentValue" : "",
    "title" : "Enable animations",
    "description" : "Enables animations of the lists when they are loaded",
    "type" : "check" 
  },
  {
    "keyName" : "importantEvents",
    "defaultValue" : "",
    "currentValue" : "",
    "title" : "Important events",
    "placeHolder" : "Test,Exam,Quiz",
    "description" : "Events to highlight in the list, separate with comma.",
    "type" : "text" 
  },
  {
    "keyName" : "hideEvents",
    "defaultValue" : "",
    "currentValue" : "",
    "title" : "Hide events",
    "placeHolder" : "LEC,boring,not important,noshow",
    "description" : "Events to hide from the task list, separate with comma (CaSe sEnSiTIvE). If the event name contains any part of this, it will be hidden.",
    "type" : "text" 
  },
  {
    "keyName1" : "workMinutes",
    "keyName2" : "workSeconds",
    "defaultValue1" : "25",
    "defaultValue2" : "0",
    "currentValue1" : "",
    "currentValue2" : "",
    "title" : "Pomodoro timer work session",
    "subtitle1" : "minutes",
    "subtitle2" : "seconds",
    "placeHolder1" : "5",
    "placeHolder2" : "0",
    "description" : "Set the time for work sessions for the pomodoro timer.",
    "type" : "textDouble" 
  },
  {
    "keyName1" : "breakMinutes",
    "keyName2" : "breakSeconds",
    "defaultValue1" : "5",
    "defaultValue2" : "0",
    "currentValue1" : "",
    "currentValue2" : "",
    "title" : "Pomodoro timer break session",
    "subtitle1" : "minutes",
    "subtitle2" : "seconds",
    "placeHolder1" : "5",
    "placeHolder2" : "0",
    "description" : "Set the time for break sessions for the pomodoro timer.",
    "type" : "textDouble" 
  },
  {
    "keyName" : "pomoSound",
    "defaultValue" : "true",
    "currentValue" : "",
    "title" : "Pomodoro sound",
    "description" : "Play a sound when a break or work session ends.",
    "type" : "check" 
  },
]
