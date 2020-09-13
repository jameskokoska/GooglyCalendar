import React, {ReactNode, SyntheticEvent} from 'react';
import { AsyncStorage } from 'AsyncStorage';
import ApiCalendar from 'react-google-calendar-api';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Toast from 'react-bootstrap/Toast'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import settingsIcon from "./assets/cog-solid.svg"
import refreshIcon from "./assets/sync-alt-solid.svg"
import "animate.css/animate.min.css";


//TODO:
//Add sorting by category
//Add events 
//next 7 day calendar view

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.refreshWholeList = this.refreshWholeList.bind(this);
    this.signUpdate = this.signUpdate.bind(this);
    this.state ={calendarObjects: "", signStatus:"",};
    ApiCalendar.onLoad(() => {
        this.refreshWholeList();
        ApiCalendar.listenSign(this.signUpdate);
        this.setState({ signStatus: ApiCalendar.sign})
    });
    this.courseColorsLight = ["#ffcdd2","#e1bee7","#c5cae9","#b3e5fc","#b2dfdb","#dcedc8","#fff9c4","#ffe0b2","#d7ccc8","#cfd8dc"];
    this.courseColorsDark = ["#cb9ca1","#af8eb5","#9499b7","#82b3c9","#82ada9","#aabb97","#cbc693","#cbae82","#a69b97","#9ea7aa"];
    this.courseColors = this.courseColorsLight;
    var currentHours = new Date().getHours();
    //Dark mode colors
    if(currentHours > 19 || currentHours < 7){
      document.documentElement.style.setProperty('--background', "#121212");
      document.documentElement.style.setProperty('--font-color', "#fafafa");
      document.documentElement.style.setProperty('--highlight', "#9e9e9e25");
      document.documentElement.style.setProperty('--accent', "#1565c0c9");
      document.documentElement.style.setProperty('--brightnessIcon', "1");
      this.courseColors = this.courseColorsDark;
    }
  }

  signUpdate() {
    this.setState({ signStatus: ApiCalendar.sign})
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
    } else if (name==='addEvent'){
      const event = {
        summary: "addTest",
        start:{dateTime: "2020-09-13T08:00:00-02:00"},
        end:{dateTime: "2020-09-13T08:00:00-04:00"},
        status: "confirmed"
      }
      if (ApiCalendar.sign){
        if(this.state.calendarID!=null){
          ApiCalendar.createEvent(event,this.state.calendarID)
        } else {
          ApiCalendar.createEvent(event).then((result: object) => {
            console.log(result);
              })
          .catch((error: any) => {
            console.log(error);
              });
        }
      }
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
    var signStatusDisplay="none"
    var calendarObjectsLengthDisplay="none"
    if(this.state.signStatus){
      signStatusDisplay="none"
    } else {
      signStatusDisplay=""
    }
    if(this.state.calendarObjects.length<=0 && this.state.signStatus){
      calendarObjectsLengthDisplay=""
    } else {
      calendarObjectsLengthDisplay="none"
    }
    return (
      <div className="screen">
        <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "addEvent")}>
          Add
        </Button>
        <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "log")}>
          Log
        </Button>
        <Header1 content="Tasks"/>
        <TaskList calendarObjects={this.state.calendarObjects} courseColors={this.courseColors}/>
        <Settings refreshWholeList={this.refreshWholeList} signStatus={this.state.signStatus}/>
        <Refresh refreshWholeList={this.refreshWholeList}/>
        <div className="alert alert-danger fadeIn" role="alert" style={{"display":signStatusDisplay, "animationDelay":"600ms"}}>
          You are not signed-in. Sign-in in the settings.
        </div>
        <div className="alert alert-warning fadeIn" role="alert" style={{"display":calendarObjectsLengthDisplay, "animationDelay":"600ms"}}>
          There are no events for this calendar. Add some and refresh to view.
        </div>
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

class Refresh extends React.Component{
  constructor(props) {
    super(props);
    this.state ={show: false};
  }
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name==='refresh') {
      this.props.refreshWholeList()
      this.setState({show: true})
    } 
  }
  render(){
      return(
        <div>
          <Toast onClose={() => this.setState({show: false})} show={this.state.show} delay={1500} autohide style={{"position":"absolute","bottom":"1%","right":"1%"}}>
            <Toast.Header>
              <strong className="mr-auto">Refreshed!</strong>
            </Toast.Header>
          </Toast>
          <img alt="refresh" onClick={(e) => this.handleItemClick(e, "refresh")} src={refreshIcon} className="refreshIcon"/>
        </div>
      )
  }
}

class Settings extends React.Component{
  constructor(props) {
    super(props);
    this.state ={settingsOpen: false, signStatus: this.props.signStatus};
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
    } else if (name === 'signInOut') {
      if(this.props.signStatus){
        ApiCalendar.handleSignoutClick();
      } else {
        ApiCalendar.handleAuthClick();
      }
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
                <Form.Control name="calendarID" onChange={this.handleChange} placeholder="example@group.calendar.google.com" defaultValue={this.state.calendarID}/>
                <Form.Text className="text-muted">
                  By keeping this blank it will be the default calendar. To reset this field, remove everything and refresh the webpage.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Number of events to load</Form.Label>
                <Form.Control name="numEvents" onChange={this.handleChange} placeholder="20" defaultValue={this.state.numEvents}/>
                <Form.Text className="text-muted">
                  The number of upcoming events to load from the calendar. Refresh the webpage to see changes.
                </Form.Text>
              </Form.Group>
            </Form>
            <p><b>Course codes</b> have the following format; at the beginning of an event name: "XXX999". <br/>3 letters followed by 3 numbers.</p>
            <div onClick={(e) => this.handleItemClick(e, "signInOut")} style={{"float":"left"}}>
              <ButtonStyle label={signInOutLabel}/>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div style={{"textAlign":"left","paddingRight":"10px"}}>Exiting settings will load the calendar.</div>
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
        <TaskTable calendarObjects={this.props.calendarObjects} courseColors={this.props.courseColors}/>
      </div>
    )
  }
}

function TaskTable(props){
  var tasks = [];
  var name = "";
  var course = "";
  var courseColor = "";
  for (var i = 0; i < props.calendarObjects.length; i++) {
    var done;
    if(props.calendarObjects[i].summary.substring(0,2)==="✔️"){
      done=true
      name=props.calendarObjects[i].summary.substring(2)
    } else {
      done=false;
      name=props.calendarObjects[i].summary
    }
    var date = displayDate(new Date(props.calendarObjects[i].start.dateTime))
    var time = displayTime(new Date(props.calendarObjects[i].start.dateTime))
    if(/^\d+$/.test(name.substring(3,6))&&!/\d/.test(name.substring(0,3))){
      course=name.substring(0,6);
      name=name.substring(7);
      var courseRandomCode=course.charCodeAt(0)+course.charCodeAt(1)+course.charCodeAt(2)+course.charCodeAt(3)+course.charCodeAt(4)+course.charCodeAt(5);
      courseColor=props.courseColors[courseRandomCode%props.courseColors.length];
    } else {
      course = "";
      courseRandomCode = -1;
      courseColor="";
    }
    tasks.push(
      <TaskEntry
      name={name}
      date={date}
      time={time}
      course={course}
      courseColor={courseColor}
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
            <th className="time header3">Time</th>
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
            summary: "✔️" + this.props.course + " " + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.setState({
                checked: true,
            })
          );
        });
      }
    } else if (name==="uncheckOff") {
      if (ApiCalendar.sign){
        ApiCalendar.listUpcomingEvents(1)
        .then(({result}: any) => {
          const event = {
            summary: this.props.course + " " + this.props.name //remove the check-mark, because no check-mark is ever passed in
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
    var checkMarkBG="#64b5f6";
    if(this.state.checked===true){
      textStyle = "line-through";
      checkMark="&#10004;";
      checkColor="#777777";
      clickActionCheck="uncheckOff";
    }
    if(this.props.courseColor!==""){
      checkMarkBG=this.props.courseColor;
    } else {
      checkMarkBG="#64b5f6";
    }
    return(
      <tr className="taskEntry fadeIn">
        <td style={{"backgroundColor":checkMarkBG}}className="check" onClick={(e) => this.handleItemClick(e, clickActionCheck)}><div dangerouslySetInnerHTML={{ __html: checkMark}}></div></td>
        <td className="task" style={{"textDecoration":textStyle, "color":checkColor}}>{this.props.name}</td>
        <td className="date">{this.props.date}</td>
        <td className="time">{this.props.time}</td>
        <td className="course">{this.props.course}</td>
      </tr>
    )
  }
}


function displayDate(date){
  var output="";
  var weekDay="";
  var month="";
  if(date.getDay()===0){
    weekDay="Sunday";
  } else if (date.getDay()===1){
    weekDay="Monday";
  } else if (date.getDay()===2){
    weekDay="Tuesday";
  } else if (date.getDay()===3){
    weekDay="Wednesday";
  } else if (date.getDay()===4){
    weekDay="Thursday";
  } else if (date.getDay()===5){
    weekDay="Friday";
  } else if (date.getDay()===6){
    weekDay="Saturday";
  }
  if(date.getMonth()===0){
    month="Jan."
  } else if (date.getMonth()===1){
    month="Feb."
  } else if (date.getMonth()===2){
    month="Mar."
  } else if (date.getMonth()===3){
    month="Apr."
  } else if (date.getMonth()===4){
    month="May"
  } else if (date.getMonth()===5){
    month="June"
  } else if (date.getMonth()===6){
    month="July"
  } else if (date.getMonth()===7){
    month="Aug."
  } else if (date.getMonth()===8){
    month="Sept."
  } else if (date.getMonth()===9){
    month="Oct."
  } else if (date.getMonth()===10){
    month="Nov."
  } else if (date.getMonth()===11){
    month="Dec."
  }
  output=weekDay+" "+month+" " + date.getDate()
  return output;
}

function displayTime(date){
  var output = "";
  var minutes = date.getMinutes();
  if(minutes<=9){
    minutes="0"+minutes;
  }
  var hours = date.getHours();
  output = hours+":"+minutes;
  return output;

}

// class AddTask extends React.Component {

//   render() {
//     return(
//       <div className="tasks">
//         <Header2 content="Add Task"/>
//       </div>
//     )
//   }
// }


function Header1(props){
  return(
    <div className="header1">
      {props.content}
    </div>
  )
}

// function Header2(props){
//   return(
//     <div className="header2">
//       {props.content}
//     </div>
//   )
// }