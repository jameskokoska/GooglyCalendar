import React from 'react';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

export default class TimeOutError extends React.Component{
  handleItemClick(event: SyntheticEvent<any>, name: string): void {
    if (name==='refreshPage') {
      window.location.reload();
    } 
  }
  render(){
    return(
      <Modal className="settingsModal" show={this.props.errorTimeoutOpen} onHide={(e) => this.handleItemClick(e, "refreshPage")} size="lg">
        <Modal.Header>
          <Modal.Title>Connection has timed out</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.props.errorCode}<p>Please <b>reload the page</b>, otherwise changes will not be saved!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={(e) => this.handleItemClick(e, "refreshPage")}>
            Refresh
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
