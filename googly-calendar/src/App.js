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
import Toast from 'react-bootstrap/Toast'

import WelcomeMessage from "./components/WelcomeMessage"
import EventInfoMessage from "./components/EventInfoMessage"
import Settings, {getSettingsValue, settingsOptions, settingsOptionsColour} from "./components/Settings"
import TaskList from "./components/TaskList"
import {getDisplayDayFull, getDisplayDay, getDisplayMonth, getDisplayMonthFull, displayDate, displayTime} from "./functions/DateFunctions"
import Pomo from "./components/Pomo"
import WeekList from "./components/DayView"
import Header1 from "./components/Header1"
import Refresh from "./components/Refresh"
import TimeOutError from "./components/TimeOutError"
import {getStorage, listEvents, sortPin, sortName, sortCourse, sortDate, sortCheck, determineTaskName, determineTaskCourse, appendLastSort} from "./functions/DataFunctions"
import Marks from "./components/Marks"
import HomePage from "./components/HomePage"
import LoginGuideMessage from "./components/LoginGuideMessage"

global.version = "4.3.0";
global.changeLog = [
  "4.3.0: Huge performance improvements, cleaned up backend significantly",
  "4.3.0: Fixed some UI colours",
  "4.3.0: Improved loading",
  "4.2.3: Added a better colour selection",
  "4.2.3: Fixed first calendar ID always defaulting to primary",
  "4.2.3: Fixed changing assignment name is marks page",
  "4.2.0: Sorry your settings got wiped!",
  "4.2.0: Now hosted at https://googlycalendar.web.app",
  "4.1.0: Changed Google API backend and added login instructions",
  "4.0.0: Fixed course identification",
  "4.0.0: Renamed to calendar tasks",
  "3.9.6: Arrow keys can be used to change weeks on day view",
  "3.9.5: Added the ability to sync settings and data across platforms (see settings). Copy and paste the settings to sync them... auto syncing coming in the future?? I need to learn Firebase",
  "3.9.5: More feedback messages when loading/resetting settings",
  "3.9.0: Added custom fonts - in settings",
  "3.9.0: Added popup when the info button is clicked for an event to see description in more detail",
  "3.9.0: Added cool colours to day view - can be disabled in settings",
  "3.8.0: Fixed pomodoro settings not loading properly",
  "3.7.8: Added calendar event colours and calendar colours",
  "3.7.8: Changelog now highlights in bold for current version",
  "3.7.5: Day View is not limited to 'Number of days to view' setting",
  "3.7.5: Can now scroll through Day View with days instead of weeks",
  "3.7.0: Can now scroll through week view of tasks",
  "3.7.0: Added animation setting",
  "3.6.1: Now remembers your last tab",
  "3.5.5: Keep track of your marks for each course!",
  "3.5.0: Courses are automatically added, each one can have a custom colour",
  "3.5.0: Performance improvements for loading data",
];

//Eventually:
//Fix vibration feedback
//Add events

//TODO:
//bug: more than 1 day events are only displayed on one day

//reset button to reset all settings (clear async)
//export async storage (copy to clipboard)
//import async storage
//sync with firebase?? :o

//fade animations broken (hover) (make more like day-view ones)
//the course gets highlighted even though there is no course

//sort by calendar ID (coloured dot? only show up if more than one calendar loaded)
//add filter both ways (sort by least/most)
//count how many successful pomodoros

//calendar colour codes - print list of objects see if possible?
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
    this.calendarAction = this.calendarAction.bind(this);
    this.updateDone = this.updateDone.bind(this);
    this.updatePin = this.updatePin.bind(this);
    this.errorTimeoutOpen = this.errorTimeoutOpen.bind(this);
    this.getEventObjects = this.getEventObjects.bind(this);
    this.darkModeFunction = this.darkModeFunction.bind(this);
    this.toggleEventInfoOpen = this.toggleEventInfoOpen.bind(this);
    this.showToast = this.showToast.bind(this);
    this.state ={loaded:false, homePage:false,calendarIDs:"",show:false,eventInfoOpen:false,calendarObjects: [], signStatus:"", errorTimeoutOpen: false, autoDark:"true"};
    ApiCalendar.onLoad(() => {
        this.refreshWholeList();
        ApiCalendar.listenSign(this.signUpdate);
    });
    this.resetDisable = false;
    //this.courseColorsLight = ["#ef5350","#ab47bc","#5c6bc0","#29b6f6","#26a69a","#9ccc65","#ffee58","#ffa726","#8d6e63","#78909c"];
    //this.courseColorsDark = ["#b61827","#790e8b","#26418f","#0086c3","#00766c","#6b9b37","#c9bc1f","#c77800","#5f4339","#4b636e"];
    this.courseColorsLight = ["#ffcdd2","#e1bee7","#c5cae9","#b3e5fc","#b2dfdb","#dcedc8","#fff9c4","#ffe0b2","#d7ccc8","#cfd8dc"];
    this.courseColorsDark = ["#cb9ca1","#af8eb5","#9499b7","#82b3c9","#82ada9","#aabb97","#cbc693","#cbae82","#a69b97","#9ea7aa"];
    this.googleCalendarColors = ["#039be5","#7986cb","#33b679","#8e24aa","#e67c73","#f6c026","#f5511d","#039be5","#616161","#3f51b5","#0b8043","#d60000"]
  }

  darkModeFunction(){
    //Dark mode colors
    var currentHours = new Date().getHours();
    if((getSettingsValue("autoDark") && (currentHours > 19 || currentHours < 7)) || (!getSettingsValue("autoDark") && getSettingsValue("darkMode"))){
      document.documentElement.style.setProperty('--background', "#121212");
      document.documentElement.style.setProperty('--background-settings', "#141414");
      document.documentElement.style.setProperty('--font-color', "#eeeeee");
      document.documentElement.style.setProperty('--highlight', "#9e9e9e25");
      document.documentElement.style.setProperty('--highlight2', "#66666623");
      document.documentElement.style.setProperty('--highlight3', "#303030");
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
      document.documentElement.style.setProperty('--highlight3', "#dbdbdb");
      document.documentElement.style.setProperty('--highlight-tabs', "#3838381f");
      document.documentElement.style.setProperty('--accent', "#64b5f6");
      document.documentElement.style.setProperty('--brightnessIcon', "0");
      this.courseColors = this.courseColorsLight;
    }
  }
  
  async loadSettings(){
    global.settings = settingsOptions;
    for(var i = 0; i<settingsOptions.length; i++){
      if(global.settings[i]["type"]==="textDouble"||global.settings[i]["type"]==="textColour"){
        global.settings[i]["currentValue1"] = await getStorage(settingsOptions[i]["keyName1"],settingsOptions[i]["defaultValue1"]);
        global.settings[i]["currentValue2"] = await getStorage(settingsOptions[i]["keyName2"],settingsOptions[i]["defaultValue2"]);
      } else {
        global.settings[i]["currentValue"] = await getStorage(settingsOptions[i]["keyName"],settingsOptions[i]["defaultValue"]);
      }
    }
  }

  async loadSyncData(){
    var lastSort = await getStorage("lastSort","sortName,sortCourse,sortCheck,sortDate");
    var lastSignIn = await getStorage("lastSignIn","0");
    await this.loadSettings();
    return({ 
      signStatus: ApiCalendar.sign,
      lastSignIn:lastSignIn,
      lastSort:lastSort,
      calendarIDs: [getSettingsValue("calendarID"),getSettingsValue("calendarID2"),getSettingsValue("calendarID3")],
      loaded: true,
    })
  }
  signUpdate() {
    this.setState({ signStatus: ApiCalendar.sign, currentlyLoggingIn:false});
    this.refreshWholeList();
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

  googleLogin = (signIn)=>{
    if (signIn) {
      ApiCalendar.handleAuthClick();
      this.setState({currentlyLoggingIn:true})
    } else {
      ApiCalendar.handleSignoutClick();
    }
  }
      
  handleItemClick(event: SyntheticEvent<any>, name: string, calendarObjects: string): void {
    if (name === 'signIn') {
      this.googleLogin(true);
    } else if (name === 'signOut') {
      this.googleLogin(false);
    } else if (name==='log'){
      if (ApiCalendar.sign)
      listEvents(10,getSettingsValue("hoursBefore"))
        .then(({result}: any) => {
          console.log(result.items);
      });
    } else if (name==='logStored'){
      console.log(this.state.calendarObjects)
    } else if (name==="changeName") {
      if (ApiCalendar.sign) 
        listEvents(1,getSettingsValue("hoursBefore"))
        .then(({result}: any) => {
          const event = {
            summary: "✔️" + result.items[0].summary
          };
          ApiCalendar.updateEvent(event, result.items[0].id)
            .then(console.log);
      });
    } else if (name==='populate'){
      if (ApiCalendar.sign)
        listEvents(getSettingsValue("numEvents"),getSettingsValue("hoursBefore"))
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
  
  calendarAction(task, action){
    if (ApiCalendar.sign){
      if(action==="check"){
        this.updateDone(task.id);
      } else if (action==="pin") {
        this.updatePin(task.id);
      }
    } else {
      this.errorTimeoutOpen("Error 401/404");
    }
  }

  updateDone(id){
    for (var i = 0; i < this.state.calendarObjects.length; i++) {
      if(this.state.calendarObjects[i].id === id){
        if(this.state.calendarObjects[i].done===true){
          const event = {summary: this.state.calendarObjects[i].name};
          ApiCalendar.setCalendar(this.state.calendarObjects[i].calendarID);
          ApiCalendar.updateEvent(event, id).then(
            this.state.calendarObjects[i].done=false,
            this.setState({
              calendarObjects: this.state.calendarObjects
            })
          ).catch((error: any) => {
            this.errorTimeoutOpen("Error 401/404")
          });
        } else {
          const event = {summary: "✔️" + this.state.calendarObjects[i].name};
          ApiCalendar.setCalendar(this.state.calendarObjects[i].calendarID);
          ApiCalendar.updateEvent(event, id).then(
            this.state.calendarObjects[i].done=true,
            this.state.calendarObjects[i].pin=false,
            this.setState({
              calendarObjects: sortPin(this.state.calendarObjects)
            })
          ).catch((error: any) => {
            this.errorTimeoutOpen("Error 401/404")
          });
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
          const event = {summary: this.state.calendarObjects[i].name};
          ApiCalendar.setCalendar(this.state.calendarObjects[i].calendarID);
          ApiCalendar.updateEvent(event, id).then(
            this.state.calendarObjects[i].pin=false,
            this.setState({
              calendarObjects: sortPin(this.state.calendarObjects)
            })
          ).catch((error: any) => {
            this.errorTimeoutOpen("Error 401/404")
          });
        } else {
          //Can't pin item already checked off
          if(this.state.calendarObjects[i].done===true){
            return;
          }
          const event = {summary: "📌" + this.state.calendarObjects[i].name};
          ApiCalendar.setCalendar(this.state.calendarObjects[i].calendarID);
          ApiCalendar.updateEvent(event, id).then(
            this.state.calendarObjects[i].pin=true,
            this.setState({
              calendarObjects: sortPin(this.state.calendarObjects)
            })
          ).catch((error: any) => {
            this.errorTimeoutOpen("Error 401/404")
          });
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

  async getEventObjects(calendarIDsPassed){
    global.courses = [];
    this.setState({invalidID: false});
    var calendarObjectsTotal = [];
    if(calendarIDsPassed===undefined||calendarIDsPassed===""){
      return;
    }
    for(var z = 0; z < calendarIDsPassed.length; z++){
      var calendarIDPassed = "";
      if(z!==0 && (calendarIDsPassed[z]==="" || calendarIDsPassed[z]===undefined)){
        continue;
      } else if (z===0 && (calendarIDsPassed[0]==="" || calendarIDsPassed[0]===undefined)){
        calendarIDPassed = "primary";
      } else {
        calendarIDPassed = calendarIDsPassed[z];
      }
      ApiCalendar.setCalendar(calendarIDPassed);
      await listEvents(getSettingsValue("numEvents"),getSettingsValue("hoursBefore")).then(async ({result}: any) => {
        var calendarObjectsReduced = [];
        var calendarObjects = result.items;
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
            if(new Date(calendarObjects[i].end.date)>new Date().addDays(-1*(getSettingsValue("hoursBefore")+24)/24)){
              allDayPastTest=true;
            }
          } else {
            allDayPastTest=true;
          }
          if(allDayPastTest){
            //Set up attributes of each object
            if(dateObj < new Date().addDays(parseInt(getSettingsValue("nextWeekShow")))){
              calendarObjects[i].weekLimitHide=false;
            } else {
              calendarObjects[i].weekLimitHide=true;
            }
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
            var currentCourse = determineTaskCourse(calendarObjects[i].summary);
            if (getSettingsValue("useEventColours")===true && calendarObjects[i].colorId!==undefined){
              calendarObjects[i].courseColor = this.googleCalendarColors[calendarObjects[i].colorId];
              calendarObjects[i].courseRandomCode = -1;
              if(currentCourse !== ""){
                calendarObjects[i].course=currentCourse;
              } else {
                calendarObjects[i].course="";
              }
            } else if(currentCourse !==""){
              calendarObjects[i].course=currentCourse;
              if(!global.courses.includes(calendarObjects[i].course)){
                global.courses.push(calendarObjects[i].course)
              }
              var selectedColor = await getStorage("courseColor"+calendarObjects[i].course,"")
              if(selectedColor!==""){
                calendarObjects[i].courseColor=selectedColor;
              } else {
                if(calendarObjects[i].course.length>6){
                  courseRandomCode=calendarObjects[i].course.charCodeAt(0)+calendarObjects[i].course.charCodeAt(1)+calendarObjects[i].course.charCodeAt(2)+calendarObjects[i].course.charCodeAt(3)+calendarObjects[i].course.charCodeAt(4)+calendarObjects[i].course.charCodeAt(5)+calendarObjects[i].course.charCodeAt(6);
                } else {
                  courseRandomCode=calendarObjects[i].course.charCodeAt(0)+calendarObjects[i].course.charCodeAt(1)+calendarObjects[i].course.charCodeAt(2)+calendarObjects[i].course.charCodeAt(3)+calendarObjects[i].course.charCodeAt(4)+calendarObjects[i].course.charCodeAt(5);
                }
                calendarObjects[i].courseColor=this.courseColors[courseRandomCode%this.courseColors.length];
              }
            } else if(getSettingsValue("calendarIDColor"+(z+1).toString())!==undefined) {
              calendarObjects[i].courseColor=getSettingsValue("calendarIDColor"+(z+1).toString());
              calendarObjects[i].course = "";
              calendarObjects[i].courseRandomCode = -1;
            } else {
              calendarObjects[i].course = "";
              calendarObjects[i].courseRandomCode = -1;
              calendarObjects[i].courseColor="";
            }
            if(getSettingsValue("importantEvents")!==""&&getSettingsValue("importantEvents").split(",").length>0){
              try{
                calendarObjects[i].important = false;
                if(calendarObjects[i].name===undefined){
                  calendarObjects[i].name="(No title)"
                }
                for(var x=0; x<getSettingsValue("importantEvents").split(",").length;x++){
                  if (calendarObjects[i].name.toLowerCase().includes(getSettingsValue("importantEvents").split(",")[x].toLowerCase())||calendarObjects[i].course.toLowerCase().includes(getSettingsValue("importantEvents").split(",")[x].toLowerCase())){
                    calendarObjects[i].important = true;
                  }
                }
              }catch(e){
                this.showToast(e);
              }
            } else {
              calendarObjects[i].important = false;
            }
            if(getSettingsValue("hideEvents")!==""&&getSettingsValue("hideEvents").split(",").length>0){
              try{
                calendarObjects[i].hide = false;
                for(var y=0; y<getSettingsValue("hideEvents").split(",").length;y++){
                  if (calendarObjects[i].name.includes(getSettingsValue("hideEvents").split(",")[y])||calendarObjects[i].course.includes(getSettingsValue("hideEvents").split(",")[y])){
                    calendarObjects[i].hide = true;
                  }
                }
              }catch(e){
                this.showToast(e);
              }
            } else {
              calendarObjects[i].hide = false;
            }
            
            //else if(this.state.course2.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            //   calendarObjects[i].courseColor=this.state.courseColor2;
            // } else if(this.state.course3.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            //   calendarObjects[i].courseColor=this.state.courseColor3;
            // } else if(this.state.course4.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            //   calendarObjects[i].courseColor=this.state.courseColor4;
            // } else if(this.state.course5.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            //   calendarObjects[i].courseColor=this.state.courseColor5;
            // } else if(this.state.course6.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            //   calendarObjects[i].courseColor=this.state.courseColor6;
            // } else if(this.state.course7.toLowerCase()===calendarObjects[i].course.toLowerCase()){
            //   calendarObjects[i].courseColor=this.state.courseColor7;
            // }
            
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
        Array.prototype.push.apply(calendarObjectsTotal,calendarObjectsReduced); 
        var lastSortList = this.state.lastSort.split(",");
        lastSortList.map(function(sortElement){
          calendarObjectsTotal = this.sortCalendarObjects(sortElement, calendarObjectsTotal);
        }, this)
      }).catch(error => {
        this.setState({
          invalidID:true,
        });
      });
    }
    this.setState({
      calendarObjects: calendarObjectsTotal,
    });

    global.settingsColour = settingsOptionsColour();
    for(var i = 0; i<settingsOptionsColour().length; i++){
      global.settingsColour[i]["currentValue"] = await getStorage(settingsOptionsColour()[i]["keyName"],"");
    }
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
    var syncData = await this.loadSyncData();
    await this.darkModeFunction();
    if (ApiCalendar.sign){
      this.getEventObjects(syncData.calendarIDs);
    }
    this.setState(syncData);
  }

  toggleEventInfoOpen(open, eventInfoSelected){
    this.setState({
      eventInfoOpen:open,
      eventInfoSelected:eventInfoSelected
    })
  }

  showToast(showMessage){
    this.setState({showMessage:showMessage, show:true});
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
    } else if (this.state.invalidID===true && this.state.signStatus){
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
    if(this.state.homePage){
      return(<HomePage/>)
    } else if(this.state.loaded===false){
      return(<div className="loading"></div>)
    } else {
      return (
        <div className="screen fadeIn">
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
          <Tabs onSelect={(key)=>{AsyncStorage.setItem("lastTab",key.toString());}} style={{"marginTop":"1.9%","marginBottom":"3px"}} className="tabsLabel" defaultActiveKey={this.lastTab}>
              <Tab eventKey="1" title="Task List">
                <TaskList calendarAction={this.calendarAction} toggleEventInfoOpen={this.toggleEventInfoOpen} calendarObjects={this.state.calendarObjects} sortCalendarObjects={this.sortCalendarObjects}/>
              </Tab>
              <Tab eventKey="2" title="Week View">
                <WeekList calendarAction={this.calendarAction} currentTab={this.lastTab} toggleEventInfoOpen={this.toggleEventInfoOpen} calendarObjects={this.state.calendarObjects}/>
              </Tab>
              <Tab eventKey="3" title="Pomodoro">
                <Pomo calendarObjects={this.state.calendarObjects} loadSettings={this.loadSettings}/>
              </Tab>
              <Tab eventKey="4" title="Marks">
                <Marks showToast={this.showToast}/>
              </Tab>
          </Tabs>
          <Settings 
            resetCalendarObjects={this.resetCalendarObjects} 
            signStatus={this.state.signStatus} 
            showToast={this.showToast}
            googleLogin={this.googleLogin}
          />
          <Refresh signStatus={this.state.signStatus} resetCalendarObjects={this.resetCalendarObjects}/>
          <Toast onClose={() => this.setState({show: false})} show={this.state.show} delay={1500} autohide style={{"position":"fixed","bottom":"0%","left":"1%"}}>
            <Toast.Header>
              <strong className="mr-auto">{this.state.showMessage}</strong>
            </Toast.Header>
          </Toast>
          <div className="alert alert-danger fadeIn" role="alert" onClick={(e) => this.handleItemClick(e, 'signIn')} style={{"display":signStatusDisplay, "animationDelay":"600ms", "position":"fixed","bottom":"1%", "cursor":"pointer", "marginRight":"2.5%"}}>
            You are not logged-in. Login <u>here</u> or in the settings.
          </div>
          <div className="alert alert-warning fadeIn" role="alert" style={{"display":calendarObjectsLengthDisplay, "animationDelay":"2600ms", "position":"fixed","bottom":"1%", "marginRight":"2.5%"}}>
            There are no events for this calendar. Add some and refresh to view.
          </div>
          <div className="alert alert-warning fadeIn" role="alert" style={{"display":invalidCalendarDisplay, "animationDelay":"600ms", "position":"fixed","bottom":"1%", "marginRight":"2.5%"}}>
            It seems you are using an invalid calendar ID. Open settings and double check.
          </div>
          <TimeOutError errorTimeoutOpen={this.state.errorTimeoutOpen} errorCode={this.state.errorCode}/>
          <WelcomeMessage welcomeOpen={welcomeOpen} errorCode={this.state.errorCode} signStatus={this.state.signStatus} googleLogin={this.googleLogin}/>
          <LoginGuideMessage show={this.state.currentlyLoggingIn} onClose={()=>this.setState({currentlyLoggingIn:false})}/>
          <EventInfoMessage eventInfoSelected={this.state.eventInfoSelected} toggleEventInfoOpen={this.toggleEventInfoOpen} eventInfoOpen={this.state.eventInfoOpen}/>
          {/* <AddEvent resetCalendarObjects={this.resetCalendarObjects}/> */}
        </div>
      );
    }
    
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