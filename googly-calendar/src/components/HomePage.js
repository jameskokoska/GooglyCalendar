import React from 'react';
import { AsyncStorage } from 'AsyncStorage';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ApiCalendar from 'react-google-calendar-api';
import '../App.css';
import Header1 from './Header1.js'
import ButtonStyle from './ButtonStyle'

export default class HomePage extends React.Component{
  constructor(props){
    super(props);
    this.state={welcomeOpenState: true}
  }
  render(){
    return(
      <div className="homeScreen">
      <div style={{height: "20vh"}}/>
      <div className="homeHeader1">
        Welcome to Calendar Tasks
      </div>
      <ButtonStyle label={"Get Started"}/>
      </div>
    )
  }
}