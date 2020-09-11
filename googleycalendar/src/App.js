import React, {ReactNode, SyntheticEvent} from 'react';
import ApiCalendar from 'react-google-calendar-api';

export default class App extends React.Component {
      constructor(props) {
        super(props);
        this.handleItemClick = this.handleItemClick.bind(this);
      }
      
      handleItemClick(event: SyntheticEvent<any>, name: string): void {
        if (name === 'sign-in') {
          ApiCalendar.handleAuthClick();
        } else if (name === 'sign-out') {
          ApiCalendar.handleSignoutClick();
        } else if (name==='log'){
           if (ApiCalendar.sign)
            ApiCalendar.listUpcomingEvents(10)
              .then(({result}: any) => {
                console.log(result.items);
              });
        } else if (name==="change-name") {
            if (ApiCalendar.sign)
              ApiCalendar.listUpcomingEvents(1)
              .then(({result}: any) => {
                const event = {
                  summary: "check" + result.items[0].summary
                };

                ApiCalendar.updateEvent(event, result.items[0].id)
                  .then(console.log);
              });
        }
      }

      render(): ReactNode {
        return (
          <div>
              <button
                  onClick={(e) => this.handleItemClick(e, 'sign-in')}
              >
                sign-in
              </button>
              <button
                  onClick={(e) => this.handleItemClick(e, 'sign-out')}
              >
                sign-out
              </button>
              <button
                  onClick={(e) => this.handleItemClick(e, 'log')}
              >
                log
              </button>
              <button
                  onClick={(e) => this.handleItemClick(e, 'change-name')}
              >
                changename
              </button>
            </div>
          );
      }
  }

function button(props){
  return(
    <div>
    
    </div>
  )
}