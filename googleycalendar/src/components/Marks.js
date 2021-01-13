import React from 'react';
import Form from 'react-bootstrap/Form'
import '../App.css';
import { AsyncStorage } from 'AsyncStorage';
import {getStorage} from "../functions/DataFunctions";
import Button from 'react-bootstrap/Button'
import CountUp from 'react-countup';

export default class Marks extends React.Component{
  render(){
    if(global.courses===undefined){
      global.courses=[];
    }
    return(
      <div className="marks-content" style={{paddingBottom:"100px"}}>
        {global.courses.map( (course, index)=>
          {return <MarksCourse course={course}/>}
        )}
      </div>
    )
  }
}

class MarksCourse extends React.Component{
  constructor(props) {
    super(props);
    this.handleGoalChange = this.handleGoalChange.bind(this);
    this.handleDataChange = this.handleDataChange.bind(this);
  }
  async componentDidMount() {
    this.setState({
      currentCourseEntries: JSON.parse(await getStorage("courseMarks"+this.props.course,'[["","",""]]')),
      goal: await getStorage("courseGoal"+this.props.course,"70"),
      examMark: await getStorage("courseExamMark"+this.props.course,"70"),
    })
  }
  handleGoalChange(form, key,) {
    AsyncStorage.setItem(key, form.target.value);
    this.setState({
      goal:form.target.value,
    })
  }
  handleExamMarkChange(form, key,) {
    AsyncStorage.setItem(key, form.target.value);
    this.setState({
      examMark:form.target.value,
    })
  }
  handleDataChange(index1,index2,value) {
    var tempData = this.state.currentCourseEntries;
    tempData[index1][index2]=value;
    this.setState({
      currentCourseEntries: tempData
    })
    AsyncStorage.setItem("courseMarks"+this.props.course, JSON.stringify(tempData));
  }
  addEntry(){
    var tempData = this.state.currentCourseEntries;
    tempData.push(["","",""]);
    this.setState({
      currentCourseEntries: tempData
    })
  }
  removeEntry(){
    var tempData = this.state.currentCourseEntries;
    tempData.pop();
    this.setState({
      currentCourseEntries: tempData
    })
  }
  render(){
    if(this.state===undefined || this.state===null){
      return(<div/>)
    }

    var examPercentage = 100;
    var totalCurrentMark = 0;
    var totalPercentageSubmitted = 0;
    var required = 0;
    var finalMark = 0;
    var currentWeight;
    var currentMark;

    var fail = false;
    for(var x = 0; x<this.state.currentCourseEntries.length; x++){
      currentWeight = this.state.currentCourseEntries[x][1];
      currentMark = this.state.currentCourseEntries[x][2];
      fail = true;
      if(/^\d+$/.test(currentWeight) && /^\d+$/.test(currentMark )){
        fail = false;
      } else {
        break;
      }
    }
    if(!fail){
      for(var x = 0; x<this.state.currentCourseEntries.length; x++){
        currentWeight = this.state.currentCourseEntries[x][1];
        currentMark = this.state.currentCourseEntries[x][2];
        if(currentWeight!==""){
          examPercentage = examPercentage - parseFloat(this.state.currentCourseEntries[x][1]);
        }
        if(currentWeight!=="" && currentMark!==""){
          totalPercentageSubmitted = totalPercentageSubmitted + parseFloat(this.state.currentCourseEntries[x][1]);
          totalCurrentMark = currentWeight/100 * currentMark + totalCurrentMark;
        }
      }
      if(totalPercentageSubmitted!==0){
        totalCurrentMark = totalCurrentMark*100 / totalPercentageSubmitted;
      }

      var goal = this.state.goal;
      if(this.state.goal===""){
        goal = 70;
      }
      if(Math.round(examPercentage)===0){
        required = 0;
      } else {
        required = ((parseFloat(goal) - totalCurrentMark * (1 - examPercentage/100)) / (examPercentage/100));
        required = Math.round((required + Number.EPSILON) * 100) / 100
      }
      
      finalMark = totalCurrentMark*(totalPercentageSubmitted/100) + this.state.examMark*(examPercentage/100)
      
      finalMark = Math.round((finalMark + Number.EPSILON) * 100) / 100
      totalCurrentMark = Math.round((totalCurrentMark + Number.EPSILON) * 100) / 100
      examPercentage = Math.round((examPercentage + Number.EPSILON) * 100) / 100
    }
    

    return(
      <Form style={{paddingTop: "30px"}}>
        <Form.Group>
          <div className="courseLabel">{this.props.course}</div>
          {this.state.currentCourseEntries.map( (entry, index)=>
            {return <MarksRow entry={entry} index={index} handleDataChange={this.handleDataChange}/>}
          )}
          <div style={{height:"5px"}}/>
          <Button variant="outline-info" onClick={()=>{this.addEntry()}}>
            Add assessment
          </Button>
          <Button variant="outline-secondary" onClick={()=>{this.removeEntry()}}>
            Remove assessment
          </Button>
          <table style={{maxWidth:"550px",width:"100%",}}>
          <tr>
            <th>
              <div style={{marginTop: "10px", flexDirection:"row",display: "flex"}}>
                <div className="markLabel">{"Exam:"}</div>
                <CountUp className="markLabelBold" start={0} end={examPercentage} duration={1} preserveValue redraw/>
                <div className="markLabelBold">%</div>
              </div>
            </th>
            <th>
              <div style={{marginTop: "10px", flexDirection:"row",display: "flex"}}>
                <div className="markLabel">{"Current:"}</div>
                <CountUp className="markLabelBold" start={0} end={totalCurrentMark} duration={1} preserveValue redraw/>
                <div className="markLabelBold">%</div>
              </div>
            </th>
          </tr>
          <tr>
            <th>
              <div style={{marginTop: "10px", flexDirection:"row",display: "flex", alignItems:"center"}}>
                <div className="markLabel">{"Goal:"}</div>
                <Form.Control maxLength={5} onChange={(form) => {this.handleGoalChange(form,"courseGoal"+this.props.course)}} placeholder={"70"} defaultValue={this.state.goal} style={{width:"55px", marginLeft:"5px",}}/>
                <div className="markLabel">{"%"}</div>
              </div>
            </th>
            <th>
              <div style={{marginTop: "10px", flexDirection:"row",display: "flex"}}>
                <div className="markLabel">{"Exam required:"}</div>
                <CountUp className="markLabelBold" start={0} end={required} duration={1} preserveValue redraw/>
                <div className="markLabelBold">%</div>
              </div>
            </th>
          </tr>
          <tr>
            <th>
              <div style={{marginTop: "10px", flexDirection:"row",display: "flex", alignItems:"center"}}>
                <div className="markLabel">{"Exam mark:"}</div>
                <Form.Control maxLength={5} onChange={(form) => {this.handleExamMarkChange(form,"courseExamMark"+this.props.course)}} placeholder={"70"} defaultValue={this.state.examMark} style={{width:"55px", marginLeft:"5px",}}/>
                <div className="markLabel">{"%"}</div>
              </div>
            </th>
            <th>
              <div style={{marginTop: "10px", flexDirection:"row",display: "flex"}}>
                <div className="markLabel">{"Final mark:"}</div>
                <CountUp className="markLabelBold" start={0} end={finalMark} duration={1} preserveValue redraw/>
                <div className="markLabelBold">%</div>
              </div>
            </th>
          </tr>
          </table>
        </Form.Group>
      </Form>
    )
  }
}

class MarksRow extends React.Component{
  render(){
    return(
      <>
        <div style={{flexDirection:"row",display: "flex"}}>
          <Form.Control onChange={(form) => {this.props.handleDataChange(this.props.index,0,form.target.value)}} placeholder={"Assessment name"} defaultValue={this.props.entry[0]} style={{maxWidth: "400px", width:"60%",}}/>
          <Form.Control maxLength={5} onChange={(form) => {this.props.handleDataChange(this.props.index,1,form.target.value)}} placeholder={"Worth (%)"} defaultValue={this.props.entry[1]} style={{maxWidth: "100px", width:"20%",}}/>
          <Form.Control maxLength={5} onChange={(form) => {this.props.handleDataChange(this.props.index,2,form.target.value)}} placeholder={"Mark (%)"} defaultValue={this.props.entry[2]} style={{maxWidth: "100px", width:"20%",}}/>
        </div>
        <div style={{height:"5px"}}/>
      </>
    )
  }
}