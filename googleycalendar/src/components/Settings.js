import React from 'react';
import ApiCalendar from 'react-google-calendar-api';
import { AsyncStorage } from 'AsyncStorage';
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import settingsIcon from "../assets/cog-solid.svg"
import Button from 'react-bootstrap/Button'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import ColorPicker from "./ColorPicker"
import '../App.css';
import ButtonStyle from "./ButtonStyle"

export default class Settings extends React.Component{
  constructor(props) {
    super(props);
    this.state ={settingsOpen: false, signStatus: this.props.signStatus};
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
        ApiCalendar.handleSignoutClick();
      } else {
        ApiCalendar.handleAuthClick();
      }
    }
  }

  handleChange(event,props) {
    if(event.target.name==="calendarID"){
      AsyncStorage.setItem('calendarIDKey', event.target.value);
      this.props.setCalendarID(event.target.value)
    } else if(event.target.name==="calendarID2"){
      AsyncStorage.setItem('calendarIDKey2', event.target.value);
      this.props.setCalendarID2(event.target.value)
    } else if(event.target.name==="numEvents"){
      AsyncStorage.setItem('numEventsKey', event.target.value);
    } else if(event.target.name==="hoursBefore"){
      AsyncStorage.setItem('hoursBefore', event.target.value);
    } else if(event.target.name==="nextWeekShow"){
      AsyncStorage.setItem('nextWeekShow', event.target.value);
    } else if(event.target.name==="importantEvents"){
      AsyncStorage.setItem('importantEvents', event.target.value);
    } else if(event.target.name==="hideEvents"){
      AsyncStorage.setItem('hideEvents', event.target.value);
    } else if(event.target.name==="darkMode"){
      AsyncStorage.setItem('darkMode', event.target.checked);
    } else if(event.target.name==="autoDark"){
      AsyncStorage.setItem('autoDark', event.target.checked);
    } else if(event.target.name==="course1"){
      AsyncStorage.setItem('course1', event.target.value);
    } else if(event.target.name==="course2"){
      AsyncStorage.setItem('course2', event.target.value);
    } else if(event.target.name==="course3"){
      AsyncStorage.setItem('course3', event.target.value);
    } else if(event.target.name==="course4"){
      AsyncStorage.setItem('course4', event.target.value);
    } else if(event.target.name==="course5"){
      AsyncStorage.setItem('course5', event.target.value);
    } else if(event.target.name==="course6"){
      AsyncStorage.setItem('course6', event.target.value);
    } else if(event.target.name==="course7"){
      AsyncStorage.setItem('course7', event.target.value);
    } else if(event.target.name==="workSeconds"){
      AsyncStorage.setItem('workSeconds', event.target.value);
    } else if(event.target.name==="breakSeconds"){
      AsyncStorage.setItem('breakSeconds', event.target.value);
    } else if(event.target.name==="workMinutes"){
      AsyncStorage.setItem('workMinutes', event.target.value);
    } else if(event.target.name==="breakMinutes"){
      AsyncStorage.setItem('breakMinutes', event.target.value);
    } else if(event.target.name==="pomoSound"){
      AsyncStorage.setItem('pomoSound', event.target.checked);
    } else if(event.target.name==="resetPomoStats"){
      AsyncStorage.setItem('pomoTotalSec', 0);
      this.setState({
        settingsOpen: false,
      })
    }
  }

  render(){
    var signInOutLabel;
    if(this.props.signStatus){
      signInOutLabel = "Logout"
    } else {
      signInOutLabel = "Login"
    }
    return(
      <div>
        <img alt="open settings" onClick={(e) => this.handleItemClick(e, "openSettings")} src={settingsIcon} className="settingsIcon"/>
        <Modal show={this.state.settingsOpen} onHide={(e) => this.handleItemClick(e, "closeSettings")} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Calendar ID</Form.Label>
                <Form.Control name="calendarID" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="example@group.calendar.google.com" defaultValue={this.props.calendarID}/>
                <Form.Text className="text-muted">
                  By keeping this blank it will be the default calendar. Refresh webpage to see changes. To reset this field, remove everything and refresh the webpage.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Calendar ID 2</Form.Label>
                <Form.Control name="calendarID2" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="example2@group.calendar.google.com" defaultValue={this.props.calendarID2}/>
                <Form.Text className="text-muted">
                  By keeping this blank, it will not attempt to load a second calendar. Refresh webpage to see changes.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Number of events to load</Form.Label>
                <Form.Control name="numEvents" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="20" defaultValue={this.props.numEvents}/>
                <Form.Text className="text-muted">
                  The number of upcoming events to load from the calendar. Refresh to see changes.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Number of days to view</Form.Label>
                <Form.Control name="nextWeekShow" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="7" defaultValue={this.props.nextWeekShow}/>
                <Form.Text className="text-muted">
                  Number of days to see events in the future. Set '<i>Number of events to load</i>' to a high value to ensure all events are loaded for this time range. Refresh to see changes.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Number of hours before to load</Form.Label>
                <Form.Control name="hoursBefore" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="0" defaultValue={this.props.hoursBefore}/>
                <Form.Text className="text-muted">
                  Number of hours before the current time to list events from. Refresh to see changes.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Check name="autoDark" type="checkbox" label="Auto dark mode" onChange={(e) => {this.handleChange(e, this.props)}} defaultChecked={this.props.autoDark}/>
                <Form.Text className="text-muted">
                  Changes the colour theme automatically based on the time of day
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Check name="darkMode" type="checkbox" label="Dark mode" onChange={(e) => {this.handleChange(e, this.props)}} defaultChecked={this.props.darkMode}/>
                <Form.Text className="text-muted">
                  Toggles between light and dark modes. Ensure 'Auto Dark Mode' is off.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Important Events</Form.Label>
                <Form.Control name="importantEvents" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="" defaultValue={this.props.importantEvents}/>
                <Form.Text className="text-muted">
                  Events to highlight in the list, separate list with comma. For example: Test,Exam,Quiz
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Hide Events</Form.Label>
                <Form.Control name="hideEvents" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="" defaultValue={this.props.hideEvents}/>
                <Form.Text className="text-muted">
                  Events to hide from the calendar, separate list with comma (CaSe sEnSiTIvE). For example: LEC,boring,not important,noshow
                </Form.Text>
              </Form.Group>
              <Form.Group>
              <Form.Group>
                <Form.Label>Pomodoro Timer Work Session</Form.Label>
                <div>
                  <Form.Control name="workMinutes" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="" defaultValue={this.props.workMinutes} style={{width:"70px", display:"inline-block", marginLeft:"0px", marginRight:"5px"}}/>
                  minutes
                  <Form.Control name="workSeconds" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="" defaultValue={this.props.workSeconds} style={{width:"70px", display:"inline-block", marginLeft:"20px", marginRight:"5px"}}/>
                  seconds
                </div>
                <Form.Text className="text-muted">
                  Set the time for work sessions for the pomodoro timer.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Pomodoro Timer Break Session</Form.Label>
                <div>
                  <Form.Control name="breakMinutes" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="" defaultValue={this.props.breakMinutes} style={{width:"70px", display:"inline-block", marginLeft:"0px", marginRight:"5px"}}/>
                  minutes
                  <Form.Control name="breakSeconds" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="" defaultValue={this.props.breakSeconds} style={{width:"70px", display:"inline-block", marginLeft:"20px", marginRight:"5px"}}/>
                  seconds
                </div>
                <Form.Text className="text-muted">
                  Set the time for break sessions for the pomodoro timer.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Check name="pomoSound" type="checkbox" label="Pomodoro Sound" onChange={(e) => {this.handleChange(e, this.props)}} defaultChecked={this.props.pomoSound}/>
                <Form.Text className="text-muted">
                  Play a sound when break or work time is up.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Button name="resetPomoStats" variant="outline-secondary" onClick={(e) => {this.handleChange(e, this.props)}}>
                  Reset Pomodoro Stats
                </Button>
              </Form.Group>
              <Accordion defaultActiveKey="10">
                <Card>
                  <Card.Header style={{"padding":"4px"}}>
                    <Accordion.Toggle as={Button} variant="outline-primary" eventKey="0">
                      ▼ Set custom course colours... 
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="0">
                    <div>
                      <Form.Group style={{"paddingTop":"5px","paddingBottom":"3px", "paddingLeft":"10px","paddingRight":"10px"}}>
                        <Form.Control style={{"marginBottom":"10px"}} name="course1" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="XXX(Y)999 (Course Code)" defaultValue={this.props.course1}/>
                        <ColorPicker color={this.props.courseColor1} courseStorageID="courseColor1"/>
                      </Form.Group>
                      <Form.Group style={{"paddingBottom":"3px", "paddingLeft":"10px","paddingRight":"10px"}}>
                        <Form.Control style={{"marginBottom":"10px"}} name="course2" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="XXX(Y)999 (Course Code)" defaultValue={this.props.course2}/>
                        <ColorPicker color={this.props.courseColor2} courseStorageID="courseColor2"/>
                      </Form.Group>
                      <Form.Group style={{"paddingBottom":"3px", "paddingLeft":"10px","paddingRight":"10px"}}>
                        <Form.Control style={{"marginBottom":"10px"}} name="course3" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="XXX(Y)999 (Course Code)" defaultValue={this.props.course3}/>
                        <ColorPicker color={this.props.courseColor3} courseStorageID="courseColor3"/>
                      </Form.Group>
                      <Form.Group style={{"paddingBottom":"3px", "paddingLeft":"10px","paddingRight":"10px"}}>
                        <Form.Control style={{"marginBottom":"10px"}} name="course4" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="XXX(Y)999 (Course Code)" defaultValue={this.props.course4}/>
                        <ColorPicker color={this.props.courseColor4} courseStorageID="courseColor4"/>
                      </Form.Group>
                      <Form.Group style={{"paddingBottom":"3px", "paddingLeft":"10px","paddingRight":"10px"}}>
                        <Form.Control style={{"marginBottom":"10px"}} name="course5" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="XXX(Y)999 (Course Code)" defaultValue={this.props.course5}/>
                        <ColorPicker color={this.props.courseColor5} courseStorageID="courseColor5"/>
                      </Form.Group>
                      <Form.Group style={{"paddingBottom":"3px", "paddingLeft":"10px","paddingRight":"10px"}}>
                        <Form.Control style={{"marginBottom":"10px"}} name="course6" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="XXX(Y)999 (Course Code)" defaultValue={this.props.course6}/>
                        <ColorPicker color={this.props.courseColor6} courseStorageID="courseColor6"/>
                      </Form.Group>
                      <Form.Group style={{"paddingBottom":"3px", "paddingLeft":"10px","paddingRight":"10px"}}>
                        <Form.Control style={{"marginBottom":"10px"}} name="course7" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="XXX(Y)999 (Course Code)" defaultValue={this.props.course7}/>
                        <ColorPicker color={this.props.courseColor7} courseStorageID="courseColor7"/>
                      </Form.Group>
                    </div>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
              </Form.Group>
            </Form>
            <p><b>Course codes</b> have the following format; at the beginning of an event name: "XXX999" or "XXXY999". <br/>3 letters or 4 letters followed by 3 numbers.</p>
            <p>You can <b>sort</b> each category by clicking each category header.</p>
            <p>Closing settings will reload the calendar.</p>
            <p>
              This project is open source, feel free to check out the code here: <a href="https://github.com/jameskokoska/GoogleyCalendar">https://github.com/jameskokoska/GoogleyCalendar</a> 
              <Form.Text style={{"float":"right"}}className="text-muted">
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