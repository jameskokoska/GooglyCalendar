import ApiCalendar from 'react-google-calendar-api';
class ApiCalendarExtension extends ApiCalendar{
    constructor() {
        super()
        this.listEvents = this.listEvents.bind(this);
    }
    listEvents(maxResults, hoursPast, calendarId=this.calendar) { 
    var datePast = new Date()
    datePast.setHours(datePast.getHours()-hoursPast)
        if (this.gapi) {
        return this.gapi.client.calendar.events.list({
                'calendarId': calendarId,
                'timeMin': (datePast).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': maxResults,
                'orderBy': 'startTime'
        });
        }
        else {
        console.log("Error: this.gapi not loaded");
        return false;
        }
    }
}
// var ApiCalendarExtension = require('react-google-calendar-api');
// ApiCalendarExtension.listEvents = function(maxResults, hoursPast, calendarId=this.calendar) { 
//   var datePast = new Date()
//   datePast.setHours(datePast.getHours()-hoursPast)
//     if (this.gapi) {
//       return this.gapi.client.calendar.events.list({
//             'calendarId': calendarId,
//             'timeMin': (datePast).toISOString(),
//             'showDeleted': false,
//             'singleEvents': true,
//             'maxResults': maxResults,
//             'orderBy': 'startTime'
//       });
//     }
//     else {
//       console.log("Error: this.gapi not loaded");
//       return false;
//     }
// }
export default {ApiCalendarExtension}