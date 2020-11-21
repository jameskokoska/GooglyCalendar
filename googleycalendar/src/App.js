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
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
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
import { SliderPicker } from 'react-color';
import FlipMove from 'react-flip-move';
import CountUp from 'react-countup';

var versionGlobal = "3.2.3";
var changeLogGlobal = [
  "3.2.3: Cleaned up backend database functions",
  "3.2.3: Fixed Pomodoro timer bug with pausing",
  "3.2: Added Pomodoro tracking, can be reset in settings",
  "3.1: Added Pomodoro timer sound effect",
  "3.1: Can disable/enable sound effect in settings",
  "3.1: Edited text for not signed in error",
  "3.1: Can continue without logging in - to use Pomodoro timer",
  "3.0: Added a Pomodoro timer",
  "3.0: Pomodoro timer amounts can be configured in settings",
  "3.0: Thanks Emily for the inspiration: https://mymyxtran.github.io/toasty/",
];

//Eventually:
//Fix vibration feedback
//Add events

//TODO:
//sort by calendar ID (coloured dot? only show up if more than one calendar loaded)
//add filter both ways (sort by least/most)
//split up into multiple files
//make 7 day view option start on sunday->saturday instead of next 7 days
//pomodoro timer
//count how many successful pomodoros

//search bar for task name/course/date

//Date object documentation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.refreshWholeList = this.refreshWholeList.bind(this);
    this.resetCalendarObjects = this.resetCalendarObjects.bind(this);
    this.signUpdate = this.signUpdate.bind(this);
    this.loadSyncData = this.loadSyncData.bind(this);
    this.sortCalendarObjects = this.sortCalendarObjects.bind(this);
    this.updateDone = this.updateDone.bind(this);
    this.updatePin = this.updatePin.bind(this);
    this.errorTimeoutOpen = this.errorTimeoutOpen.bind(this);
    this.getEventObjects = this.getEventObjects.bind(this);
    this.setCalendarID = this.setCalendarID.bind(this);
    this.setCalendarID2 = this.setCalendarID2.bind(this);
    this.darkModeFunction = this.darkModeFunction.bind(this);
    this.state ={calendarObjects: [], signStatus:"", errorTimeoutOpen: false, autoDark:"true"};
    ApiCalendar.onLoad(() => {
        this.loadSyncData();
        this.refreshWholeList();
        ApiCalendar.listenSign(this.signUpdate);
        this.setState({ signStatus: ApiCalendar.sign})
    });
    this.resetDisable = false;
    //this.courseColorsLight = ["#ef5350","#ab47bc","#5c6bc0","#29b6f6","#26a69a","#9ccc65","#ffee58","#ffa726","#8d6e63","#78909c"];
    //this.courseColorsDark = ["#b61827","#790e8b","#26418f","#0086c3","#00766c","#6b9b37","#c9bc1f","#c77800","#5f4339","#4b636e"];
    this.courseColorsLight = ["#ffcdd2","#e1bee7","#c5cae9","#b3e5fc","#b2dfdb","#dcedc8","#fff9c4","#ffe0b2","#d7ccc8","#cfd8dc"];
    this.courseColorsDark = ["#cb9ca1","#af8eb5","#9499b7","#82b3c9","#82ada9","#aabb97","#cbc693","#cbae82","#a69b97","#9ea7aa"];
    this.darkModeFunction();
  }

  darkModeFunction(){
    //Dark mode colors
    var currentHours = new Date().getHours();
    if((this.state.autoDark==="true" && (currentHours > 19 || currentHours < 7)) || (this.state.autoDark==="false" && this.state.darkMode==="true")){
      document.documentElement.style.setProperty('--background', "#121212");
      document.documentElement.style.setProperty('--background-settings', "#141414");
      document.documentElement.style.setProperty('--font-color', "#eeeeee");
      document.documentElement.style.setProperty('--highlight', "#9e9e9e25");
      document.documentElement.style.setProperty('--highlight2', "#66666623");
      document.documentElement.style.setProperty('--highlight-tabs', "#c9c9c925");
      document.documentElement.style.setProperty('--accent', "#2889f7c9");
      document.documentElement.style.setProperty('--brightnessIcon', "1");
      this.courseColors = this.courseColorsDark;
      this.darkMode = true;
    } else {
      this.darkMode = false;
      document.documentElement.style.setProperty('--background', "#fafafa");
      document.documentElement.style.setProperty('--background-settings', "white");
      document.documentElement.style.setProperty('--font-color', "#111111");
      document.documentElement.style.setProperty('--highlight', "#42424248");
      document.documentElement.style.setProperty('--highlight2', "#8b8b8b1a");
      document.documentElement.style.setProperty('--highlight-tabs', "#3838381f");
      document.documentElement.style.setProperty('--accent', "#64b5f6");
      document.documentElement.style.setProperty('--brightnessIcon', "0");
      this.courseColors = this.courseColorsLight;
    }
  }
  

  async loadSyncData(){
    var storedIDs = [['calendarIDKey','primary'], ['calendarIDKey2',''], ['numEventsKey',20], ['hoursBefore',0], ['importantEvents',''],
    ['lastSort',"sortName,sortCourse,sortCheck,sortDate"],['hideEvents',""], ['nextWeekShow',7], ['autoDark',"true"],['darkMode',"false"],['lastSignIn',0],['courseColor1',""],['courseColor2',""],
    ['courseColor3',""],['courseColor4',""], ['courseColor5',""], ['courseColor6',""], ['courseColor7',""], ['course1',""], ['course2',""],
    ['course3',""], ['course4',""], ['course5',""], ['course6',""], ['course7',""]];
    var savedID = [];
    var storedIDsAndSet = [['workSeconds',0], ['breakSeconds',0], ['workMinutes',25], ['breakMinutes',5],['pomoSound',"true"]];
    var savedIDAndSet = [];
    var storedID;
    for(var i=0; i<storedIDs.length; i++){
      storedID = await AsyncStorage.getItem(storedIDs[i][0]);
      if(storedID === undefined){
        storedID = storedIDs[i][1]
      }
      savedID[i] = storedID;
    }
    for(i=0; i<storedIDsAndSet.length; i++){
      storedID = await AsyncStorage.getItem(storedIDsAndSet[i][0]);
      if(storedID === undefined){
        storedID = storedIDsAndSet[i][1];
        await AsyncStorage.setItem(storedIDsAndSet[i][0], storedID);
      }
      savedIDAndSet[i] = storedID;
    }
    this.setState({ 
      calendarID: savedID[0],
      calendarID2: savedID[1],
      numEvents:savedID[2],
      hoursBefore:savedID[3],
      importantEvents:savedID[4],
      lastSort:savedID[5],
      hideEvents:savedID[6],
      nextWeekShow:savedID[7],
      autoDark:savedID[8],
      darkMode:savedID[9],
      lastSignIn:savedID[10],
      courseColor1:savedID[11],
      courseColor2:savedID[12],
      courseColor3:savedID[13],
      courseColor4:savedID[14],
      courseColor5:savedID[15],
      courseColor6:savedID[16],
      courseColor7:savedID[17],
      course1:savedID[18],
      course2:savedID[19],
      course3:savedID[20],
      course4:savedID[21],
      course5:savedID[22],
      course6:savedID[23],
      course7:savedID[24],
      workSeconds:savedIDAndSet[0],
      breakSeconds:savedIDAndSet[1],
      workMinutes:savedIDAndSet[2],
      breakMinutes:savedIDAndSet[3],
      pomoSound:savedIDAndSet[4],
    });
  }
  signUpdate() {
    this.setState({ signStatus: ApiCalendar.sign});
    this.refreshWholeList();
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
        AsyncStorage.setItem("lastSort", appendLastSort("sortName",this.state.lastSort));
        this.setState({
          calendarObjects: sortPin(sortName(this.state.calendarObjects)),
          lastSort: appendLastSort("sortName",this.state.lastSort)
        })
      } else if(type==="sortDate") {
        AsyncStorage.setItem("lastSort", appendLastSort("sortDate",this.state.lastSort));
        this.setState({
          calendarObjects: sortPin(sortDate(this.state.calendarObjects)),
          lastSort: appendLastSort("sortDate",this.state.lastSort)
        })
      } else if(type==="sortCourse") {
        AsyncStorage.setItem("lastSort", appendLastSort("sortCourse",this.state.lastSort));
        this.setState({
          calendarObjects: sortPin(sortCourse(this.state.calendarObjects)),
          lastSort: appendLastSort("sortCourse",this.state.lastSort)
        })
      } else if(type==="sortCheck") {
        AsyncStorage.setItem("lastSort", appendLastSort("sortCheck",this.state.lastSort));
        this.setState({
          calendarObjects: sortPin(sortCheck(this.state.calendarObjects)),
          lastSort: appendLastSort("sortCheck",this.state.lastSort)
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

  getEventObjects(calendarIDPassed){
    listEvents(this.state.numEvents,this.state.hoursBefore).then(({result}: any) => {
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
          if(this.state.importantEvents!==""&&this.state.importantEvents.split(",").length>0){
            try{
              calendarObjects[i].important = false;
              for(var x=0; x<this.state.importantEvents.split(",").length;x++){
                if (calendarObjects[i].name.toLowerCase().includes(this.state.importantEvents.split(",")[x].toLowerCase())||calendarObjects[i].course.toLowerCase().includes(this.state.importantEvents.split(",")[x].toLowerCase())){
                  calendarObjects[i].important = true;
                }
              }
            }catch(e){
              console.log('error', e);     
            }
          } else {
            calendarObjects[i].important = false;
          }
          if(this.state.hideEvents!==""&&this.state.hideEvents.split(",").length>0){
            try{
              calendarObjects[i].hide = false;
              for(var y=0; y<this.state.hideEvents.split(",").length;y++){
                if (calendarObjects[i].name.includes(this.state.hideEvents.split(",")[y])||calendarObjects[i].course.includes(this.state.hideEvents.split(",")[y])){
                  calendarObjects[i].hide = true;
                }
              }
            }catch(e){
              console.log('error', e);     
            }
          } else {
            calendarObjects[i].hide = false;
          }
          if(this.state.course1.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            calendarObjects[i].courseColor=this.state.courseColor1;
          } else if(this.state.course2.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            calendarObjects[i].courseColor=this.state.courseColor2;
          } else if(this.state.course3.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            calendarObjects[i].courseColor=this.state.courseColor3;
          } else if(this.state.course4.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            calendarObjects[i].courseColor=this.state.courseColor4;
          } else if(this.state.course5.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            calendarObjects[i].courseColor=this.state.courseColor5;
          } else if(this.state.course6.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            calendarObjects[i].courseColor=this.state.courseColor6;
          } else if(this.state.course7.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            calendarObjects[i].courseColor=this.state.courseColor7;
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
          // calendarObjects[i].important = "";
          // calendarObjects[i].hide = "";
          calendarObjects[i].calendarID=calendarIDPassed;
          calendarObjectsReduced.push(calendarObjects[i]);
        }
      }
      Array.prototype.push.apply(calendarObjectsReduced,this.state.calendarObjects); 
      this.setState({
        calendarObjects: calendarObjectsReduced,
      })
      var lastSortList = this.state.lastSort.split(",");
      lastSortList.map(function(sortElement){
        this.sortCalendarObjects(sortElement);
      }, this)
    })
  }
  resetCalendarObjects(){
    if(this.resetDisable===false){
      this.resetDisable=true;
      this.setState({calendarObjects:[]})
      setTimeout(function () {
          this.refreshWholeList();
      }.bind(this), 1);
      setTimeout(function () {
          this.resetDisable=false;
          this.darkModeFunction();
      }.bind(this), 1000);
    }
  }

  refreshWholeList() {
    this.loadSyncData();
    this.darkModeFunction();
    if (ApiCalendar.sign){
      if(this.state.calendarID===""||this.state.calendarID===null||this.state.calendarID===undefined){
        ApiCalendar.setCalendar("primary");
      } else {
        ApiCalendar.setCalendar(this.state.calendarID);
      } 
      this.getEventObjects(this.state.calendarID);
      if(this.state.calendarID2!==this.state.calendarID&&this.state.calendarID2!==""&&this.state.calendarID2!==null&&this.state.calendarID2!==undefined){
        ApiCalendar.setCalendar(this.state.calendarID2);
        this.getEventObjects(this.state.calendarID2);
      }
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
    if(this.state.calendarObjects.length<=0 && this.state.signStatus && !this.resetDisable){
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
    var welcomeOpen=false;
    if(this.state.lastSignIn!==versionGlobal){
      welcomeOpen=true;
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
              <TaskList calendarObjects={this.state.calendarObjects} courseColors={this.courseColors} hoursBefore={this.state.hoursBefore} nextWeekShow={this.state.nextWeekShow} sortCalendarObjects={this.sortCalendarObjects} updateDone={this.updateDone} errorTimeoutOpen={this.errorTimeoutOpen} updatePin={this.updatePin} darkMode={this.darkMode}/>
            </Tab>
            <Tab eventKey="2" title="Day View">
              <WeekList calendarObjects={this.state.calendarObjects} nextWeekShow={this.state.nextWeekShow} courseColors={this.courseColors} updateDone={this.updateDone} errorTimeoutOpen={this.errorTimeoutOpen} updatePin={this.updatePin} darkMode={this.darkMode}/>
            </Tab>
            <Tab eventKey="3" title="Pomodoro">
              <Pomo calendarObjects={this.state.calendarObjects} darkMode={this.darkMode} pomoSound={this.state.pomoSound}/>
            </Tab>
        </Tabs>
        <Settings 
          resetCalendarObjects={this.resetCalendarObjects} 
          signStatus={this.state.signStatus} 
          setCalendarID={this.setCalendarID} 
          setCalendarID2={this.setCalendarID2} 
          calendarID={this.state.calendarID}
          calendarID2={this.state.calendarID2}
          numEvents={this.state.numEvents}
          nextWeekShow={this.state.nextWeekShow}
          hoursBefore={this.state.hoursBefore}
          importantEvents={this.state.importantEvents}
          hideEvents={this.state.hideEvents}
          autoDark={this.state.autoDark==="true"}
          darkMode={this.state.darkMode==="true"}
          courseColor1={this.state.courseColor1} 
          courseColor2={this.state.courseColor2} 
          courseColor3={this.state.courseColor3} 
          courseColor4={this.state.courseColor4} 
          courseColor5={this.state.courseColor5} 
          courseColor6={this.state.courseColor6} 
          courseColor7={this.state.courseColor7}
          course1={this.state.course1}
          course2={this.state.course2}
          course3={this.state.course3}
          course4={this.state.course4}
          course5={this.state.course5}
          course6={this.state.course6}
          course7={this.state.course7}
          breakSeconds={this.state.breakSeconds}
          workSeconds={this.state.workSeconds}
          breakMinutes={this.state.breakMinutes}
          workMinutes={this.state.workMinutes}
          pomoSound={this.state.pomoSound==="true"}
          />
        <Refresh signStatus={this.state.signStatus} resetCalendarObjects={this.resetCalendarObjects}/>
        {/* <AddEvent/> */}
        <div className="alert alert-danger fadeIn" role="alert" onClick={(e) => this.handleItemClick(e, 'signIn')} style={{"display":signStatusDisplay, "animationDelay":"600ms", "position":"fixed","bottom":"1%", "cursor":"pointer"}}>
          You are not logged-in. Login <u>here</u> or in the settings.
        </div>
        <div className="alert alert-warning fadeIn" role="alert" style={{"display":calendarObjectsLengthDisplay, "animationDelay":"600ms", "position":"fixed","bottom":"1%"}}>
          There are no events for this calendar. Add some and refresh to view.
        </div>
        <TimeOutError errorTimeoutOpen={this.state.errorTimeoutOpen} errorCode={this.state.errorCode}/>
        <WelcomeMessage welcomeOpen={welcomeOpen} errorCode={this.state.errorCode} signStatus={this.state.signStatus}/>
      </div>
    );
  }
}

class Pomo extends React.Component{
  constructor(props) {
    super(props);
    this.state = {currentSeconds: 0, paused: true, work: true};
    this.getAsyncStorage();
    this.workMessages = ["Go get some work done!", "You got this!", "Keep going at it!", "Hard work pays off.",":)","You can do it!","Work smart, get things done.","Work now, party later.","Don't be distracted.", "Be productive.","Don't waste time.","Focus.","Keep going!","Keep pushing."];
    this.chosenWorkMessage = this.workMessages[Math.floor(Math.random() * this.workMessages.length)];
    this.audio = new Audio(require("./assets/ding.m4a"));
    this.addPomoTotalSec=0;
  }
  playSound(){
    if(this.props.pomoSound==="true" && this.state.currentSeconds === 0){
      this.audio.play();
    }
  }
  addTotalTime(){
    if(this.state.work===true){
      this.addPomoTotalSec=parseInt(this.addPomoTotalSec)+parseInt(this.state.workSeconds)+parseInt(this.state.workMinutes*60);
      AsyncStorage.setItem('pomoTotalSec', this.addPomoTotalSec);
    }
  }
  async getAsyncStorage(){
    var storedIDsAndSet = [['workSeconds',0], ['breakSeconds',0], ['workMinutes',25], ['breakMinutes',5],['pomoSound',"true"],['pomoTotalSec', 0]];
    var savedIDAndSet = [];
    var storedID;
    for(var i=0; i<storedIDsAndSet.length; i++){
      storedID = await AsyncStorage.getItem(storedIDsAndSet[i][0]);
      if(storedID === undefined){
        storedID = storedIDsAndSet[i][1];
        await AsyncStorage.setItem(storedIDsAndSet[i][0], storedID);
      }
      savedIDAndSet[i] = storedID;
    }
    this.addPomoTotalSec=savedIDAndSet[5];
    this.setState({ 
      workSeconds:savedIDAndSet[0],
      breakSeconds:savedIDAndSet[1],
      workMinutes:savedIDAndSet[2],
      breakMinutes:savedIDAndSet[3],
      pomoSound:savedIDAndSet[4],
      currentSeconds:parseInt(savedIDAndSet[0])+parseInt(savedIDAndSet[2]*60),
      paused: true,
    });
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  startTimer(){
    this.interval = setInterval(() => {
      this.setState({currentSeconds: this.state.currentSeconds-1});
      this.playSound();
    }, 1000);
  }
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name==="resetTimer") {
      this.getAsyncStorage();
      this.setState({paused: true, work: true});
      clearInterval(this.interval);
      this.setState({currentSeconds: parseInt(this.state.workSeconds)+parseInt(this.state.workMinutes*60)});
      if(this.state.currentSeconds<0){
        this.addTotalTime();
      }
    } else if (name==="pauseTimer"&&this.state.currentSeconds>0) {
      if(!this.state.paused){
        clearInterval(this.interval);
      } else {
        this.startTimer();
      }
      this.setState({paused: !this.state.paused});
    } else if (name==="pauseTimer"&&this.state.currentSeconds<=0){
      return;
    } else if (name==="startBreak") {
      this.setState({currentSeconds: parseInt(this.state.breakSeconds)+parseInt(this.state.breakMinutes*60), work:false});
      this.startTimer();
      this.addTotalTime();
    } else if (name="startWork"){
      this.setState({currentSeconds: parseInt(this.state.workSeconds)+parseInt(this.state.workMinutes*60), work:true});
      this.chosenWorkMessage = this.workMessages[Math.floor(Math.random() * this.workMessages.length)];
      this.startTimer();
    }
  }
  render(){
    var totalWidth=92;
    var percent;
    if(this.state.work){
      percent = (this.state.currentSeconds/(parseInt(this.state.workSeconds)+parseInt(this.state.workMinutes*60)))*totalWidth; 
    } else {
      percent = (this.state.currentSeconds/(parseInt(this.state.breakSeconds)+parseInt(this.state.breakMinutes*60)))*totalWidth; 
    }
    var pauseButtonLabel;
    if(!this.state.paused){
      pauseButtonLabel="Pause";
    } else {
      pauseButtonLabel="Start";
    }

    var minutes = pluralString(Math.floor(this.state.currentSeconds/60)===1,"minute");
    var seconds = pluralString(this.state.currentSeconds%60===1,"second");

    var timerMessage;
    if(this.state.currentSeconds<0){
      timerMessage = " ";
    }else if(Math.floor(this.state.currentSeconds/60)===0){
      timerMessage = (this.state.currentSeconds%60).toString() + " " + seconds;
    } else {
      timerMessage = (Math.floor(this.state.currentSeconds/60)).toString() + " " + minutes + " " + (this.state.currentSeconds%60).toString() + " " + seconds;
    } 
    if(isNaN(this.state.currentSeconds)){
      timerMessage="Make sure the timer is set up properly in settings";
    }

    
    var textMessage;
    if(this.state.work===false){
      textMessage = "Go enjoy your break!"
    } else {
      textMessage = this.chosenWorkMessage;
    }

    var displayBreakButton = "none";
    var displayWorkButton = "none";
    //set timer between break and work modes
    if (this.state.currentSeconds < 0 && this.state.work===true){
      displayBreakButton = "unset";
      clearInterval(this.interval);
    } else if (this.state.currentSeconds < 0 && this.state.work===false){
      displayWorkButton = "unset";
      clearInterval(this.interval);
    }
    return <div className="pomoTimerContainer">
      <div className="header1" style={{marginTop: "12vh", textAlign: "center"}}>{textMessage}</div>
      <div className="pomoTimer" style={{width:percent+"%"}}>
      </div>
      <div className="fadeIn" onClick={(e) => this.handleItemClick(e, "startBreak")} style={{display:displayBreakButton, marginTop: "-14px"}}>
        <ButtonStyle label={"Start Break"}/>
      </div>
      <div className="fadeIn" onClick={(e) => this.handleItemClick(e, "startWork")} style={{display:displayWorkButton, marginTop: "-14px"}}>
        <ButtonStyle label={"Start Work"}/>
      </div>
      <div style={{textAlign: "center"}}>{timerMessage}</div>
      <div style={{marginTop: "30px", marginBottom: "30px"}}>
        <Button variant="primary" onClick={(e) => this.handleItemClick(e, "pauseTimer")} style={{marginRight: '20px'}}>
          {pauseButtonLabel}
        </Button>
        <Button variant="outline-primary" onClick={(e) => this.handleItemClick(e, "resetTimer")}>
          Reset
        </Button>
      </div>
      <p style={{marginBottom:"30px"}}>
        You focused for <CountUp start={0} end={Math.floor(this.addPomoTotalSec/60)} duration={10} useEasing preserveValue redraw/> {pluralString(Math.floor(this.addPomoTotalSec/60)===1,"minute")}.
      </p>
    </div>
  } 
}

function pluralString(condition,string){
  if(condition){
    return string;
  } else {
    return string+"s";
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
    if(i===0){
      weekHeaders.push( <th className="weekday header3 fadeIn">Today</th> )
    } else {
      weekHeaders.push( <th className="weekday header3 fadeIn">{getDisplayDayFull((new Date()).addDays(i))}</th> )
    }
    
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
      <td className="fadeIn">
        <DayListEntry calendarObjects={props.calendarObjects} dayOffset={i} courseColors={props.courseColors} errorTimeoutOpen={props.errorTimeoutOpen} updateDone={props.updateDone} updatePin={props.updatePin} darkMode={props.darkMode}/>
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
            this.props.errorTimeoutOpen("Timeout error")
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
            this.props.errorTimeoutOpen("Timeout error")
          });
        }
      }
    }    
    if ((name==="pin"||name==="checkOff")&&this.props.pin===true) {
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
    var weekTimeLabelMargin=0;
    if((this.props.pinDisplay!=="none" && this.props.descriptionDisplay!=="none")&&this.props.courseDisplay==="none"){
      weekTimeLabelMargin=47;
    } else if(this.props.courseDisplay==="none"){
      weekTimeLabelMargin=15;
    }
    var iconBoxWeekRight="0px";
    var iconBoxWeekBottom="0px";
    if(this.props.courseDisplay==="none"){
      iconBoxWeekRight="-2px";
      iconBoxWeekBottom="-5px";
    }
    var pinClass = "pinIconWeek"
    if(this.props.pin===true){
      pinClass+=" pinInWeek"
    } else {
      pinClass+=" pinOutWeek"
    }
    var weekEntryClass="weekEntry";
    var weekEntryOpacity="1";
    if(this.props.done===true){
      weekEntryClass=weekEntryClass+" weekEntryDone";
      weekEntryOpacity="0.5";
    }
    return(
      <div className={weekEntryClass}>
        <div onClick={(e) => this.handleItemClick(e, this.props.clickActionCheck)} className="weekEventLabel" style={{"color":this.props.checkColor, "textDecoration":this.props.textStyle, "transition":"all 0.5s"}}>{this.props.name}</div>
        <div onClick={(e) => this.handleItemClick(e, this.props.clickActionCheck)} className="weekTimeLabel" style={{"marginRight":weekTimeLabelMargin+"px","opacity":weekEntryOpacity, "transition":"all 0.5s"}}>{this.props.timeStart+this.props.displayTimeEnd}</div>
        <div className="courseBubble" style={{"display":this.props.courseDisplay}}><span style={{"backgroundColor":this.props.courseColor}}>{this.props.course}</span></div>
        <div className="iconBoxWeek fadeIn" style={{"right":iconBoxWeekRight,"bottom":iconBoxWeekBottom}}>
          <img onClick={(e) => this.handleItemClick(e, "pin")} alt="pin" className={pinClass} src={pinIcon} style={{"display":this.props.pinDisplay}}/>
          <OverlayTrigger placement={"bottom"} overlay={<Tooltip><div dangerouslySetInnerHTML={{ __html: this.props.description }}></div></Tooltip>}>
            <img alt="descriptions" className="infoIconWeek" src={infoIcon} style={{"display":this.props.descriptionDisplay, "opacity":weekEntryOpacity}}/>
          </OverlayTrigger>
        </div>
      </div> 
    )
      
  }
}

class DayListEntry extends React.Component{
  
  render(){
    return(
      <FlipMove staggerDelayBy={5} staggerDurationBy={2} easing={"ease"} duration={700} leaveAnimation="none" enterAnimation="none">
        {this.props.calendarObjects.map(function(task){
          var displayTimeEnd;
          if(task.timeEnd==="All day"){
            displayTimeEnd="";
          } else {
            displayTimeEnd=" - "+task.timeEnd;
          }
          var courseDisplay="none";
          if(task.course!==""){
            courseDisplay="";
          }
          
          var descriptionDisplay="none";
          if(task.description!==undefined&&task.description!==null){
            descriptionDisplay="";
          }
          var pinDisplay="none";
          if(task.done===false){
            pinDisplay="";
          }
          var textStyle="none";
          var clickActionCheck="checkOff";
          var checkColor="";
          if(task.done===true){
            textStyle = "line-through";
            clickActionCheck="uncheckOff";
            checkColor="#777777";
          }
          if(task.important===true&&this.props.darkMode===true&&task.done===false){
            checkColor="#ff8b8b"
          } else if (task.important===true&&this.props.darkMode===false&&task.done===false){
            checkColor="#C85000"
          }
          if(task.hide===false&&(eventToday(new Date(task.start.dateTime),(new Date()).addDays(this.props.dayOffset))||eventToday(new Date(task.end.date),(new Date()).addDays(this.props.dayOffset)))){
            return(
              <DayEntry
                key={task.id}
                checkColor={checkColor}
                textStyle={textStyle}
                name={task.name}
                timeStart={task.timeStart}
                displayTimeEnd={displayTimeEnd}
                courseDisplay={courseDisplay}
                courseColor={task.courseColor}
                course={task.course}
                descriptionDisplay={descriptionDisplay}
                description={task.description}
                id={task.id}
                updateDone={this.props.updateDone}
                calendarIDCurrent={task.calendarID}
                done={task.done}
                clickActionCheck={clickActionCheck}
                pin={task.pin}
                updatePin={this.props.updatePin}
                pinDisplay={pinDisplay}
                important={task.important}
                darkMode={this.props.darkMode}
              />
            )
          }
        }, this)}
      </FlipMove>
    )
  }
}
class WeekList extends React.Component {
  render() {
    var minWidthNum;
    if(this.props.nextWeekShow<7){
      minWidthNum = this.props.nextWeekShow/7*1150;
    } else {
      minWidthNum = 1150;
    }
    
    return(
      <div className="week">
        <div className="weekTable">
          <table className="weekList" style={{minWidth:minWidthNum+"px"}}>
            <tbody>
              <tr>
                <WeekListHeader days={this.props.nextWeekShow}/>
              </tr>
              <tr>
                <DayList calendarObjects={this.props.calendarObjects} days={this.props.nextWeekShow} courseColors={this.props.courseColors} updateDone={this.props.updateDone} errorTimeoutOpen={this.props.errorTimeoutOpen} updatePin={this.props.updatePin} darkMode={this.props.darkMode}/>
              </tr>
            </tbody>
          </table>
        </div>
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
      <Modal className="settingsModal" show={this.props.errorTimeoutOpen} onHide={(e) => this.handleItemClick(e, "refreshPage")} size="lg">
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
    this.state ={show: false, resetDisable:false};
  }
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name==='refresh') {
      this.props.resetCalendarObjects();
      if(!this.state.resetDisable){
        this.setState({show: true})
      }
      this.setState({resetDisable:true})
      setTimeout(function () {
          this.setState({resetDisable:false})
      }.bind(this), 1000);
    } 
  }
  render(){
    var message="";    
    if(!this.props.signStatus){
      message="You are not signed in!"
    } else {
      message="Refreshed!"
    }
    var refreshIconClass="refreshIcon";
    var opacity=1;
    if(this.state.resetDisable){
      refreshIconClass+= " refreshIconSpin";
      opacity=0.5;
    }
    return(
      <div>
        <Toast onClose={() => this.setState({show: false})} show={this.state.show} delay={1500} autohide style={{"position":"fixed","bottom":"0%","left":"1%"}}>
          <Toast.Header>
            <strong className="mr-auto">{message}</strong>
          </Toast.Header>
        </Toast>
        <img style={{"opacity":opacity, "transition":"all 0.5s"}} alt="refresh" onClick={(e) => this.handleItemClick(e, "refresh")} src={refreshIcon} className={refreshIconClass}/>
      </div>
    )
  }
}

class Settings extends React.Component{
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
      this.props.resetCalendarObjects()
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
                {"v"+versionGlobal}
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

class ColorPicker extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false,
      colorValue: this.props.color
    };
  }
  setColor(color){
    AsyncStorage.setItem(this.props.courseStorageID, color);
  }
  handleColorChange = color => {
    this.setState({
      colorValue: color.hex
    });
    this.setColor(color.hex)
  };
  render(){
    return(
      <SliderPicker
        color={this.state.colorValue}
        onChange={this.handleColorChange}
      />
    )
  }
}

class TaskList extends React.Component {
  render() {
    return(
      <div className="tasks">
        <TaskTable calendarObjects={this.props.calendarObjects} courseColors={this.props.courseColors} hoursBefore={this.props.hoursBefore} nextWeekShow={this.props.nextWeekShow} sortCalendarObjects={this.props.sortCalendarObjects} updateDone={this.props.updateDone} errorTimeoutOpen={this.props.errorTimeoutOpen} updatePin={this.props.updatePin} darkMode={this.props.darkMode}/>
      </div>
    )
  }
}

class TaskTable extends React.Component{
  render() {
    return(
      <div className="taskTable">
        <table className="taskList">
          <thead>
            <tr className="fadeIn">
              <th className="pin header3"><div className="pinHeader"><img alt="pin pinHeader" src={pinIcon}/></div></th>
              <th className="check header3" onClick={e => this.props.sortCalendarObjects("sortCheck")}><div className="hoverSort checkHeader"><img alt="check" src={checkIcon}/></div></th>
              <th className="task header3" onClick={e => this.props.sortCalendarObjects("sortName")}><div className="hoverSort">Task</div></th>
              <th className="date header3" onClick={e => this.props.sortCalendarObjects("sortDate")}><div className="hoverSort">Date</div></th>
              <th className="time header3" onClick={e => this.props.sortCalendarObjects("sortDate")}><div className="hoverSort">Time</div></th>
              <th className="course header3" onClick={e => this.props.sortCalendarObjects("sortCourse")}><div className="hoverSort">Course</div></th>
            </tr>
          </thead>
          <FlipMove className="fadeIn" typeName="tbody" staggerDelayBy={5} staggerDurationBy={2} easing={"ease"} duration={700} leaveAnimation="none" enterAnimation="fade">
            {this.props.calendarObjects.map(function(task){
              if(task.hide===false){
                return(<TaskEntry
                key={task.id}
                name={task.name}
                date={task.date}
                timeStart={task.timeStart}
                timeEnd={task.timeEnd}
                course={task.course}
                courseColor={task.courseColor}
                done={task.done}
                id={task.id}
                hoursBefore={this.props.hoursBefore}
                nextWeekShow={this.props.nextWeekShow}
                updateDone={this.props.updateDone}
                calendarIDCurrent={task.calendarID}
                description={task.description}
                dateObjEnd={task.dateObjEnd}
                errorTimeoutOpen={this.props.errorTimeoutOpen}
                updatePin={this.props.updatePin}
                pin={task.pin}
                important={task.important}
                darkMode={this.props.darkMode}
                />)
              }
            }, this)}
          </FlipMove>
        </table>
      </div>
    )
  }
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

    if(this.props.important===true&&this.props.darkMode===true&&this.props.done===false){
      checkColor="#ff8b8b"
    } else if (this.props.important===true&&this.props.darkMode===false&&this.props.done===false){
      checkColor="#C85000"
    }
    return(
      <tr className="taskEntry">
        <td className={pinDisplay} onClick={(e) => this.handleItemClick(e, "pin")}><div className="fadeIn"><img alt="check" className={pinClass} src={pinIcon}/></div></td>
        <td style={{"backgroundColor":checkMarkBG}} className="check" onClick={(e) => this.handleItemClick(e, clickActionCheck)}><div className="fadeIn"><img alt="check" className={checkClass} src={checkIcon}/></div></td>
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
  if(summary!==undefined&&name.length>7&&/^\d+$/.test(name.substring(4,7))&&!/\d/.test(name.substring(0,4))){
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

  if(summary!==undefined&&name.length>7&&/^\d+$/.test(name.substring(4,7))&&!/\d/.test(name.substring(0,4))){
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

function appendLastSort(newSort, lastSort){
  var lastSortList = [];
  lastSortList = lastSort.split(",");
  lastSortList = lastSortList.filter(x=>x !== newSort);
  lastSortList = [...lastSortList, newSort];
  var lastSortListStr="";
  lastSortList.map(function(sortElement,i){
    if(i!==lastSortList.length-1){
      lastSortListStr=lastSortListStr+sortElement+",";
    } else {
      lastSortListStr=lastSortListStr+sortElement;
    }
  })
  return lastSortListStr;
}

class WelcomeMessage extends React.Component{
  constructor(props){
    super(props);
    this.state={welcomeOpenState: true}

  }
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name==='closeWelcome') {
      AsyncStorage.setItem('lastSignIn', versionGlobal);
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
          <Button variant="primary" onClick={(e) => ApiCalendar.handleAuthClick()}>
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
    var welcomeMessage2='The aim of this application is to turn your Google Calendar into a task list. It was written in React and the source code can be found here: <a href="https://github.com/jameskokoska/GoogleyCalendar">https://github.com/jameskokoska/GoogleyCalendar</a>'
    if(this.props.signStatus===true){
      welcomeMessage="A new update was released: version "+versionGlobal;
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
          <div className="header3">{"What's New? v"+ versionGlobal}</div>
          {changeLogGlobal.map(function(changeLogElement){
           return <li>{changeLogElement}</li>
          })}
        </Modal.Body>
        <Modal.Footer>
          {this.determineButton()}
        </Modal.Footer>
      </Modal>
    )
  }
}