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
              <th className="check header3" onClick={e => this.props.sortCalendarObjects("sortCheck", this.props.calendarObjects)}><div className="hoverSort checkHeader"><img alt="check" src={checkIcon}/></div></th>
              <th className="task header3" onClick={e => this.props.sortCalendarObjects("sortName", this.props.calendarObjects)}><div className="hoverSort">Task</div></th>
              <th className="date header3" onClick={e => this.props.sortCalendarObjects("sortDate", this.props.calendarObjects)}><div className="hoverSort">Date</div></th>
              <th className="time header3" onClick={e => this.props.sortCalendarObjects("sortDate", this.props.calendarObjects)}><div className="hoverSort">Time</div></th>
              <th className="course header3" onClick={e => this.props.sortCalendarObjects("sortCourse", this.props.calendarObjects)}><div className="hoverSort">Course</div></th>
            </tr>
          </thead>
          <FlipMove className="fadeIn" typeName="tbody" staggerDelayBy={5} staggerDurationBy={2} easing={"ease"} duration={700} leaveAnimation="none" staggerDelayBy={getSettingsValue("enableAnimations")===true?35:0} enterAnimation="fade">
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
    if(this.props.calendarIDCurrent==="")
      ApiCalendar.setCalendar("primary")
    else 
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