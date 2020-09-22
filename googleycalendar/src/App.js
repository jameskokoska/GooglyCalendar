import React, {ReactNode, SyntheticEvent} from 'react';
import { AsyncStorage } from 'AsyncStorage';
import ApiCalendar from 'react-google-calendar-api';
import 'bootstrap/dist/css/bootstrap.min.css';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tabs'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Toast from 'react-bootstrap/Toast'
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import './App.css';
import settingsIcon from "./assets/cog-solid.svg"
import refreshIcon from "./assets/sync-alt-solid.svg"
import infoIcon from "./assets/info-circle-solid.svg"
import checkIcon from "./assets/check-solid.svg"
import pinIcon from "./assets/thumbtack-solid.svg";
import "animate.css/animate.min.css";
//Eventually:
//Fix vibration feedback
//Add events


//TODO:
//instead of tasks put date name, short form on mobile (sept.)
//sort by calendar ID (coloured dot? only show up if more than one calendar loaded)
//custom course colours
//https://casesandberg.github.io/react-color/ for color picker
//add filter both ways (sort by least/most)
//remember all filter options not just one -> with this apply the filters in order after unpinning
//put current date somewhere, put day numbers on 7 day view
//clicking arrow beside 'tasks' switches to 7 day view
//important tasks names in settings (separate with comma) e.g. will highlight task in orange background? like Quiz, Assignment, Test, Midterm, Exam
//make checked off tasks grayed out background in 7 day week


//Date object documentation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay


//FIX

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.refreshWholeList = this.refreshWholeList.bind(this);
    this.signUpdate = this.signUpdate.bind(this);
    this.loadSyncData = this.loadSyncData.bind(this);
    this.sortCalendarObjects = this.sortCalendarObjects.bind(this);
    this.updateDone = this.updateDone.bind(this);
    this.updatePin = this.updatePin.bind(this);
    this.errorTimeoutOpen = this.errorTimeoutOpen.bind(this);
    this.setCalendarID = this.setCalendarID.bind(this);
    this.setCalendarID2 = this.setCalendarID2.bind(this);
    this.state ={calendarObjects: "", signStatus:"", errorTimeoutOpen: false};
    ApiCalendar.onLoad(() => {
        this.loadSyncData();
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
      document.documentElement.style.setProperty('--highlight2', "#8a8a8a46");
      document.documentElement.style.setProperty('--highlight-tabs', "#c9c9c925");
      document.documentElement.style.setProperty('--accent', "#1565c0c9");
      document.documentElement.style.setProperty('--brightnessIcon', "1");
      this.courseColors = this.courseColorsDark;
    }
  }

  

  loadSyncData() {
    AsyncStorage.getItem('calendarIDKey').then((value) => {
      if (value !== undefined && value !== "" && value !== undefined){
        //read saved text
        this.setState({ calendarID: value });
      } else {
        this.setState({ calendarID: "primary" });
      }
    })
    AsyncStorage.getItem('calendarIDKey2').then((value) => {
      if (value !== undefined && value !== "" && value !== undefined){
        this.setState({ calendarID2: value });
      } else if (value === ""){
        this.setState({ calendarID2: this.state.calendarID });
      } else {
        this.setState({ calendarID2: "primary" });
      }
    })
    AsyncStorage.getItem('numEventsKey').then((value) => {
      if (value !== null && value !== "" && value !== undefined){
        this.setState({ numEvents: value });
      } else {
        this.setState({ numEvents: 20 });
      }
    })
    AsyncStorage.getItem('hoursBefore').then((value) => {
      if (value !== null && value !== "" && value !== undefined){
        this.setState({ hoursBefore: value });
      } else {
        this.setState({ hoursBefore: 0 });
      }
    })
    AsyncStorage.getItem('lastSort').then((value) => {
      if (value !== null && value !== "" && value !== undefined){
        this.setState({ lastSort: value });
      } else {
        this.setState({ lastSort: "sortDate" });
      }
    })
    AsyncStorage.getItem('nextWeekShow').then((value) => {
      if (value !== null && value !== "" && value !== undefined){
        this.setState({ nextWeekShow: value });
      } else {
        this.setState({ nextWeekShow: 7 });
      }
    })
  }
  signUpdate() {
    this.setState({ signStatus: ApiCalendar.sign})
  }
  setCalendarID(calendarIDPassed){
    this.setState({ calendarID: calendarIDPassed});
  }
  setCalendarID2(calendarIDPassed){
    this.setState({calendarID2: calendarIDPassed});
  }

  componentDidMount() {
    this.loadSyncData();  
  }

  sortCalendarObjects(type){
    if(this.state.signStatus){
      if(type==="sortName"){
        AsyncStorage.setItem("lastSort", "sortName");
        this.setState({
          calendarObjects: sortPin(sortName(this.state.calendarObjects)),
        })
      } else if(type==="sortDate") {
        AsyncStorage.setItem("lastSort", "sortDate");
        this.setState({
          calendarObjects: sortPin(sortDate(this.state.calendarObjects)),
        })
      } else if(type==="sortCourse") {
        AsyncStorage.setItem("lastSort", "sortCourse");
        this.setState({
          calendarObjects: sortPin(sortCourse(this.state.calendarObjects)),
        })
      } else if(type==="sortCheck") {
        AsyncStorage.setItem("lastSort", "sortCheck");
        this.setState({
          calendarObjects: sortPin(sortCheck(this.state.calendarObjects)),
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
    } else if (name==='sortPin'){
      this.setState({
        calendarObjects: sortPin(this.state.calendarObjects),
      })
    } else if (name==='errorTimeoutOpen'){
      this.errorTimeoutOpen("Error Code")
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

  updatePin(id){
    for (var i = 0; i < this.state.calendarObjects.length; i++) {
      if(this.state.calendarObjects[i].id === id){
        if(this.state.calendarObjects[i].pin===true){
          this.state.calendarObjects[i].pin=false;
          this.setState({
            calendarObjects: sortPin(this.state.calendarObjects)
          })
        } else {
          this.state.calendarObjects[i].pin=true;
          this.setState({
            calendarObjects: sortPin(this.state.calendarObjects)
          })
        }
        return;
      } else {
        continue;
      }
    }
  }

  errorTimeoutOpen(error){
    this.setState({
      errorCode: error,
      errorTimeoutOpen: true,
    })
  }

  refreshWholeList() {
    this.loadSyncData();
    if(this.state.calendarID===""||this.state.calendarID===null||this.state.calendarID===undefined){
      ApiCalendar.setCalendar("primary")
    } else {
      ApiCalendar.setCalendar(this.state.calendarID)
    }
    
    if (ApiCalendar.sign){
      listEvents(this.state.numEvents,this.state.hoursBefore)
        .then(({result}: any) => {
          var calendarObjects = result.items;
          var calendarObjectsReduced = [];
          for (var i = 0; i < calendarObjects.length; i++) {
            //Determine if within the week days range specified in settings
            var dateObj;
            if (displayDate(new Date(calendarObjects[i].start.dateTime))==="All day"){
              dateObj = new Date(calendarObjects[i].start.date);
            } else {
              dateObj = new Date(calendarObjects[i].start.dateTime);
            }
            //Fix for all day and hours past
            var allDayPastTest=false;
            if(displayDate(new Date(calendarObjects[i].start.dateTime))==="All day"){
              if(new Date(calendarObjects[i].end.date)>new Date().addDays(-1*(this.state.hoursBefore+24)/24)){
                allDayPastTest=true;
              }
            } else {
              allDayPastTest=true;
            }
            if(dateObj < new Date().addDays(parseInt(this.state.nextWeekShow)) && allDayPastTest){
              //Set up attributes of each object
              if(calendarObjects[i].summary !== undefined && calendarObjects[i].summary.length>=2 && calendarObjects[i].summary.substring(0,2)==="✔️"){
                calendarObjects[i].done=true;
              } else {
                calendarObjects[i].done=false;
              }
              if(calendarObjects[i].summary !== undefined && calendarObjects[i].summary.length>=2 && calendarObjects[i].summary.substring(0,2)==="📌"){
                calendarObjects[i].pin=true;
              } else {
                calendarObjects[i].pin=false;
              }
              if(calendarObjects[i].summary !== undefined && calendarObjects[i].summary.length>=2 && (calendarObjects[i].summary.substring(0,2)==="✔️" || calendarObjects[i].summary.substring(0,2)==="📌")){
                calendarObjects[i].name=calendarObjects[i].summary.substring(2);
              } else {
                calendarObjects[i].name=calendarObjects[i].summary;
              }
              calendarObjects[i].date = displayDate(new Date(calendarObjects[i].start.dateTime));
              if (calendarObjects[i].date==="All day"){
                calendarObjects[i].date = displayDate(new Date(calendarObjects[i].end.date));
                calendarObjects[i].dateObjEnd = new Date(calendarObjects[i].end.date);
              } else {
                calendarObjects[i].dateObjEnd = new Date(calendarObjects[i].end.dateTime);
              }
              calendarObjects[i].timeStart = displayTime(new Date(calendarObjects[i].start.dateTime));
              calendarObjects[i].timeEnd = displayTime(new Date(calendarObjects[i].end.dateTime));

              var courseRandomCode;
              if(determineTaskCourse(calendarObjects[i].summary)!==""){
                calendarObjects[i].course=determineTaskCourse(calendarObjects[i].summary);
                if(calendarObjects[i].course.length>6){
                  courseRandomCode=calendarObjects[i].course.charCodeAt(0)+calendarObjects[i].course.charCodeAt(1)+calendarObjects[i].course.charCodeAt(2)+calendarObjects[i].course.charCodeAt(3)+calendarObjects[i].course.charCodeAt(4)+calendarObjects[i].course.charCodeAt(5)+calendarObjects[i].course.charCodeAt(6);
                } else {
                  courseRandomCode=calendarObjects[i].course.charCodeAt(0)+calendarObjects[i].course.charCodeAt(1)+calendarObjects[i].course.charCodeAt(2)+calendarObjects[i].course.charCodeAt(3)+calendarObjects[i].course.charCodeAt(4)+calendarObjects[i].course.charCodeAt(5);
                }
                calendarObjects[i].courseColor=this.courseColors[courseRandomCode%this.courseColors.length];
                calendarObjects[i].name=determineTaskName(calendarObjects[i].summary);
              } else {
                calendarObjects[i].course = "";
                calendarObjects[i].courseRandomCode = -1;
                calendarObjects[i].courseColor="";
              }
              // calendarObjects[i].done = "";
              // calendarObjects[i].pin = "";
              // calendarObjects[i].name = "";
              // calendarObjects[i].course = "";
              // calendarObjects[i].date = "";
              // calendarObjects[i].timeStart = "";
              // calendarObjects[i].timeEnd = "";
              // calendarObjects[i].courseColor = "";
              // calendarObjects[i].dateObjEnd = "";
              calendarObjects[i].calendarID=this.state.calendarID;
              calendarObjectsReduced.push(calendarObjects[i]);
            }
          }
          this.setState({
            calendarObjects: calendarObjectsReduced,
          })
          this.sortCalendarObjects(this.state.lastSort)
          if(this.state.calendarID2!==this.state.calendarID&&this.state.calendarID2!==""&&this.state.calendarID2!==null&&this.state.calendarID2!==undefined){
            ApiCalendar.setCalendar(this.state.calendarID2)
            if (ApiCalendar.sign){
              listEvents(this.state.numEvents,this.state.hoursBefore)
                .then(({result}: any) => {
                  var calendarObjects2= result.items
                  var calendarObjects2Reduced = [];
                  for (var i = 0; i < calendarObjects2.length; i++) {
                    //Determine if within the week days range specified in settings
                    var dateObj;
                    if (displayDate(new Date(calendarObjects2[i].start.dateTime))==="All day"){
                      dateObj = new Date(calendarObjects2[i].start.date);
                    } else {
                      dateObj = new Date(calendarObjects2[i].start.dateTime);
                    }
                    //Fix for all day and hours past
                    var allDayPastTest=false;
                    if(displayDate(new Date(calendarObjects2[i].start.dateTime))==="All day"){
                      if(new Date(calendarObjects2[i].end.date)>new Date().addDays(-1*(this.state.hoursBefore+24)/24)){
                        allDayPastTest=true;
                      }
                    } else {
                      allDayPastTest=true;
                    }
                    //----------------------------------------------------------------------------------
                    if(dateObj < new Date().addDays(parseInt(this.state.nextWeekShow)) && allDayPastTest){
                      //Set up attributes of each object
                      if(calendarObjects2[i].summary !== undefined && calendarObjects2[i].summary.length>=2 && calendarObjects2[i].summary.substring(0,2)==="✔️"){
                        calendarObjects2[i].done=true;
                      } else {
                        calendarObjects2[i].done=false;
                      }
                      if(calendarObjects2[i].summary !== undefined && calendarObjects2[i].summary.length>=2 && calendarObjects2[i].summary.substring(0,2)==="📌"){
                        calendarObjects2[i].pin=true;
                      } else {
                        calendarObjects2[i].pin=false;
                      }
                      if(calendarObjects2[i].summary !== undefined && calendarObjects2[i].summary.length>=2 && (calendarObjects2[i].summary.substring(0,2)==="✔️" || calendarObjects2[i].summary.substring(0,2)==="📌")){
                        calendarObjects2[i].name=calendarObjects2[i].summary.substring(2);
                      } else {
                        calendarObjects2[i].name=calendarObjects2[i].summary;
                      }
                      calendarObjects2[i].date = displayDate(new Date(calendarObjects2[i].start.dateTime));
                      if (calendarObjects2[i].date==="All day"){
                        calendarObjects2[i].date = displayDate(new Date(calendarObjects2[i].end.date));
                        calendarObjects2[i].dateObjEnd = new Date(calendarObjects2[i].end.date);
                      } else {
                        calendarObjects2[i].dateObjEnd = new Date(calendarObjects2[i].end.dateTime);
                      }
                      calendarObjects2[i].timeStart = displayTime(new Date(calendarObjects2[i].start.dateTime));
                      calendarObjects2[i].timeEnd = displayTime(new Date(calendarObjects2[i].end.dateTime));

                      var courseRandomCode;
                      if(determineTaskCourse(calendarObjects2[i].summary)!==""){
                        calendarObjects2[i].course=determineTaskCourse(calendarObjects2[i].summary);
                        if(calendarObjects2[i].course.length>6){
                          courseRandomCode=calendarObjects2[i].course.charCodeAt(0)+calendarObjects2[i].course.charCodeAt(1)+calendarObjects2[i].course.charCodeAt(2)+calendarObjects2[i].course.charCodeAt(3)+calendarObjects2[i].course.charCodeAt(4)+calendarObjects2[i].course.charCodeAt(5)+calendarObjects2[i].course.charCodeAt(6);
                        } else {
                          courseRandomCode=calendarObjects2[i].course.charCodeAt(0)+calendarObjects2[i].course.charCodeAt(1)+calendarObjects2[i].course.charCodeAt(2)+calendarObjects2[i].course.charCodeAt(3)+calendarObjects2[i].course.charCodeAt(4)+calendarObjects2[i].course.charCodeAt(5);
                        }
                        calendarObjects2[i].courseColor=this.courseColors[courseRandomCode%this.courseColors.length];
                        calendarObjects2[i].name=determineTaskName(calendarObjects2[i].summary);
                      } else {
                        calendarObjects2[i].course = "";
                        calendarObjects2[i].courseRandomCode = -1;
                        calendarObjects2[i].courseColor="";
                      }
                      // calendarObjects[i].done = "";
                      // calendarObjects[i].pin = "";
                      // calendarObjects[i].name = "";
                      // calendarObjects[i].course = "";
                      // calendarObjects[i].date = "";
                      // calendarObjects[i].timeStart = "";
                      // calendarObjects[i].timeEnd = "";
                      // calendarObjects[i].courseColor = "";
                      // calendarObjects[i].dateObjEnd = "";
                      calendarObjects2[i].calendarID=this.state.calendarID2;
                      calendarObjects2Reduced.push(calendarObjects2[i]);
                    }
                  }
                  //----------------------------------------------------------------------------------
                  Array.prototype.push.apply(calendarObjects2Reduced,this.state.calendarObjects); 
                  this.setState({
                    calendarObjects: calendarObjects2Reduced,
                })
                this.sortCalendarObjects(this.state.lastSort)
              });
            }
          }
      });
    }
  }
  
  render(): ReactNode {
    var signStatusDisplay="none";
    var calendarObjectsLengthDisplay="none";
    if(this.state.signStatus){
      signStatusDisplay="none";
    } else {
      signStatusDisplay="";
    }
    if(this.state.calendarObjects.length<=0 && this.state.signStatus){
      calendarObjectsLengthDisplay="";
    } else {
      calendarObjectsLengthDisplay="none";
    }
    var today=new Date();
    var currentDisplayDate;
    if(window.innerWidth>767){
      currentDisplayDate=getDisplayDayFull(today)+" "+getDisplayMonthFull(today)+" "+today.getDate()
    } else {
      currentDisplayDate=getDisplayDay(today)+" "+getDisplayMonth(today)+" "+today.getDate()
    }
    return (
      <div className="screen">
        {/* <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "addEvent")}>
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
        <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "errorTimeoutOpen")}>
          errorTimeoutOpen
        </Button>
        <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "sortPin")}>
          sortPin
        </Button> */}
        <Header1 content={currentDisplayDate}/>
        <Tabs style={{"marginTop":"1.9%","marginBottom":"3px"}} className="tabsLabel" defaultActiveKey="1">
            <Tab eventKey="1" title="Task List">
              <TaskList calendarObjects={this.state.calendarObjects} courseColors={this.courseColors} hoursBefore={this.state.hoursBefore} nextWeekShow={this.state.nextWeekShow} sortCalendarObjects={this.sortCalendarObjects} updateDone={this.updateDone} errorTimeoutOpen={this.errorTimeoutOpen} updatePin={this.updatePin}/>
            </Tab>
            <Tab eventKey="2" title="Week View">
              <WeekList calendarObjects={this.state.calendarObjects} nextWeekShow={this.state.nextWeekShow} courseColors={this.courseColors} updateDone={this.updateDone} errorTimeoutOpen={this.errorTimeoutOpen} updatePin={this.updatePin}/>
            </Tab>
        </Tabs>
        <Settings refreshWholeList={this.refreshWholeList} signStatus={this.state.signStatus} setCalendarID={this.setCalendarID} setCalendarID2={this.setCalendarID2}/>
        <Refresh refreshWholeList={this.refreshWholeList} signStatus={this.state.signStatus}/>
        {/* <AddEvent/> */}
        <div className="alert alert-danger fadeIn" role="alert" onClick={(e) => this.handleItemClick(e, 'signIn')} style={{"display":signStatusDisplay, "animationDelay":"600ms", "position":"fixed","bottom":"1%", "cursor":"pointer"}}>
          You are not signed-in. Sign-in in the settings, or click this message.
        </div>
        <div className="alert alert-warning fadeIn" role="alert" style={{"display":calendarObjectsLengthDisplay, "animationDelay":"600ms", "position":"fixed","bottom":"1%"}}>
          There are no events for this calendar. Add some and refresh to view. If this is the first time loading, hit refresh!
        </div>
        <TimeOutError errorTimeoutOpen={this.state.errorTimeoutOpen} errorCode={this.state.errorCode}/>
      </div>
    );
  }
}

function WeekListHeader(props){
  var weekHeaders = [];
  var numDays;
  if(props.days>=7){
    numDays = 7;
  } else {
    numDays=props.days;
  }
  for (var i = 0; i < numDays; i++) {
    weekHeaders.push( <th className="weekday header3 fadeIn">{getDisplayDayFull((new Date()).addDays(i))}</th> )
  }
  return weekHeaders;
}

function DayList(props){
  var dayListEntries = [];
  var numDays;
  if(props.days>=7){
    numDays = 7;
  } else {
    numDays=props.days;
  }
  for (var i = 0; i < numDays; i++) {
    dayListEntries.push( 
      <td>
        <DayListEntry calendarObjects={props.calendarObjects} dayOffset={i} courseColors={props.courseColors} errorTimeoutOpen={props.errorTimeoutOpen} updateDone={props.updateDone} updatePin={props.updatePin}/>
      </td> 
    )
  }
  return dayListEntries;
}

class DayEntry extends React.Component{
  //Note this code is from the checkoff update accordingly ---------------------------------------------------------
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.state ={checked: this.props.done};
  }
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    ApiCalendar.setCalendar(this.props.calendarIDCurrent)
    if (name==="checkOff"&&this.props.pin===false) {
      if (ApiCalendar.sign){
        //navigator.vibrate([30]);
        if(this.props.course!==""){
          const event = {
            summary: "✔️" + this.props.course + " " + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updateDone(this.props.id),
          )
          .catch((error: any) => {
            this.props.errorTimeoutOpen("Error 401/404")
          });
        } else {
          const event = {
            summary: "✔️" + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updateDone(this.props.id),
          )
          .catch((error: any) => {
             this.props.errorTimeoutOpen("Error 401/404")
          });
        }
      }
    } else if (name==="uncheckOff") {
      if (ApiCalendar.sign){
        //navigator.vibrate([10]);
        if(this.props.course!==""){
          const event = {
            summary: this.props.course + " " + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updateDone(this.props.id),
          )
          .catch((error: any) => {
            this.props.errorTimeoutOpen("Error 401/404")
          });
        } else {
          const event = {
            summary: this.props.name //remove the check-mark, because no check-mark is ever passed in
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updateDone(this.props.id),
          )
          .catch((error: any) => {
            this.props.errorTimeoutOpen("Error 401/404")
          });
        }
      }
    }    
    if ((name==="pin"||name==="checkOff")&&this.props.pin===true) {
      console.log("")
      if (ApiCalendar.sign){
        //navigator.vibrate([10]);
        if(name==="checkOff"){
          if(this.props.course!==""){
            const event = {
              summary: "✔️" + this.props.course + " " + this.props.name
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updatePin(this.props.id),
              this.props.updateDone(this.props.id),
            )
            .catch((error: any) => {
              this.props.errorTimeoutOpen("Error 401/404")
            });
          } else {
            const event = {
              summary: "✔️" + this.props.name //remove the pin, because no pin is ever passed in
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updatePin(this.props.id),
              this.props.updateDone(this.props.id),
            )
            .catch((error: any) => {
              this.props.errorTimeoutOpen("Error 401/404")
            });
          }
        } else {
          if(this.props.course!==""){
            const event = {
              summary: this.props.course + " " + this.props.name
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updatePin(this.props.id),
            )
            .catch((error: any) => {
              this.props.errorTimeoutOpen("Error 401/404")
            });
          } else {
            const event = {
              summary: this.props.name //remove the pin, because no pin is ever passed in
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updatePin(this.props.id),
            )
            .catch((error: any) => {
              this.props.errorTimeoutOpen("Error 401/404")
            });
          }
        }
        
      }
    } else if (name==="pin"&&(this.props.pin===false&&this.props.done===false)) {
      if (ApiCalendar.sign){
        //navigator.vibrate([30]);
        if(this.props.course!==""){
          const event = {
            summary: "📌" + this.props.course + " " + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updatePin(this.props.id),
          )
          .catch((error: any) => {
            this.props.errorTimeoutOpen("Error 401/404")
          });
        } else {
          const event = {
            summary: "📌" + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updatePin(this.props.id),
          )
          .catch((error: any) => {
            this.props.errorTimeoutOpen("Error 401/404")
          });
        }
      } 
    }
  }
  
  //--------------------------------------------------------------------------------------
  render(){
    return(
      <div className="weekEntry fadeIn">
        <div onClick={(e) => this.handleItemClick(e, this.props.clickActionCheck)} className="weekEventLabel" style={{"color":this.props.checkColor, "textDecoration":this.props.textStyle, "transition":"all 0.5s"}}>{this.props.name}</div>
        <div onClick={(e) => this.handleItemClick(e, this.props.clickActionCheck)} className="weekTimeLabel">{this.props.timeStart+this.props.displayTimeEnd}</div>
        <div className="courseBubble" style={{"display":this.props.courseDisplay}}><span style={{"backgroundColor":this.props.courseColor}}>{this.props.course}</span></div>
        <OverlayTrigger placement={"bottom"} overlay={<Tooltip><div dangerouslySetInnerHTML={{ __html: this.props.description }}></div></Tooltip>}>
          <img alt="descriptions" className="infoIconWeek" src={infoIcon} style={{"display":this.props.descriptionDisplay}}/>
        </OverlayTrigger>
      </div> 
    )
      
  }
}

class DayListEntry extends React.Component{
  
  render(){
    var todayListEntries = [];  
    for (var i = 0; i < this.props.calendarObjects.length; i++) {
      var displayTimeEnd;
      if(this.props.calendarObjects[i].timeEnd==="All day"){
        displayTimeEnd="";
      } else {
        displayTimeEnd=" - "+this.props.calendarObjects[i].timeEnd;
      }
      var courseDisplay="none";
      if(this.props.calendarObjects[i].course!==""){
        courseDisplay="";
      }
      
      var descriptionDisplay="none";
      if(this.props.calendarObjects[i].description!==undefined&&this.props.calendarObjects[i].description!==null){
        descriptionDisplay="";
      }
      var textStyle="none";
      var clickActionCheck="checkOff";
      var checkColor="";
      if(this.props.calendarObjects[i].done===true){
        textStyle = "line-through";
        clickActionCheck="uncheckOff";
        checkColor="#777777";
      }
      if(eventToday(new Date(this.props.calendarObjects[i].start.dateTime),(new Date()).addDays(this.props.dayOffset))||eventToday(new Date(this.props.calendarObjects[i].end.date),(new Date()).addDays(this.props.dayOffset))){
        todayListEntries.push(
          <DayEntry
            checkColor={checkColor}
            textStyle={textStyle}
            name={this.props.calendarObjects[i].name}
            timeStart={this.props.calendarObjects[i].timeStart}
            displayTimeEnd={displayTimeEnd}
            courseDisplay={courseDisplay}
            courseColor={this.props.calendarObjects[i].courseColor}
            course={this.props.calendarObjects[i].course}
            descriptionDisplay={descriptionDisplay}
            description={this.props.calendarObjects[i].description}
            id={this.props.calendarObjects[i].id}
            updateDone={this.props.updateDone}
            calendarIDCurrent={this.props.calendarObjects[i].calendarID}
            done={this.props.calendarObjects[i].done}
            clickActionCheck={clickActionCheck}
            pin={this.props.calendarObjects[i].pin}
            updatePin={this.props.updatePin}
          />
        )
      }
    }
    return todayListEntries
  }
}
class WeekList extends React.Component {
  render() {
    return(
      <div className="week">
        <div className="weekTable">
          <table className="weekList">
            <tbody>
              <tr>
                <WeekListHeader days={this.props.nextWeekShow}/>
              </tr>
              <tr>
                <DayList calendarObjects={this.props.calendarObjects} days={this.props.nextWeekShow} courseColors={this.props.courseColors} updateDone={this.props.updateDone} errorTimeoutOpen={this.props.errorTimeoutOpen} updatePin={this.props.updatePin}/>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

class WeekEntry extends React.Component {
  render() {
    return(
      <div>
      </div>
    )
  }
}

class TimeOutError extends React.Component{
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name==='refreshPage') {
      window.location.reload();
    } 
  }
  render(){
    return(
      <Modal show={this.props.errorTimeoutOpen} onHide={(e) => this.handleItemClick(e, "refreshPage")} size="lg">
        <Modal.Header>
          <Modal.Title>Connection has timed out</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.errorCode}<p>Please <b>reload the page</b>, otherwise changes will not be saved!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={(e) => this.handleItemClick(e, "refreshPage")}>
            Refresh
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

function ButtonStyle(props){
  return(
    <div className="button">
      {props.label}
    </div>
  )
}
class AddEvent extends React.Component{
  render(){
    return(
      <div>
      <form noValidate autoComplete="off">
        <div className="addButton"><div className="addButtonOffset">+</div></div>
        <TextField fullWidth size="medium" label="Event Name" inputProps={{style: {fontSize: 40}}} InputLabelProps={{style: {fontSize: 20}}} style={{width:"50%"}}/>
      </form>
      </div>
    )
  }
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
        <Toast onClose={() => this.setState({show: false})} show={this.state.show} delay={1500} autohide style={{"position":"fixed","bottom":"0%","left":"1%"}}>
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
    AsyncStorage.getItem('calendarIDKey').then((value1) => {
      AsyncStorage.getItem('calendarIDKey2').then((value2) => {
          this.setState({ calendarID: value1, calendarID2: value2 });
          this.props.setCalendarID(value1)
          this.props.setCalendarID2(value2)
      })
    })
    
    AsyncStorage.getItem('numEventsKey').then((value) => {
      if (value !== null && value !== undefined && value !== ""){
        this.setState({ numEvents: value });
      } else {
        this.setState({ numEvents: 20 });
      }
    })
    AsyncStorage.getItem('hoursBefore').then((value) => {
      if (value !== null && value !== undefined && value !== ""){
        this.setState({ hoursBefore: value });
      } else {
        this.setState({ hoursBefore: 5 });
      }
    })
    AsyncStorage.getItem('nextWeekShow').then((value) => {
      if (value !== null && value !== undefined && value !== ""){
        this.setState({ nextWeekShow: value });
      } else {
        this.setState({ nextWeekShow: 7 });
      }
    })
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
                <Form.Control name="calendarID" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="example@group.calendar.google.com" defaultValue={this.state.calendarID}/>
                <Form.Text className="text-muted">
                  By keeping this blank it will be the default calendar. Refresh webpage to see changes. To reset this field, remove everything and refresh the webpage.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Calendar ID 2</Form.Label>
                <Form.Control name="calendarID2" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="example2@group.calendar.google.com" defaultValue={this.state.calendarID2}/>
                <Form.Text className="text-muted">
                  By keeping this blank, it will not attempt to load a second calendar. Refresh webpage to see changes.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Number of events to load</Form.Label>
                <Form.Control name="numEvents" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="20" defaultValue={this.state.numEvents}/>
                <Form.Text className="text-muted">
                  The number of upcoming events to load from the calendar. Refresh to see changes.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Number of days to view</Form.Label>
                <Form.Control name="nextWeekShow" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="7" defaultValue={this.state.nextWeekShow}/>
                <Form.Text className="text-muted">
                  Number of days to see events in the future. Set '<i>Number of events to load</i>' to a high value to ensure all events are loaded for this time range. Refresh to see changes.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label>Number of hours before to load</Form.Label>
                <Form.Control name="hoursBefore" onChange={(e) => {this.handleChange(e, this.props)}} placeholder="0" defaultValue={this.state.hoursBefore}/>
                <Form.Text className="text-muted">
                  Number of hours before the current time to list events from. Refresh to see changes.
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
        <TaskTable calendarObjects={this.props.calendarObjects} courseColors={this.props.courseColors} hoursBefore={this.props.hoursBefore} nextWeekShow={this.props.nextWeekShow} sortCalendarObjects={this.props.sortCalendarObjects} updateDone={this.props.updateDone} errorTimeoutOpen={this.props.errorTimeoutOpen} updatePin={this.props.updatePin}/>
      </div>
    )
  }
}

function TaskTable(props){
  var tasks = [];
  for (var i = 0; i < props.calendarObjects.length; i++) {
    tasks.push(
      <TaskEntry
      name={props.calendarObjects[i].name}
      date={props.calendarObjects[i].date}
      timeStart={props.calendarObjects[i].timeStart}
      timeEnd={props.calendarObjects[i].timeEnd}
      course={props.calendarObjects[i].course}
      courseColor={props.calendarObjects[i].courseColor}
      done={props.calendarObjects[i].done}
      id={props.calendarObjects[i].id}
      hoursBefore={props.hoursBefore}
      nextWeekShow={props.nextWeekShow}
      updateDone={props.updateDone}
      calendarIDCurrent={props.calendarObjects[i].calendarID}
      description={props.calendarObjects[i].description}
      dateObjEnd={props.calendarObjects[i].dateObjEnd}
      errorTimeoutOpen={props.errorTimeoutOpen}
      updatePin={props.updatePin}
      pin={props.calendarObjects[i].pin}
      />
    );
  }
  return(
    <div className="taskTable">
      <table className="taskList">
        <tbody>
          <tr className="fadeIn">
            <th className="pin header3"><div className="pinHeader"><img alt="pin pinHeader" src={pinIcon}/></div></th>
            <th className="check header3" onClick={function(e) {props.sortCalendarObjects("sortCheck")}}><div className="hoverSort checkHeader"><img alt="check" src={checkIcon}/></div></th>
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
    ApiCalendar.setCalendar(this.props.calendarIDCurrent)
    if (name==="checkOff"&&this.props.pin===false) {
      if (ApiCalendar.sign){
        //navigator.vibrate([30]);
        if(this.props.course!==""){
          const event = {
            summary: "✔️" + this.props.course + " " + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updateDone(this.props.id),
          )
          .catch((error: any) => {
            this.props.errorTimeoutOpen("Error 401/404")
          });
        } else {
          const event = {
            summary: "✔️" + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updateDone(this.props.id),
          )
          .catch((error: any) => {
             this.props.errorTimeoutOpen("Error 401/404")
          });
        }
      }
    } else if (name==="uncheckOff") {
      if (ApiCalendar.sign){
        //navigator.vibrate([10]);
        if(this.props.course!==""){
          const event = {
            summary: this.props.course + " " + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updateDone(this.props.id),
          )
          .catch((error: any) => {
            this.props.errorTimeoutOpen("Error 401/404")
          });
        } else {
          const event = {
            summary: this.props.name //remove the check-mark, because no check-mark is ever passed in
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updateDone(this.props.id),
          )
          .catch((error: any) => {
            this.props.errorTimeoutOpen("Error 401/404")
          });
        }
      }
    }    
    if ((name==="pin"||name==="checkOff")&&this.props.pin===true) {
      console.log("")
      if (ApiCalendar.sign){
        //navigator.vibrate([10]);
        if(name==="checkOff"){
          if(this.props.course!==""){
            const event = {
              summary: "✔️" + this.props.course + " " + this.props.name
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updatePin(this.props.id),
              this.props.updateDone(this.props.id),
            )
            .catch((error: any) => {
              this.props.errorTimeoutOpen("Error 401/404")
            });
          } else {
            const event = {
              summary: "✔️" + this.props.name //remove the pin, because no pin is ever passed in
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updatePin(this.props.id),
              this.props.updateDone(this.props.id),
            )
            .catch((error: any) => {
              this.props.errorTimeoutOpen("Error 401/404")
            });
          }
        } else {
          if(this.props.course!==""){
            const event = {
              summary: this.props.course + " " + this.props.name
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updatePin(this.props.id),
            )
            .catch((error: any) => {
              this.props.errorTimeoutOpen("Error 401/404")
            });
          } else {
            const event = {
              summary: this.props.name //remove the pin, because no pin is ever passed in
            };
            ApiCalendar.updateEvent(event, this.props.id)
            .then(
              this.props.updatePin(this.props.id),
            )
            .catch((error: any) => {
              this.props.errorTimeoutOpen("Error 401/404")
            });
          }
        }
        
      }
    } else if (name==="pin"&&(this.props.pin===false&&this.props.done===false)) {
      if (ApiCalendar.sign){
        //navigator.vibrate([30]);
        if(this.props.course!==""){
          const event = {
            summary: "📌" + this.props.course + " " + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updatePin(this.props.id),
          )
          .catch((error: any) => {
            this.props.errorTimeoutOpen("Error 401/404")
          });
        } else {
          const event = {
            summary: "📌" + this.props.name
          };
          ApiCalendar.updateEvent(event, this.props.id)
          .then(
            this.props.updatePin(this.props.id),
          )
          .catch((error: any) => {
            this.props.errorTimeoutOpen("Error 401/404")
          });
        }
      } 
    }
  }
  
  render(){
    var textStyle="none";
    var checkClass="checkImg";
    var pinClass="pinImg";
    var checkColor="";
    var clickActionCheck="checkOff";
    var checkMarkBG="#64b5f6";
    var courseClass="course";
    var pinDisplay="pin";
    if(this.props.done===true){
      textStyle = "line-through";
      checkClass+=" checkIn";
      checkColor="#777777";
      clickActionCheck="uncheckOff";
      pinDisplay+=" pinNone";
    } else {
      checkClass+=" checkOut";
    }

    if(this.props.pin===true){
      pinClass+=" pinIn"
    } else {
      pinClass+=" pinOut"
    }

    if(this.props.courseColor!==""){
      checkMarkBG=this.props.courseColor;
      courseClass="course";
    } else {
      checkMarkBG="#64b5f6";
      courseClass+=" courseNone"
    }

    var descriptionDisplay="none";
    var marginNameFix="";
    if(this.props.description!==undefined&&this.props.description!==null){
      descriptionDisplay="";
      marginNameFix="marginNameFix"
    }
    
    var dateColor;
    var dateFontWeight;
    if (this.props.timeEnd==="All day" && eventToday(this.props.dateObjEnd)===true){
      dateColor="";
      dateFontWeight="unset";
    } else if(this.props.dateObjEnd < Date.now()){
      dateColor="#c53f3f";
      dateFontWeight="bold";
    } else {
      dateColor="";
      dateFontWeight="unset";
    }

    var displayTimeEnd;
    if(this.props.timeEnd==="All day"){
      displayTimeEnd="";
    } else {
      displayTimeEnd=" - "+this.props.timeEnd;
    }
    return(
      <tr className="taskEntry fadeIn">
        <td className={pinDisplay} onClick={(e) => this.handleItemClick(e, "pin")}><img alt="check" className={pinClass} src={pinIcon}/></td>
        <td style={{"backgroundColor":checkMarkBG}} className="check" onClick={(e) => this.handleItemClick(e, clickActionCheck)}><img alt="check" className={checkClass} src={checkIcon}/></td>
        <td className="task" style={{"color":checkColor, "transition":"all 0.5s", "position":"relative"}}>
          <div className={marginNameFix} style={{"textDecoration":textStyle}}>{this.props.course+" "+this.props.name}</div>
          <OverlayTrigger placement={"bottom"} overlay={<Tooltip><div dangerouslySetInnerHTML={{ __html: this.props.description }}></div></Tooltip>}>
            <img alt="descriptions" className="infoIcon" src={infoIcon} style={{"display":descriptionDisplay}}/>
          </OverlayTrigger>
        </td>
        <td className="date" style={{color:dateColor,fontWeight:dateFontWeight}}>{this.props.date}</td>
        <td className="time">{this.props.timeStart}{displayTimeEnd}</td>
        <td className={courseClass}>{this.props.course}</td>
      </tr>
    )
  }
}

function eventToday(date,today=new Date()){
  if(date.getDay()===today.getDay() && date.getDate()===today.getDate() && date.getMonth()===today.getMonth() && date.getYear()===today.getYear()){
    return true;
  } else {
    return false;
  }
}

function getDisplayDayFull(date){
  var weekDay="";
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
  return weekDay;
}
function getDisplayDay(date){
  var weekDay="";
  if(date.getDay()===0){
    weekDay="Sun.";
  } else if (date.getDay()===1){
    weekDay="Mon.";
  } else if (date.getDay()===2){
    weekDay="Tues.";
  } else if (date.getDay()===3){
    weekDay="Wed.";
  } else if (date.getDay()===4){
    weekDay="Thurs.";
  } else if (date.getDay()===5){
    weekDay="Fri.";
  } else if (date.getDay()===6){
    weekDay="Sat.";
  }
  return weekDay;
}

function getDisplayMonth(date){
  var month="";
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
  return month;
}

function getDisplayMonthFull(date){
  var month="";
  if(date.getMonth()===0){
    month="January"
  } else if (date.getMonth()===1){
    month="February"
  } else if (date.getMonth()===2){
    month="March"
  } else if (date.getMonth()===3){
    month="April"
  } else if (date.getMonth()===4){
    month="May"
  } else if (date.getMonth()===5){
    month="June"
  } else if (date.getMonth()===6){
    month="July"
  } else if (date.getMonth()===7){
    month="August"
  } else if (date.getMonth()===8){
    month="September"
  } else if (date.getMonth()===9){
    month="October"
  } else if (date.getMonth()===10){
    month="November"
  } else if (date.getMonth()===11){
    month="December"
  }
  return month;
}

function displayDate(date){
  if(isNaN(date.getMonth())&&isNaN(date.getDay())&&isNaN(date.getDate())){
    return "All day"
  } else {
    var output="";
    var month=getDisplayMonth(date);
    var weekDay = getDisplayDayFull(date)
    output=weekDay+" "+month+" " + date.getDate()
    return output;
  }
}

function displayTime(date){
  if(isNaN(date.getHours())&&isNaN(date.getMinutes())){
    return "All day"
  } else {
    var output = "Undefined";
    var minutes = date.getMinutes();
    if(minutes<=9){
      minutes="0"+minutes;
    }
    var hours = date.getHours();
    var meridian;
    if(hours>12){
      hours=hours-12;
      meridian="pm";
    } else {
      meridian="am"
    }

    if(minutes==="00"){
      output = hours+" "+meridian;
    } else {
      output = hours+":"+minutes+" "+meridian;
    }
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

function sortPin(calendarObjects){
  var sortedCalendarObjects = calendarObjects;
  var nameA;
  var nameB;
  sortedCalendarObjects.sort(function(a, b) {
    if(a.pin === true){
      nameA="0000pin";
    } else {
      nameA="zzzzpin";
    }
    if(b.pin === true){
      nameB="0000pin";
    } else {
      nameB="zzzzpin";
    }
    return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
  });
  return sortedCalendarObjects;
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
  if(summary !== undefined && summary.length>=2 && (summary.substring(0,2)==="✔️"||summary.substring(0,2)==="📌")){
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
  } else if(summary!==undefined&&name.length>=8&&/^\d+$/.test(name.substring(3,6))&&!/\d/.test(name.substring(0,3))&&name.substring(6,8)==="H1"){
    if(name.substring(8,9)!==" "){
      name=name.substring(8);
    } else {
      name=name.substring(9);
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
  if(summary !== undefined && summary.length>=2 && (summary.substring(0,2)==="✔️"||summary.substring(0,2)==="📌")){
    name=summary.substring(2);
  } else {
    name=summary;
  }

  if(summary!==undefined&&name.length>7&&/^\d+$/.test(name.substring(3,7))&&!/\d/.test(name.substring(0,3))){
    course=name.substring(0,7);
  } else if(summary!==undefined&&name.length>=8&&/^\d+$/.test(name.substring(3,6))&&!/\d/.test(name.substring(0,3))&&name.substring(6,8)==="H1"){
    course=name.substring(0,8);
  } else if(summary!==undefined&&name.length>6&&/^\d+$/.test(name.substring(3,6))&&!/\d/.test(name.substring(0,3))){
    course=name.substring(0,6);
  }  else {
    course="";
  }
  return course;
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
