import React, {ReactNode, SyntheticEvent} from 'react';
import { AsyncStorage } from 'AsyncStorage';
import ApiCalendar from 'react-google-calendar-api';
import 'bootstrap/dist/css/bootstrap.min.css';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tabs'
import './App.css';
// import { makeStyles } from '@material-ui/core/styles';
// import TextField from '@material-ui/core/TextField';
// import { createMuiTheme } from '@material-ui/core/styles';
// import { ThemeProvider } from '@material-ui/styles';

import WelcomeMessage from "./components/WelcomeMessage"
import Settings from "./components/Settings"
import TaskList from "./components/TaskList"
import {getDisplayDayFull, getDisplayDay, getDisplayMonth, getDisplayMonthFull, displayDate, displayTime} from "./functions/DateFunctions"
import Pomo from "./components/Pomo"
import WeekList from "./components/DayView"
import Header1 from "./components/Header1"
import Refresh from "./components/Refresh"
import TimeOutError from "./components/TimeOutError"
import {listEvents, sortPin, sortName, sortCourse, sortDate, sortCheck, determineTaskName, determineTaskCourse, appendLastSort} from "./functions/DataFunctions"

global.version = "3.2.4";
global.changeLog = [
  "3.2.4: Huge performance optimizations and loading of data. Also added warning for invalid calendar ID",
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
//make 7 day view option start on sunday->saturday instead of next 7 days
//pomodoro timer
//count how many successful pomodoros

//mark tracker
//split up into multiple files
//add third calendar ID
//verify on google - rename name - https://medium.com/cafe24-ph-blog/tips-on-verifying-google-application-that-uses-sensitive-scopes-3b75dfb590ae
//tabs with different course names - based on what was entered (and separate by tests, homework, etc)

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
        storedID = storedIDs[i][1];
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
      signStatus: ApiCalendar.sign,
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

  sortCalendarObjects(type, calendarObjects){
    if(this.state.signStatus){
      if(type==="sortName"){
        AsyncStorage.setItem("lastSort", appendLastSort("sortName",this.state.lastSort));
        this.setState({
          lastSort: appendLastSort("sortName",this.state.lastSort)
        })
        return sortPin(sortName(calendarObjects));
      } else if(type==="sortDate") {
        AsyncStorage.setItem("lastSort", appendLastSort("sortDate",this.state.lastSort));
        this.setState({
          lastSort: appendLastSort("sortDate",this.state.lastSort)
        })
        return sortPin(sortDate(calendarObjects));
      } else if(type==="sortCourse") {
        AsyncStorage.setItem("lastSort", appendLastSort("sortCourse",this.state.lastSort));
        this.setState({
          lastSort: appendLastSort("sortCourse",this.state.lastSort)
        })
        return sortPin(sortCourse(calendarObjects));
      } else if(type==="sortCheck") {
        AsyncStorage.setItem("lastSort", appendLastSort("sortCheck",this.state.lastSort));
        this.setState({
          lastSort: appendLastSort("sortCheck",this.state.lastSort)
        })
        return sortPin(sortCheck(calendarObjects));
      }
    }
  }
      
  handleItemClick(event: SyntheticEvent<any>, name: string, calendarObjects: string): void {
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
      this.setState({calendarObjects: this.sortCalendarObjects('sortName', calendarObjects)})
    } else if (name==='sortCourse'){
      this.setState({calendarObjects: this.sortCalendarObjects('sortCourse', calendarObjects)})
    } else if (name==='sortDate'){
      this.setState({calendarObjects: this.sortCalendarObjects('sortDate', calendarObjects)})
    } else if (name==='sortPin'){
      this.setState({calendarObjects: sortPin(calendarObjects)});
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
      
      var lastSortList = this.state.lastSort.split(",");
      lastSortList.map(function(sortElement){
        calendarObjectsReduced = this.sortCalendarObjects(sortElement, calendarObjectsReduced);
      }, this)

      this.setState({
        calendarObjects: calendarObjectsReduced,
      });
    }).catch(error => {
      this.setState({
        calendarObjects: ["invalidID"],
      });
      console.log(this.state.calendarObjects.length);
    });
  }
  async resetCalendarObjects(){
    if(this.resetDisable===false){
      this.resetDisable=true;
      await this.setState({calendarObjects:[]});
      await this.refreshWholeList();
      setTimeout(function () {
          this.resetDisable=false;
      }.bind(this), 1000);
    }
  }

  async refreshWholeList() {
    await this.loadSyncData();
    await this.darkModeFunction();
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
    var invalidCalendarDisplay="none";
    if(this.state.signStatus){
      signStatusDisplay="none";
    } else {
      signStatusDisplay="";
    }
    if(this.state.calendarObjects.length<=0 && this.state.signStatus){
      calendarObjectsLengthDisplay="";
    } else if (this.state.calendarObjects[0]==="invalidID" && this.state.signStatus){
      invalidCalendarDisplay="";
    }
    var today=new Date();
    var currentDisplayDate;
    if(window.innerWidth>767){
      currentDisplayDate=getDisplayDayFull(today)+" "+getDisplayMonthFull(today)+" "+today.getDate()
    } else {
      currentDisplayDate=getDisplayDay(today)+" "+getDisplayMonth(today)+" "+today.getDate()
    }
    var welcomeOpen=false;
    if(this.state.lastSignIn!==global.version){
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
        <div className="alert alert-danger fadeIn" role="alert" onClick={(e) => this.handleItemClick(e, 'signIn')} style={{"display":signStatusDisplay, "animationDelay":"600ms", "position":"fixed","bottom":"1%", "cursor":"pointer", "marginRight":"2.5%"}}>
          You are not logged-in. Login <u>here</u> or in the settings.
        </div>
        <div className="alert alert-warning fadeIn" role="alert" style={{"display":calendarObjectsLengthDisplay, "animationDelay":"600ms", "position":"fixed","bottom":"1%", "marginRight":"2.5%"}}>
          There are no events for this calendar. Add some and refresh to view.
        </div>
        <div className="alert alert-warning fadeIn" role="alert" style={{"display":invalidCalendarDisplay, "animationDelay":"600ms", "position":"fixed","bottom":"1%", "marginRight":"2.5%"}}>
          It seems you are using an invalid calendar ID. Open settings and double check.
        </div>
        <TimeOutError errorTimeoutOpen={this.state.errorTimeoutOpen} errorCode={this.state.errorCode}/>
        <WelcomeMessage welcomeOpen={welcomeOpen} errorCode={this.state.errorCode} signStatus={this.state.signStatus}/>
        {/* <AddEvent resetCalendarObjects={this.resetCalendarObjects}/> */}
      </div>
    );
  }
}

// const theme = createMuiTheme({
//   palette: {
//     type: 'dark',
//     primary: {
//       main: '#64b5f6',
//     },
//   },
// });

// class AddEvent extends React.Component{
//   constructor(props) {
//     super(props);
//     this.state ={show: false};
//   }
//   handleItemClick(event: SyntheticEvent<any>, name: string): void {
//     if (name==='openAdd') {
//       this.setState({show: true})
//     } else if (name==='close'){
//       this.setState({show: false})
//     } else if (name==='add'){
//       this.props.resetCalendarObjects();
//       this.setState({show: false})
//     }
//   }
//   handleChange(event,props) {
//     if(event.target.name==="calendarID"){
//       AsyncStorage.setItem('calendarIDKey', event.target.value);
//       this.props.setCalendarID(event.target.value)
//     }
//   }
//   render(){
//     return(
//       <div>
//         <div className="addButton" onClick={(e) => this.handleItemClick(e, "openAdd")}><div className="addButtonOffset">+</div></div>
//         <Modal className="settingsModal" backdrop="static" show={this.state.show} size="lg">
//           <Modal.Header>
//             <div className="header1" style={{"marginBottom":"0px"}}>Add Task</div>
//           </Modal.Header>
//           <Modal.Body>
//             <ThemeProvider theme={theme}>
//               <TextField placeholder="Task" color="primary" fullWidth size="medium" label="" inputProps={{style: {fontSize: 40}}} InputLabelProps={{style: {fontSize: 10}}} style={{width:"50%"}}/>
//             </ThemeProvider>  
//           </Modal.Body>
//           <Modal.Footer>
//           <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "close")} style={{"position":"absolute", "left":"10px"}}>
//             Close
//           </Button>
//           <Button variant="primary" onClick={(e) => this.handleItemClick(e, "add")}>
//             Add
//           </Button>
//           </Modal.Footer>
//         </Modal>
//       </div>
//     )
//   }
// }




// class AddTask extends React.Component {

//   render() {
//     return(
//       <div className="tasks">
//         <Header2 content="Add Task"/>
//       </div>
//     )
//   }
// }



// function Header2(props){
//   return(
//     <div className="header2">
//       {props.content}
//     </div>
//   )
// }


const Input = ({ id, type, label, value, onChange }) => {
  const classes = value.length ? 'Input Input--has-value' : 'Input'
  return (
    <div className={classes}>
      <input id={id}  type={type} value={value} onChange={onChange} />
      <label htmlFor={id} className="Input__label">{label}</label>
    </div>
  )
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}