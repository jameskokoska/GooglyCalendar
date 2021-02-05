import React from 'react';
import Toast from 'react-bootstrap/Toast'
import refreshIcon from "../assets/sync-alt-solid.svg"

export default class Refresh extends React.Component{
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
