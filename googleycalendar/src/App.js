import React, {ReactNode, SyntheticEvent} from 'react';
import { AsyncStorage } from 'AsyncStorage';
import ApiCalendar from 'react-google-calendar-api';
import './App.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.state ={calendarObjects: ""};
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


  handleChange(event) {
    if(event.target.name=="calendarID"){
      AsyncStorage.setItem('calendarIDKey', event.target.value); // Note: persist input
      if(event.target.value!=""){
        ApiCalendar.setCalendar(event.target.value)
      }
    } else if(event.target.name=="numEvents"){
      AsyncStorage.setItem('numEventsKey', event.target.value); // Note: persist input
      if(event.target.value!=""){
        ApiCalendar.setCalendar(event.target.value)
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
  
  render(): ReactNode {
    return (
      <div className="screen">
        <input
          name="calendarID"
          onChange={this.handleChange}
          defaultValue={this.state.calendarID}
        />
        <input
          name="numEvents"
          onChange={this.handleChange}
          defaultValue={this.state.numEvents}
        />
        <div onClick={(e) => this.handleItemClick(e, "signIn")}>
          <ButtonStyle label="Login"/>
        </div>
        <div onClick={(e) => this.handleItemClick(e, "signOut")}>
          <ButtonStyle label="Logout"/>
        </div>
        <button
            onClick={(e) => this.handleItemClick(e, 'sign-in')}
        >
          sign-in
        </button>
        <button
            onClick={(e) => this.handleItemClick(e, 'sign-out')}
        >
          sign-out
        </button>
        <button
            onClick={(e) => this.handleItemClick(e, 'log')}
        >
          log
        </button>
        <button
            onClick={(e) => this.handleItemClick(e, 'changeName')}
        >
          changename
        </button>
        <button
            onClick={(e) => this.handleItemClick(e, 'populate')}
        >
          populate
        </button>
        <div></div>
        <TaskList calendarObjects={this.state.calendarObjects}/>
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
      checkColor="#424242";
      clickActionCheck="uncheckOff";
    }
    return(
      <tr className="taskEntry">
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