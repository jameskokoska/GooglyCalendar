import React from "react";
import { SliderPicker } from "react-color";
import { AsyncStorage } from 'AsyncStorage';
import '../App.css';

class ColorPicker extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false,
      colorValue: this.props.color
    };
  }
  setColor(color){
    AsyncStorage.setItem(this.props.courseStorageID, color);
  }
  handleColorChange = color => {
    this.setState({
      colorValue: color.hex
    });
    this.setColor(color.hex)
  };
  render(){
    return(
      <SliderPicker
        color={this.state.colorValue}
        onChange={this.handleColorChange}
      />
    )
  }
}

export default ColorPicker;