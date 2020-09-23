import React from "react";
import { SliderPicker } from "react-color";

class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayColorPicker: false,
      colorValue: props.defaultColor
    };
  }

  handleColorChange = color => {
    this.setState({
      colorValue: color.hex
    });
  };

  render() {
    const {colorValue} = this.state;
    return (
      <div className="color-picker">
          <div className="color-picker__popover">
            <SliderPicker
              color={colorValue}
              onChange={this.handleColorChange}
            />
          </div>
      </div>
    );
  }
}

export default ColorPicker;