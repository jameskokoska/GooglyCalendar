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
//load only week of events next 7 days
//next 7 day calendar view

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.refreshWholeList = this.refreshWholeList.bind(this);
    this.signUpdate = this.signUpdate.bind(this);
    this.loadSyncData = this.loadSyncData.bind(this);
    this.sortCalendarObjects = this.sortCalendarObjects.bind(this);
    this.updateDone = this.updateDone.bind(this);
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

  loadSyncData() {
    AsyncStorage.getItem('calendarIDKey').then((value) => {
      if (value !== undefined && value !== ""){
        //read saved text
        this.setState({ calendarID: value });
        ApiCalendar.setCalendar(value)
      } else {
        this.setState({ calendarID: "primary" });
        ApiCalendar.setCalendar("primary");
      }
    })
    AsyncStorage.getItem('numEventsKey').then((value) => {
      if (value !== null && value !== ""){
        this.setState({ numEvents: value });
      } else {
        this.setState({ numEvents: 20 });
      }
    })
    AsyncStorage.getItem('hoursBefore').then((value) => {
      if (value !== null && value !== ""){
        this.setState({ hoursBefore: value });
      } else {
        this.setState({ hoursBefore: 0 });
      }
    })
    AsyncStorage.getItem('lastSort').then((value) => {
      if (value !== null && value !== ""){
        this.setState({ lastSort: value });
      } else {
        this.setState({ lastSort: "sortDate" });
      }
    })
  }

  componentDidMount() {
    this.loadSyncData();  
  }

  sortCalendarObjects(type){
    if(this.state.signStatus){
      if(type==="sortName"){
        AsyncStorage.setItem("lastSort", "sortName");
        this.setState({
          calendarObjects: sortName(this.state.calendarObjects),
        })
      } else if(type==="sortDate") {
        AsyncStorage.setItem("lastSort", "sortDate");
        this.setState({
          calendarObjects: sortDate(this.state.calendarObjects),
        })
      } else if(type==="sortCourse") {
        AsyncStorage.setItem("lastSort", "sortCourse");
        this.setState({
          calendarObjects: sortCourse(this.state.calendarObjects),
        })
      } else if(type==="sortCheck") {
        AsyncStorage.setItem("lastSort", "sortCheck");
        this.setState({
          calendarObjects: sortCheck(this.state.calendarObjects),
        })
      }
    }
  }
      
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name === 'signIn') {
      ApiCalendar.handleAuthClick();
    } else if (name === 'signOut') {
      ApiCalendar.handleSignoutClick();
    } else if (name==='log'){
      if (ApiCalendar.sign)
      listEvents(10,this.state.hoursBefore)
        .then(({result}: any) => {
          console.log(result.items);
      });
    } else if (name==='logStored'){
      console.log(this.state.calendarObjects)
    } else if (name==="changeName") {
      if (ApiCalendar.sign) 
        listEvents(1,this.state.hoursBefore)
        .then(({result}: any) => {
          const event = {
            summary: "✔️" + result.items[0].summary
          };
          ApiCalendar.updateEvent(event, result.items[0].id)
            .then(console.log);
      });
    } else if (name==='populate'){
      if (ApiCalendar.sign)
        listEvents(this.state.numEvents,this.state.hoursBefore)
          .then(({result}: any) => {
            var calendarObjects= result.items
            this.setState({
              calendarObjects: calendarObjects,
          })
        });
    } else if (name==='sortName'){
      this.sortCalendarObjects('sortName')
    } else if (name==='sortCourse'){
      this.sortCalendarObjects('sortCourse')
    } else if (name==='sortDate'){
      this.sortCalendarObjects('sortDate')
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
  
  updateDone(id){
    for (var i = 0; i < this.state.calendarObjects.length; i++) {
      if(this.state.calendarObjects[i].id === id){
        if(this.state.calendarObjects[i].done===true){
          this.state.calendarObjects[i].done=false;
          this.setState({
            calendarObjects: this.state.calendarObjects
          })
        } else {
          this.state.calendarObjects[i].done=true;
          this.setState({
            calendarObjects: this.state.calendarObjects
          })
        }
        return;
      } else {
        continue;
      }
    }
  }

  refreshWholeList() {
    if (ApiCalendar.sign){
      this.loadSyncData();
      listEvents(this.state.numEvents,this.state.hoursBefore)
        .then(({result}: any) => {
          var calendarObjects= result.items
          for (var i = 0; i < calendarObjects.length; i++) {
            if(calendarObjects[i].summary !== undefined && calendarObjects[i].summary.length>=2 && calendarObjects[i].summary.substring(0,2)==="✔️"){
              calendarObjects[i].done=true;
            } else {
              calendarObjects[i].done=false;
            }
          }
          this.setState({
            calendarObjects: calendarObjects,
        })
        this.sortCalendarObjects(this.state.lastSort)
      });
    }
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
         <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "logStored")}>
          logStored
        </Button>
        <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "sortName")}>
          sortName
        </Button>
        <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "sortCourse")}>
          sortCourse
        </Button>
        <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "sortDate")}>
          sortDate
        </Button>
        <Header1 content="Tasks"/>
        <TaskList calendarObjects={this.state.calendarObjects} courseColors={this.courseColors} hoursBefore={this.state.hoursBefore} sortCalendarObjects={this.sortCalendarObjects} updateDone={this.updateDone}/>
        <Settings refreshWholeList={this.refreshWholeList} signStatus={this.state.signStatus}/>
        <Refresh refreshWholeList={this.refreshWholeList} signStatus={this.state.signStatus}/>
        <div className="alert alert-danger fadeIn" role="alert" style={{"display":signStatusDisplay, "animationDelay":"600ms", "position":"fixed","bottom":"1%"}}>
          You are not signed-in. Sign-in in the settings.
        </div>
        <div className="alert alert-warning fadeIn" role="alert" style={{"display":calendarObjectsLengthDisplay, "animationDelay":"600ms", "position":"fixed","bottom":"1%"}}>
          There are no events for this calendar. Add some and refresh to view. If this is the first time loading, hit refresh!
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
    var message="";
    if(!this.props.signStatus){
      message="You are not signed in!"
    } else {
      message="Refreshed!"
    }
    return(
      <div>
        <Toast onClose={() => this.setState({show: false})} show={this.state.show} delay={1500} autohide style={{"position":"fixed","bottom":"1%","right":"1%"}}>
          <Toast.Header>
            <strong className="mr-auto">{message}</strong>
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
    AsyncStorage.getItem('hoursBefore').then((value) => {
      if (value !== null){
        this.setState({ hoursBefore: value });
      } else {
        this.setState({ hoursBefore: 5 });
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
    } else if(event.target.name==="hoursBefore"){
      AsyncStorage.setItem('hoursBefore', event.target.value);
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
                  By keeping this blank it will be the default calendar. Refresh webpage to see changes. To reset this field, remove everything and refresh the webpage.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Number of events to load</Form.Label>
                <Form.Control name="numEvents" onChange={this.handleChange} placeholder="20" defaultValue={this.state.numEvents}/>
                <Form.Text className="text-muted">
                  The number of upcoming events to load from the calendar. Refresh to see changes.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Number of hours before to load</Form.Label>
                <Form.Control name="hoursBefore" onChange={this.handleChange} placeholder="0" defaultValue={this.state.hoursBefore}/>
                <Form.Text className="text-muted">
                  How many hours before the current time to list events from. Refresh to see changes.
                </Form.Text>
              </Form.Group>
            </Form>
            <p><b>Course codes</b> have the following format; at the beginning of an event name: "XXX999" or "XXX9999". <br/>3 letters followed by 3 or 4 numbers.</p>
            <p>You can sort each category by clicking each category header.</p>
            <p>Closing settings will load the calendar. A refresh is required once logged in for the first time!</p>
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

class TaskList extends React.Component {
  render() {
    return(
      <div className="tasks">
        <TaskTable calendarObjects={this.props.calendarObjects} courseColors={this.props.courseColors} hoursBefore={this.props.hoursBefore} sortCalendarObjects={this.props.sortCalendarObjects} updateDone={this.props.updateDone}/>
      </div>
    )
  }
}

function TaskTable(props){
  var tasks = [];
  var name = "";
  var course = "";
  var courseColor = "";
  var courseRandomCode;
  //yeet
  for (var i = 0; i < props.calendarObjects.length; i++) {
    if(props.calendarObjects[i].summary !== undefined && props.calendarObjects[i].summary.length>=2 && props.calendarObjects[i].summary.substring(0,2)==="✔️"){
      name=props.calendarObjects[i].summary.substring(2)
    } else {
      name=props.calendarObjects[i].summary
    }
    var date = displayDate(new Date(props.calendarObjects[i].start.dateTime))
    if (date==="All day"){
      date = displayDate(new Date(props.calendarObjects[i].start.date))
    }
    var time = displayTime(new Date(props.calendarObjects[i].start.dateTime))

    //if the task name is the same, there is no course
    if(determineTaskName(props.calendarObjects[i].summary)!==props.calendarObjects[i].summary){
      course=determineTaskCourse(props.calendarObjects[i].summary);
      if(course.length>6){
        courseRandomCode=course.charCodeAt(0)+course.charCodeAt(1)+course.charCodeAt(2)+course.charCodeAt(3)+course.charCodeAt(4)+course.charCodeAt(5)+course.charCodeAt(6);
      } else {
        courseRandomCode=course.charCodeAt(0)+course.charCodeAt(1)+course.charCodeAt(2)+course.charCodeAt(3)+course.charCodeAt(4)+course.charCodeAt(5);
      }
      courseColor=props.courseColors[courseRandomCode%props.courseColors.length];
      name=determineTaskName(props.calendarObjects[i].summary);
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
      done={props.calendarObjects[i].done}
      id={props.calendarObjects[i].id}
      hoursBefore={props.hoursBefore}
      updateDone={props.updateDone}
      />
    );
  }
  return(
    <div className="taskTable">
      <table className="taskList">
        <tbody>
          <tr>
            <th className="check header3" onClick={function(e) {props.sortCalendarObjects("sortCheck")}}><div className="hoverSort">Check</div></th>
            <th className="task header3" onClick={function(e) {props.sortCalendarObjects("sortName")}}><div className="hoverSort">Task</div></th>
            <th className="date header3" onClick={function(e) {props.sortCalendarObjects("sortDate")}}><div className="hoverSort">Date</div></th>
            <th className="time header3" onClick={function(e) {props.sortCalendarObjects("sortDate")}}><div className="hoverSort">Time</div></th>
            <th className="course header3" onClick={function(e) {props.sortCalendarObjects("sortCourse")}}><div className="hoverSort">Course</div></th>
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
        listEvents(1,this.props.hoursBefore)
        .then(({result}: any) => {
          //navigator.vibrate([30]);
          if(this.props.course!==""){
            const event = {
              summary: "✔️" + this.props.course + " " + this.props.name
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updateDone(this.props.id),
            );
          } else {
            const event = {
              summary: "✔️" + this.props.name
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updateDone(this.props.id),
            );
          }
        });
      }
    } else if (name==="uncheckOff") {
      if (ApiCalendar.sign){
        listEvents(1,this.props.hoursBefore)
        .then(({result}: any) => {
          //navigator.vibrate([10]);
          if(this.props.course!==""){
            const event = {
              summary: this.props.course + " " + this.props.name
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updateDone(this.props.id),
            );
          } else {
            const event = {
              summary: this.props.name //remove the check-mark, because no check-mark is ever passed in
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updateDone(this.props.id),
            );
          }
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
    if(this.props.done===true){
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
  if(isNaN(date.getMonth())&&isNaN(date.getDay())&&isNaN(date.getDate())){
    return "All day"
  } else {
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
}

function displayTime(date){
  if(isNaN(date.getHours())&&isNaN(date.getMinutes())){
    return "All day"
  } else {
    var output = "";
    var minutes = date.getMinutes();
    if(minutes<=9){
      minutes="0"+minutes;
    }
    var hours = date.getHours();
    output = hours+":"+minutes;
    return output;
  } 
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

function listEvents(maxResults, hoursPast=0, calendarId=ApiCalendar.calendar) { 
  var datePast = new Date()
  datePast.setHours(datePast.getHours()-hoursPast)
  if (ApiCalendar.gapi) {
    return ApiCalendar.gapi.client.calendar.events.list({
            'calendarId': calendarId,
            'timeMin': (datePast).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': maxResults,
            'orderBy': 'startTime'
    });
  }
  else {
    console.log("Error: this.gapi not loaded");
    return false;
  }
}

function sortName(calendarObjects){
  var sortedCalendarObjects = calendarObjects;
  sortedCalendarObjects.sort(function(a, b) {
    var textA;
    var textB;
    if(determineTaskName(a.summary)===undefined){
      textA = "undefined"
    } else {
      textA = determineTaskName(a.summary).toUpperCase();
    }
    if(determineTaskName(b.summary)===undefined){
      textB = "undefined"
    } else {
      textB = determineTaskName(b.summary).toUpperCase();
    }
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });
  return sortedCalendarObjects;
}

function sortCourse(calendarObjects){
  var sortedCalendarObjects = calendarObjects;
  sortedCalendarObjects.sort(function(a, b) {
    var textA = determineTaskCourse(a.summary).toUpperCase();
    var textB = determineTaskCourse(b.summary).toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });
  return sortedCalendarObjects;
}

function sortDate(calendarObjects){
  var sortedCalendarObjects = calendarObjects;
  sortedCalendarObjects.sort(function(a, b) {
    var textA = determineRawSecondsTime(a.start);
    var textB = determineRawSecondsTime(b.start);
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });
  return sortedCalendarObjects;
}

function sortCheck(calendarObjects){
  var sortedCalendarObjects = calendarObjects;
  var nameA;
  var nameB;
  sortedCalendarObjects.sort(function(a, b) {
    if(a.done === true){
      nameA="zdone";
    } else {
      nameA="notDone";
    }
    if(b.done === true){
      nameB="zdone";
    } else {
      nameB="notDone";
    }
    return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
  });
  return sortedCalendarObjects;
}

function determineRawSecondsTime(start){
  if(start.dateTime!==undefined){
    return new Date(start.dateTime).valueOf();
  } else if(start.date!==undefined){
    return new Date(start.date).valueOf();
  } else {
    return 0;
  }
}

//this will determine the task name without the check-mark and course
function determineTaskName(summary){
  var name;
  if(summary !== undefined && summary.length>=2 && summary.substring(0,2)==="✔️"){
    name=summary.substring(2);
  } else {
    name=summary;
  }
  if(summary!==undefined&&name.length>7&&/^\d+$/.test(name.substring(3,7))&&!/\d/.test(name.substring(0,3))){
    if(name.substring(7,8)!==" "){
      name=name.substring(7);
    } else {
      name=name.substring(8);
    }
  } else if(summary!==undefined&&name.length>6&&/^\d+$/.test(name.substring(3,6))&&!/\d/.test(name.substring(0,3))){
    if(name.substring(6,7)!==" "){
      name=name.substring(6);
    } else {
      name=name.substring(7);
    }
  } 
  return name;
}

function determineTaskCourse(summary){
  var course;
  var name;
  if(summary !== undefined && summary.length>=2 && summary.substring(0,2)==="✔️"){
    name=summary.substring(2);
  } else {
    name=summary;
  }

  if(summary!==undefined&&name.length>7&&/^\d+$/.test(name.substring(3,7))&&!/\d/.test(name.substring(0,3))){
    course=name.substring(0,7);
  } else if(summary!==undefined&&name.length>6&&/^\d+$/.test(name.substring(3,6))&&!/\d/.test(name.substring(0,3))){
    course=name.substring(0,6);
  }  else {
    course="";
  }
  return course;
}