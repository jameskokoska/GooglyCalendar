import React from 'react';
import {getDisplayMonth, eventToday, getDisplayDayFull,} from "../functions/DateFunctions"
import ApiCalendar from 'react-google-calendar-api';
import pinIcon from "../assets/thumbtack-solid.svg";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import infoIcon from "../assets/info-circle-solid.svg"
import FlipMove from 'react-flip-move';
import {getSettingsValue} from "./Settings"
import {determineTaskName} from "../functions/DataFunctions"

export default class WeekList extends React.Component {
  constructor(props) {
    super(props);
    this.changeStart = this.changeStart.bind(this);
    this.state = {
      dateDisplayStart: this.firstDayOfWeek(new Date(), 0),
    }
  }

  firstDayOfWeek(dateObject, firstDayOfWeekIndex) {
    const dayOfWeek = dateObject.getDay();
    var firstDayOfWeek = new Date(dateObject);
    var diff = dayOfWeek >= firstDayOfWeekIndex ? dayOfWeek - firstDayOfWeekIndex : 6 - dayOfWeek;

    firstDayOfWeek.setDate(dateObject.getDate() - diff);
    firstDayOfWeek.setHours(0,0,0,0);

    return firstDayOfWeek;
  }

  //-1 decrease week, 1 increase week
  changeStart(difference){
    if(getSettingsValue("skipWeeks")){
      this.setState({dateDisplayStart: this.state.dateDisplayStart.addDays(7*difference)});
    } else {
      this.setState({dateDisplayStart: this.state.dateDisplayStart.addDays(difference)});
    }
  }


  componentDidMount(){
    document.addEventListener("keydown", this.handleKeyDown);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }
  handleKeyDown = (event) => {
    if(this.props.currentTab==="2"){
      if(event.keyCode===37){
        this.changeStart(-1)
      } else if (event.keyCode === 39){
        this.changeStart(1)
      }
    }
  }
  
  render() {
    return(
      <div className="week">
        <div className="weekTable">
        <div className="arrowPosition" style={{left:"1.5vw", position:"absolute",cursor:"pointer"}} onClick={()=>{this.changeStart(-1)}} >
          <div className="arrowDay left" />
        </div>
        <div className="arrowPosition" style={{right: "1.5vw", position:"absolute",cursor:"pointer"}} onClick={()=>{this.changeStart(1)}} >
          <div className="arrowDay right"/>
        </div>
          <table className="weekList">
            <tbody>
              <tr>
                <WeekListHeader dateDisplayStart={this.state.dateDisplayStart}/>
              </tr>
              <tr>
                <DayList calendarAction={this.props.calendarAction} toggleEventInfoOpen={this.props.toggleEventInfoOpen} dateDisplayStart={this.state.dateDisplayStart} calendarObjects={this.props.calendarObjects}/>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
function WeekListHeader(props){
  var weekHeaders = [];
  var numDays = 7;
  for (var i = 0; i < numDays; i++) {
    if(props.dateDisplayStart.addDays(i).getDate()===(new Date()).getDate() && props.dateDisplayStart.addDays(i).getMonth()===(new Date()).getMonth() && props.dateDisplayStart.addDays(i).getYear()===(new Date()).getYear()){
      weekHeaders.push( <th key={i} className="weekday header3 fadeIn" style={{backgroundColor:"#5862bd57"}}>Today</th> )
    } else {
      weekHeaders.push( <th key={i} className="weekday header3 fadeIn">
        <div style={{fontSize: "17px", marginBottom: "-5px"}}>
          {getDisplayDayFull(props.dateDisplayStart.addDays(i))}
        </div>
        <div style={{fontSize: "22px"}}>
          {getDisplayMonth(props.dateDisplayStart.addDays(i)) + " " + props.dateDisplayStart.addDays(i).getDate()}
        </div>
      </th> )
    }
    
  }
  return weekHeaders;
}

function DayList(props){
  var dayListEntries = [];
  var numDays = 7;
  for (var i = 0; i < numDays; i++) {
    dayListEntries.push( 
      <td className="fadeIn" key={i}>
        <DayListEntry calendarAction={props.calendarAction} toggleEventInfoOpen={props.toggleEventInfoOpen} dateDisplayStart={props.dateDisplayStart} key={i} calendarObjects={props.calendarObjects} dayOffset={i} />
      </td> 
    )
  }
  return dayListEntries;
}

class DayEntry extends React.Component{
  constructor(props) {
    super(props);
  }
  
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
    if(this.props.task.pin===true){
      pinClass+=" pinInWeek"
    } else {
      pinClass+=" pinOutWeek"
    }
    var dayStyle;
    if(getSettingsValue("useEventColours")){
      if(!getSettingsValue("darkMode"))
        dayStyle = {backgroundColor:this.props.task.courseColor+"90"};
      else
        dayStyle = {backgroundColor:this.props.task.courseColor+"B0"};
    }

    var weekEntryClass="weekEntry";
    var weekEntryOpacity="1";
    if(this.props.task.done===true){
      weekEntryClass=weekEntryClass+" weekEntryDone";
      weekEntryOpacity="0.5";
      if(getSettingsValue("useEventColours")){
        if(!getSettingsValue("darkMode"))
          dayStyle = {backgroundColor:this.props.task.courseColor+"50"};
        else
          dayStyle = {backgroundColor:this.props.task.courseColor+"50"};
      }
    }

    return(
      <div className={weekEntryClass} style={dayStyle}>
        <div onClick={() => this.props.calendarAction(this.props.task, "check")} className="weekEventLabel" style={{"opacity":weekEntryOpacity, "color":this.props.checkColor, "textDecoration":this.props.textStyle, "transition":"all 0.5s"}}>{determineTaskName(this.props.task.name)}</div>
        <div onClick={() => this.props.calendarAction(this.props.task, "check")} className="weekTimeLabel" style={{"marginRight":weekTimeLabelMargin+"px","opacity":weekEntryOpacity, "transition":"all 0.5s"}}>{this.props.task.timeStart+this.props.displayTimeEnd}</div>
        <div className="courseBubble" style={{"display":this.props.courseDisplay}}><span style={{"backgroundColor":this.props.task.courseColor}}>{this.props.task.course}</span></div>
        <div className="iconBoxWeek fadeIn" style={{"right":iconBoxWeekRight,"bottom":iconBoxWeekBottom}}>
          <img onClick={() => this.props.calendarAction(this.props.task, "pin")} alt="pin" className={pinClass} src={pinIcon} style={{"display":this.props.pinDisplay}}/>
            <OverlayTrigger placement={"bottom"} overlay={<Tooltip><div dangerouslySetInnerHTML={{ __html: this.props.description }}></div></Tooltip>}>
              <img onClick={()=>{this.props.toggleEventInfoOpen(true,this.props.task);}} alt="descriptions" className="infoIconWeek" src={infoIcon} style={{"display":this.props.descriptionDisplay, "opacity":weekEntryOpacity}}/>
            </OverlayTrigger>
        </div>
      </div> 
    )
      
  }
}

class DayListEntry extends React.Component{
  
  render(){
    return(
      <FlipMove staggerDurationBy={2} easing={"ease"} duration={700} staggerDelayBy={getSettingsValue("enableAnimations")===true?55:0} leaveAnimation="none" enterAnimation={getSettingsValue("enableAnimations")===true?"elevator":"fade"}>
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
          var checkColor="";
          if(task.done===true){
            textStyle = "line-through";
          }
          if(task.important===true&&getSettingsValue("darkMode")===true&&task.done===false){
            checkColor="#ff8b8b"
          } else if (task.important===true&&getSettingsValue("darkMode")===false&&task.done===false){
            checkColor="#C85000"
          }
          if(task.hide===false&&(eventToday(new Date(task.start.dateTime),this.props.dateDisplayStart.addDays(this.props.dayOffset))||eventToday(new Date(task.end.date),this.props.dateDisplayStart.addDays(this.props.dayOffset)))){
            return(
              <DayEntry
                key={task.id}
                toggleEventInfoOpen={this.props.toggleEventInfoOpen}
                task={task}
                calendarAction={this.props.calendarAction}
                checkColor={checkColor}
                textStyle={textStyle}
                displayTimeEnd={displayTimeEnd}
                courseDisplay={courseDisplay}
                descriptionDisplay={descriptionDisplay}
                description={task.description}
                pinDisplay={pinDisplay}
              />
            )
          }
        }, this)}
      </FlipMove>
    )
  }
}
