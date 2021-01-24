import React from 'react';
import { AsyncStorage } from 'AsyncStorage';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ApiCalendar from 'react-google-calendar-api';
import '../App.css';

export default class EventInfoMessage extends React.Component{
  constructor(props){
    super(props);
    this.state={eventOpenState: this.props.eventInfoOpen}

  }
  componentDidUpdate(oldProps){
    if(oldProps!==this.props){
      this.setState({eventOpenState: this.props.eventInfoOpen});
      console.log(this.props.eventInfoSelected);
    }
  }
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name==='close') {
      this.setState({eventOpenState: false});
      this.props.toggleEventInfoOpen(false);
    }
  }
  render(){
    var title = "";
    var date = "";
    var time = "";
    var description = "";
    if(this.props.eventInfoSelected!==undefined){
      title = this.props.eventInfoSelected.summary;
      date = this.props.eventInfoSelected.date;
      time = this.props.eventInfoSelected.timeStart + " - " + this.props.eventInfoSelected.timeEnd;
      description = this.props.eventInfoSelected.description;
    }
    return(
      <Modal className="settingsModal" show={this.state.eventOpenState} onHide={(e) => this.handleItemClick(e, "close")} size="lg">
        <Modal.Header>
          <div className="header1" style={{"marginBottom":"0px"}}>{title}</div>
        </Modal.Header>
        <Modal.Body>
          <div className="header2">{date}</div>
          <div className="header3">{time}</div>
          <br/>
          <p dangerouslySetInnerHTML={{ __html: description }}></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={(e) => this.handleItemClick(e, "close")} style={{'marginRight':"15px"}}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}