import React from 'react';
import { AsyncStorage } from 'AsyncStorage';
import ButtonStyle from "./ButtonStyle"
import Button from 'react-bootstrap/Button'
import CountUp from 'react-countup';
import {getSettingsValue} from "./Settings"
import {getStorage} from "../functions/DataFunctions"


export default class Pomo extends React.Component{
  constructor(props) {
    super(props);
    this.state = {currentSeconds: 0, paused: true, work: true};
    this.workMessages = ["Go get some work done!", "You got this!", "Keep going at it!", "Hard work pays off.",":)","You can do it!","Work smart, get things done.","Work now, party later.","Don't be distracted.", "Be productive.","Don't waste time.","Focus.","Keep going!","Keep pushing."];
    this.chosenWorkMessage = this.workMessages[Math.floor(Math.random() * this.workMessages.length)];
    this.audio = new Audio(require("../assets/ding.m4a"));
    this.addPomoTotalSec=0;
  }
  playSound(){
    if(this.state.pomoSound===true && this.state.currentSeconds === 0){
      this.audio.play();
    }
  }
  addTotalTime(){
    if(this.state.work===true){
      this.addPomoTotalSec=parseInt(this.addPomoTotalSec)+parseInt(this.state.workSeconds)+parseInt(this.state.workMinutes*60);
      AsyncStorage.setItem('pomoTotalSec', this.addPomoTotalSec);
    }
  }
  async componentDidMount(){
    this.getAsyncStorage();
  }
  async getAsyncStorage(){
    await this.props.loadSettings();
    this.addPomoTotalSec = await getStorage("pomoTotalSec",0);
    if(this.addPomoTotalSec===undefined){
      this.addPomoTotalSec = 0;
    }
    this.setState({ 
      workSeconds:getSettingsValue("workSeconds"),
      breakSeconds:getSettingsValue("breakSeconds"),
      workMinutes:getSettingsValue("workMinutes"),
      breakMinutes:getSettingsValue("breakMinutes"),
      pomoSound:getSettingsValue("pomoSound"),
      currentSeconds:parseInt(getSettingsValue("workSeconds"))+parseInt(getSettingsValue("workMinutes")*60),
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
    } else if (name==="startWork"){
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
