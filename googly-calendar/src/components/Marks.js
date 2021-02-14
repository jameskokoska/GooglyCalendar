import React from 'react';
import Form from 'react-bootstrap/Form'
import '../App.css';
import { AsyncStorage } from 'AsyncStorage';
import {getStorage} from "../functions/DataFunctions";
import Button from 'react-bootstrap/Button'
import CountUp from 'react-countup';

export default class Marks extends React.Component{
  constructor(props) {
    super(props);
    this.handleAddCourseInput = this.handleAddCourseInput.bind(this);
    this.handleAddCourse = this.handleAddCourse.bind(this);
    this.handleRemoveCourse = this.handleRemoveCourse.bind(this);
  }
  async componentDidMount() {
    // await AsyncStorage.setItem("coursesExtra","[]")
    this.setState({
      coursesExtra: JSON.parse(await getStorage("coursesExtra","[]")),
    })
  }
  handleAddCourseInput(value){
    this.setState({
      addCourseName: value,
    })
  }
  handleAddCourse() {
    var tempData = this.state.coursesExtra;
    if(global.courses.includes(this.state.addCourseName) || tempData.includes(this.state.addCourseName)){
      this.props.showToast(this.state.addCourseName+" already exists.")
      return; //course already added automatically
    } else if(this.state.addCourseName==="" || this.state.addCourseName===undefined){
      this.props.showToast("Add a name for the course.")
      return; //course already added automatically
    } else {
      tempData.push(this.state.addCourseName);
      AsyncStorage.setItem("coursesExtra", JSON.stringify(tempData));
      this.setState({
        coursesExtra: tempData,
      })
      this.props.showToast(this.state.addCourseName+" course  added.")
      //update again
      setTimeout(()=>{
        this.setState({
          coursesExtra: tempData,
        })
      }, 100);
    }
  }
  handleRemoveCourse(course="") {
    var tempData = this.state.coursesExtra;
    if(course==="")
      tempData = tempData.filter(e => e !== this.state.addCourseName);
    else
      tempData = tempData.filter(e => e !== course);
    this.setState({
      coursesExtra: tempData
    })
    AsyncStorage.setItem("coursesExtra", JSON.stringify(tempData));
  }
  render(){
    if(this.state===undefined || this.state===null){
      return(<div/>)
    }
    var coursesTotal;
    if(global.courses===undefined){
      global.courses=[];
      coursesTotal=[];
    } else {
      coursesTotal = global.courses.slice(0);
      Array.prototype.push.apply(coursesTotal,this.state.coursesExtra); 
      coursesTotal = [...new Set(coursesTotal)] //remove any duplicates that may come up if it was added before
      coursesTotal.sort();
    }
    return(
      <div className="marks-content" style={{paddingBottom:"100px"}}>
        <div style={{marginTop: "10px", flexDirection:"row",display: "flex"}}>
          <Form.Control maxLength={50} onChange={(form) => {this.handleAddCourseInput(form.target.value)}} placeholder={"Course name"} defaultValue={""} style={{maxWidth:"490px", width: "60%"}}/>
          <Button variant="outline-info" onClick={()=>{this.handleAddCourse()}}>
            Add course
          </Button>
        </div>
        {coursesTotal.map( (course, index)=>
          {return <MarksCourse 
            key={index.toString()}
            course={course} 
            coursesExtra={this.state.coursesExtra} 
            handleRemoveCourse={this.handleRemoveCourse}
          />}
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
  async componentDidUpdate(prevProps) {
    if(prevProps!==this.props)
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
    if(index2!==0){
      this.setState({
        currentCourseEntries: tempData
      })
    }
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
      if((/^\d+$/.test(currentWeight) || currentWeight === "" )&& (/^\d+$/.test(currentMark ) || currentMark === "")){
        fail = false;
      } else {
        break;
      }
    }
    if(!fail){
      for(var i = 0; i<this.state.currentCourseEntries.length; i++){
        currentWeight = this.state.currentCourseEntries[i][1];
        currentMark = this.state.currentCourseEntries[i][2];
        if(currentWeight!==""){
          examPercentage = examPercentage - parseFloat(this.state.currentCourseEntries[i][1]);
        }
        if(currentWeight!=="" && currentMark!==""){
          totalPercentageSubmitted = totalPercentageSubmitted + parseFloat(this.state.currentCourseEntries[i][1]);
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
    
    var extraCourseButton = <div/>
    if(this.props.coursesExtra.includes(this.props.course)){
      extraCourseButton = <Button variant="outline-danger" onClick={()=>{this.props.handleRemoveCourse(this.props.course);}}>
        Remove course
      </Button>
    }
    return(
      <Form style={{paddingTop: "30px"}}>
        <Form.Group>
          <div className="courseLabel">{this.props.course}</div>
          {this.state.currentCourseEntries.map( (entry, index)=>
            {return <MarksRow key={entry[0]+index.toString()} entry={entry} index={index} handleDataChange={this.handleDataChange}/>}
          )}
          <div style={{height:"5px"}}/>
          <Button style={{marginRight:"5px"}} variant="outline-info" onClick={()=>{this.addEntry()}}>
            Add assessment
          </Button>
          <Button style={{marginRight:"5px"}} variant="outline-secondary" onClick={()=>{this.removeEntry()}}>
            Remove assessment
          </Button>
          {extraCourseButton}
          <table style={{maxWidth:"550px",width:"100%",}}>
          <tbody>
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
                <Form.Control maxLength={5} onChange={(form) => {this.handleGoalChange(form,"courseGoal"+this.props.course)}} placeholder={"70"} value={this.state.goal} style={{width:"55px", marginLeft:"5px",}}/>
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
                <Form.Control maxLength={5} onChange={(form) => {this.handleExamMarkChange(form,"courseExamMark"+this.props.course)}} placeholder={"70"} value={this.state.examMark} style={{width:"55px", marginLeft:"5px",}}/>
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
          </tbody>
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