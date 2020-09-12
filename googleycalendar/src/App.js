import React, {ReactNode, SyntheticEvent} from 'react';
import { AsyncStorage } from 'AsyncStorage';
import ApiCalendar from 'react-google-calendar-api';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import settingsIcon from "./assets/cog-solid.svg"

//TODO:
//Add sorting by category
//Add course type
//Format date
//Different colours based on course code?

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.refreshWholeList = this.refreshWholeList.bind(this);
    this.state ={calendarObjects: ""};
    var currentHours = new Date().getHours();
    //Dark mode colors
    if(currentHours > 19 || currentHours < 7){
      document.documentElement.style.setProperty('--background', "#121212");
      document.documentElement.style.setProperty('--font-color', "#fafafa");
      document.documentElement.style.setProperty('--highlight', "#9e9e9e25");
      document.documentElement.style.setProperty('--accent', "#1565c0c9");
    }
  }

  componentDidMount() {
    AsyncStorage.getItem('calendarIDKey').then((value) => {
      if (value !== null && value !== ""){
        //read saved text
        this.setState({ calendarID: value });
        ApiCalendar.setCalendar(value)
      }
    })
    AsyncStorage.getItem('numEventsKey').then((value) => {
      if (value !== null && value !== ""){
        this.setState({ numEvents: value });
      } else {
        this.setState({ numEvents: 20 });
      }
    })
    this.timeoutHandle = setTimeout(()=>{
        this.refreshWholeList()
    }, 500);
  }
  
      
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name === 'signIn') {
      ApiCalendar.handleAuthClick();
    } else if (name === 'signOut') {
      ApiCalendar.handleSignoutClick();
    } else if (name==='log'){
      if (ApiCalendar.sign)
      ApiCalendar.listUpcomingEvents(10)
        .then(({result}: any) => {
          console.log(result.items);
      });
    } else if (name==="changeName") {
      if (ApiCalendar.sign)
        ApiCalendar.listUpcomingEvents(1)
        .then(({result}: any) => {
          const event = {
            summary: "✔️" + result.items[0].summary
          };
          ApiCalendar.updateEvent(event, result.items[0].id)
            .then(console.log);
      });
    } else if (name==='populate'){
      if (ApiCalendar.sign)
        ApiCalendar.listUpcomingEvents(this.state.numEvents)
          .then(({result}: any) => {
            var calendarObjects= result.items
            this.setState({
              calendarObjects: calendarObjects,
          })
        });
    }
  }
  
  refreshWholeList() {
    if (ApiCalendar.sign)
      ApiCalendar.listUpcomingEvents(this.state.numEvents)
        .then(({result}: any) => {
          var calendarObjects= result.items
          this.setState({
            calendarObjects: calendarObjects,
        })
      });
  }
  
  render(): ReactNode {
    return (
      <div className="screen">
        <TaskList calendarObjects={this.state.calendarObjects}/>
        <Settings refreshWholeList={this.refreshWholeList}/>
      </div>
    );
  }
}

function ButtonStyle(props){
  return(
    <div className="button">
      {props.label}
    </div>
  )
}

class Settings extends React.Component{
  constructor(props) {
    super(props);
    this.state ={settingsOpen: false};
    this.loadInputs = this.loadInputs.bind(this);
  }
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name === 'openSettings') {
      this.loadInputs();
      this.setState({
        settingsOpen: true,
      })
    } else if (name==='closeSettings') {
      this.loadInputs();
      //Reload events on exit of settings
      this.props.refreshWholeList()
      this.setState({
        settingsOpen: false,
      })
    } else if (name === 'signIn') {
      ApiCalendar.handleAuthClick();
    } else if (name === 'signOut') {
      ApiCalendar.handleSignoutClick();
    }
  }

  loadInputs() {
    AsyncStorage.getItem('calendarIDKey').then((value) => {
      if (value !== null){
        //read saved text
        this.setState({ calendarID: value });
        if(value!== ""){
          ApiCalendar.setCalendar(value)
        }
      }
    })
    AsyncStorage.getItem('numEventsKey').then((value) => {
      if (value !== null){
        this.setState({ numEvents: value });
      } else {
        this.setState({ numEvents: 20 });
      }
    })
  }

  handleChange(event) {
    if(event.target.name==="calendarID"){
      AsyncStorage.setItem('calendarIDKey', event.target.value);
      if(event.target.value!==""){
        ApiCalendar.setCalendar(event.target.value)
      }
    } else if(event.target.name==="numEvents"){
      AsyncStorage.setItem('numEventsKey', event.target.value);
    }
  }

  render(){
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
                <Form.Control name="calendarID" onChange={this.handleChange} placeholder="example@group.calendar.google.com" defaultValue={this.state.calendarID}/>
                <Form.Text className="text-muted">
                  By keeping this blank it will be the default calendar. To reset this field, remove everything and refresh the webpage.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Number of events to load</Form.Label>
                <Form.Control name="numEvents" onChange={this.handleChange} placeholder="20" defaultValue={this.state.numEvents}/>
                <Form.Text className="text-muted">
                  The number of upcoming events to load from the calendar. Reload required.
                </Form.Text>
              </Form.Group>
            </Form>
            <div onClick={(e) => this.handleItemClick(e, "signIn")} style={{"float":"left"}}>
              <ButtonStyle label="Login"/>
            </div>
            <div onClick={(e) => this.handleItemClick(e, "signOut")} style={{"float":"right"}}>
              <ButtonStyle label="Logout"/>
            </div>
            <div style={{"textAlign":"center", "margin-top":"50px"}}>Exiting settings will load the calendar.</div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "closeSettings")}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
  
  
}

class TaskList extends React.Component {
  render() {
    return(
      <div className="tasks">
        <Header1 content="Tasks"/>
        <TaskTable calendarObjects={this.props.calendarObjects}/>
      </div>
    )
  }
}


function TaskTable(props){
  var tasks = [];
  var name = "";
  for (var i = 0; i < props.calendarObjects.length; i++) {
    var done;
    if(props.calendarObjects[i].summary.substring(0,2)==="✔️"){
      done=true
      name=props.calendarObjects[i].summary.substring(2)
    } else {
      done=false;
      name=props.calendarObjects[i].summary
    }
    tasks.push(
      <TaskEntry
      name={name}
      date={props.calendarObjects[i].start.dateTime}
      course="course1" 
      done={done}
      id={props.calendarObjects[i].id}
      />
    );
  }
  return(
    <div className="taskTable">
      <table className="taskList">
        <tbody>
          <tr>
            <th className="check"></th>
            <th className="task header3">Task</th>
            <th className="date header3">Date</th>
            <th className="course header3">Course</th>
          </tr>
          {tasks}
        </tbody>
      </table>
      
    </div>
  )
}

class TaskEntry extends React.Component{
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.state ={checked: this.props.done};
  }
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name==="checkOff") {
      if (ApiCalendar.sign){
        ApiCalendar.listUpcomingEvents(1)
        .then(({result}: any) => {
          const event = {
            summary: "✔️" + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
            .then(console.log);
          this.setState({
            checked: true,
          })
        });
      }
    } else if (name==="uncheckOff") {
      if (ApiCalendar.sign){
        ApiCalendar.listUpcomingEvents(1)
        .then(({result}: any) => {
          const event = {
            summary: this.props.name //remove the check-mark, because no check-mark is ever passed in
          };
          ApiCalendar.updateEvent(event, this.props.id)
            .then(console.log);
          this.setState({
            checked: false,
          })
        });
      }
    }
  }
  render(){
    var textStyle="none";
    var checkMark="";
    var checkColor="";
    var clickActionCheck="checkOff";
    if(this.state.checked===true){
      textStyle = "line-through";
      checkMark="&#10004;";
      checkColor="#777777";
      clickActionCheck="uncheckOff";
    }
    return(
      <tr className="taskEntry fadeIn">
        <td className="check" onClick={(e) => this.handleItemClick(e, clickActionCheck)}><div dangerouslySetInnerHTML={{ __html: checkMark}}></div></td>
        <td style={{"textDecoration":textStyle, "color":checkColor}}>{this.props.name}</td>
        <td>{this.props.date}</td>
        <td>{this.props.course}</td>
      </tr>
    )
  }
}



class AddTask extends React.Component {

  render() {
    return(
      <div className="tasks">
        <Header2 content="Add Task"/>
      </div>
    )
  }
}


function Header1(props){
  return(
    <div className="header1">
      {props.content}
    </div>
  )
}

function Header2(props){
  return(
    <div className="header2">
      {props.content}
    </div>
  )
}