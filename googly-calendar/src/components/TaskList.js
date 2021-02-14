import React from 'react';
import pinIcon from "../assets/thumbtack-solid.svg";
import checkIcon from "../assets/check-solid.svg"
import FlipMove from 'react-flip-move';
import ApiCalendar from 'react-google-calendar-api';
import {eventToday,} from "../functions/DateFunctions"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import infoIcon from "../assets/info-circle-solid.svg"
import '../App.css';
import {getSettingsValue} from "./Settings"

export default class TaskList extends React.Component {
  render() {
    return(
      <div className="tasks">
        <TaskTable calendarAction={this.props.calendarAction} toggleEventInfoOpen={this.props.toggleEventInfoOpen} calendarObjects={this.props.calendarObjects} sortCalendarObjects={this.props.sortCalendarObjects}/>
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
              <th className="check header3" onClick={() => this.props.sortCalendarObjects("sortCheck", this.props.calendarObjects)}><div className="hoverSort checkHeader"><img alt="check" src={checkIcon}/></div></th>
              <th className="task header3" onClick={() => this.props.sortCalendarObjects("sortName", this.props.calendarObjects)}><div className="hoverSort">Task</div></th>
              <th className="date header3" onClick={() => this.props.sortCalendarObjects("sortDate", this.props.calendarObjects)}><div className="hoverSort">Date</div></th>
              <th className="time header3" onClick={() => this.props.sortCalendarObjects("sortDate", this.props.calendarObjects)}><div className="hoverSort">Time</div></th>
              <th className="course header3" onClick={() => this.props.sortCalendarObjects("sortCourse", this.props.calendarObjects)}><div className="hoverSort">Course</div></th>
            </tr>
          </thead>
          <FlipMove staggerDurationBy={getSettingsValue("enableAnimations")===true?25:0} className="fadeIn" typeName="tbody" easing={"ease"} duration={700} leaveAnimation="none" staggerDelayBy={0} enterAnimation="fade">
            {this.props.calendarObjects.map(function(task){
              if(task.hide===false && task.weekLimitHide===false){
                return(<TaskEntry
                key={task.id}
                calendarAction={this.props.calendarAction}
                toggleEventInfoOpen={this.props.toggleEventInfoOpen}
                task={task}
                errorTimeoutOpen={this.props.errorTimeoutOpen}
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
  render(){
    var textStyle="none";
    var checkClass="checkImg";
    var pinClass="pinImg";
    var checkColor="";
    var clickActionCheck="checkOff";
    var checkMarkBG="#64b5f6";
    var courseClass="course";
    var pinDisplay="pin";
    if(this.props.task.done===true){
      textStyle = "line-through";
      checkClass+=" checkIn";
      checkColor="#777777";
      clickActionCheck="uncheckOff";
      pinDisplay+=" pinNone";
    } else {
      checkClass+=" checkOut";
    }

    if(this.props.task.pin===true){
      pinClass+=" pinIn"
    } else {
      pinClass+=" pinOut"
    }

    if(this.props.task.courseColor!==""){
      checkMarkBG=this.props.task.courseColor;
      courseClass="course";
    } else {
      checkMarkBG="#64b5f6";
    }

    if(this.props.task.course===""){
      courseClass+=" courseNone";
    }

    var descriptionDisplay="none";
    var marginNameFix="";
    if(this.props.task.description!==undefined&&this.props.task.description!==null){
      descriptionDisplay="";
      marginNameFix="marginNameFix"
    }
    
    var dateColor;
    var dateFontWeight;
    if (this.props.task.timeEnd==="All day" && eventToday(this.props.task.dateObjEnd)===true){
      dateColor="";
      dateFontWeight="unset";
    } else if(this.props.task.dateObjEnd < Date.now()){
      dateColor="#c53f3f";
      dateFontWeight="bold";
    } else {
      dateColor="";
      dateFontWeight="unset";
    }

    var displayTimeEnd;
    if(this.props.task.timeEnd==="All day"){
      displayTimeEnd="";
    } else {
      displayTimeEnd=" - "+this.props.task.timeEnd;
    }

    if(this.props.task.important===true&&getSettingsValue("darkMode")===true&&this.props.task.done===false){
      checkColor="#ff8b8b"
    } else if (this.props.task.important===true&&getSettingsValue("darkMode")===false&&this.props.task.done===false){
      checkColor="#C85000"
    }
    return(
      <tr className="taskEntry">
        <td className={pinDisplay} onClick={()=>this.props.calendarAction(this.props.task, "pin")}><div className="fadeIn"><img alt="check" className={pinClass} src={pinIcon}/></div></td>
        <td style={{"backgroundColor":checkMarkBG}} className="check" onClick={()=>this.props.calendarAction(this.props.task, "check")}><div className="fadeIn"><img alt="check" className={checkClass} src={checkIcon}/></div></td>
        <td className="task" style={{"color":checkColor, "transition":"all 0.5s", "position":"relative"}}>
          <div className={marginNameFix} style={{"textDecoration":textStyle}}>{this.props.task.name}</div>
          <OverlayTrigger placement={"bottom"} overlay={<Tooltip><div dangerouslySetInnerHTML={{ __html: this.props.task.description }}></div></Tooltip>}>
            <img onClick={()=>{this.props.toggleEventInfoOpen(true,this.props.task);}} alt="descriptions" className="infoIcon" src={infoIcon} style={{"display":descriptionDisplay}}/>
          </OverlayTrigger>
        </td>
        <td className="date" style={{color:dateColor,fontWeight:dateFontWeight}}>{this.props.task.date}</td>
        <td className="time">{this.props.task.timeStart}{displayTimeEnd}</td>
        <td className={courseClass}>{this.props.task.course}</td>
      </tr>
    )
  }
}