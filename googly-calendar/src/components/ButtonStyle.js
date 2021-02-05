import React from 'react';
import '../App.css';

export default function ButtonStyle(props){
  return(
    <div className="button">
      {props.label}
    </div>
  )
}