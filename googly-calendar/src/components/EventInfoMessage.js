import React from 'react';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import '../App.css';

export default class EventInfoMessage extends React.Component{
  constructor(props){
    super(props);
    this.state={eventInfoOpen: false}
    this.title = "";
    this.date = "";
    this.time = "";
    this.description = "";
  }
  toggleEventInfoOpen(open, eventInfoSelected){
    this.setState({
      eventInfoOpen:open,
      eventInfoSelected:eventInfoSelected
    })
  }
  render(){
    if(this.state.eventInfoSelected!==undefined){
      this.title = this.state.eventInfoSelected.summary;
      this.date = this.state.eventInfoSelected.date;
      this.time = this.state.eventInfoSelected.timeStart + " - " + this.state.eventInfoSelected.timeEnd;
      this.description = this.state.eventInfoSelected.description;
    }
    return(
      <Modal className="settingsModal" show={this.state.eventInfoOpen} onHide={() => this.setState({eventInfoOpen: false})} size="lg">
        <Modal.Header closeButton>
          <div className="header1" style={{"marginBottom":"0px"}}>{this.title}</div>
        </Modal.Header>
        <Modal.Body>
          <div className="header2">{this.date}</div>
          <div className="header3">{this.time}</div>
          <br/>
          <p className="descriptionParagraph" dangerouslySetInnerHTML={{ __html: this.description }}></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => this.setState({eventInfoOpen: false})} style={{'marginRight':"15px"}}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}