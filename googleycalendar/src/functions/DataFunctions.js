import ApiCalendar from 'react-google-calendar-api';

// import {listEvents, sortPin, sortName, sortName, sortCourse, sortDate, sortCheck, determineRawSecondsTime, determineTaskName, determineTaskCourse, appendLastSort} from "./DataFunctions"
export function listEvents(maxResults, hoursPast=0, calendarId=ApiCalendar.calendar) { 
  var datePast = new Date();
  datePast.setHours(datePast.getHours()-hoursPast);
  if (ApiCalendar.gapi) {
    return ApiCalendar.gapi.client.calendar.events.list({
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

export function sortPin(calendarObjects){
  var sortedCalendarObjects = calendarObjects;
  var nameA;
  var nameB;
  sortedCalendarObjects.sort(function(a, b) {
    if(a.pin === true){
      nameA="0000pin";
    } else {
      nameA="zzzzpin";
    }
    if(b.pin === true){
      nameB="0000pin";
    } else {
      nameB="zzzzpin";
    }
    return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
  });
  return sortedCalendarObjects;
}

export function sortName(calendarObjects){
  var sortedCalendarObjects = calendarObjects;
  sortedCalendarObjects.sort(function(a, b) {
    var textA;
    var textB;
    if(determineTaskName(a.summary)===undefined){
      textA = "undefined"
    } else {
      textA = determineTaskName(a.summary).toUpperCase();
    }
    if(determineTaskName(b.summary)===undefined){
      textB = "undefined"
    } else {
      textB = determineTaskName(b.summary).toUpperCase();
    }
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });
  return sortedCalendarObjects;
}

export function sortCourse(calendarObjects){
  var sortedCalendarObjects = calendarObjects;
  sortedCalendarObjects.sort(function(a, b) {
    var textA = determineTaskCourse(a.summary).toUpperCase();
    var textB = determineTaskCourse(b.summary).toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });
  return sortedCalendarObjects;
}

export function sortDate(calendarObjects){
  var sortedCalendarObjects = calendarObjects;
  sortedCalendarObjects.sort(function(a, b) {
    var textA = determineRawSecondsTime(a.start);
    var textB = determineRawSecondsTime(b.start);
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });
  return sortedCalendarObjects;
}

export function sortCheck(calendarObjects){
  var sortedCalendarObjects = calendarObjects;
  var nameA;
  var nameB;
  sortedCalendarObjects.sort(function(a, b) {
    if(a.done === true){
      nameA="zdone";
    } else {
      nameA="notDone";
    }
    if(b.done === true){
      nameB="zdone";
    } else {
      nameB="notDone";
    }
    return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
  });
  return sortedCalendarObjects;
}

export function determineRawSecondsTime(start){
  if(start.dateTime!==undefined){
    return new Date(start.dateTime).valueOf();
  } else if(start.date!==undefined){
    return new Date(start.date).valueOf();
  } else {
    return 0;
  }
}

//this will determine the task name without the check-mark and course
export function determineTaskName(summary){
  var name;
  if(summary !== undefined && summary.length>=2 && (summary.substring(0,2)==="✔️"||summary.substring(0,2)==="📌")){
    name=summary.substring(2);
  } else {
    name=summary;
  }
  if(summary!==undefined&&name.length>7&&/^\d+$/.test(name.substring(4,7))&&!/\d/.test(name.substring(0,4))){
    if(name.substring(7,8)!==" "){
      name=name.substring(7);
    } else {
      name=name.substring(8);
    }
  } else if(summary!==undefined&&name.length>=8&&/^\d+$/.test(name.substring(3,6))&&!/\d/.test(name.substring(0,3))&&name.substring(6,8)==="H1"){
    if(name.substring(8,9)!==" "){
      name=name.substring(8);
    } else {
      name=name.substring(9);
    }
  } else if(summary!==undefined&&name.length>6&&/^\d+$/.test(name.substring(3,6))&&!/\d/.test(name.substring(0,3))){
    if(name.substring(6,7)!==" "){
      name=name.substring(6);
    } else {
      name=name.substring(7);
    }
  } 
  return name;
}

export function determineTaskCourse(summary){
  var course;
  var name;
  if(summary !== undefined && summary.length>=2 && (summary.substring(0,2)==="✔️"||summary.substring(0,2)==="📌")){
    name=summary.substring(2);
  } else {
    name=summary;
  }

  if(summary!==undefined&&name.length>7&&/^\d+$/.test(name.substring(4,7))&&!/\d/.test(name.substring(0,4))){
    course=name.substring(0,7);
  } else if(summary!==undefined&&name.length>=8&&/^\d+$/.test(name.substring(3,6))&&!/\d/.test(name.substring(0,3))&&name.substring(6,8)==="H1"){
    course=name.substring(0,8);
  } else if(summary!==undefined&&name.length>6&&/^\d+$/.test(name.substring(3,6))&&!/\d/.test(name.substring(0,3))){
    course=name.substring(0,6);
  }  else {
    course="";
  }
  return course;
}



export function appendLastSort(newSort, lastSort){
  var lastSortList = [];
  lastSortList = lastSort.split(",");
  lastSortList = lastSortList.filter(x=>x !== newSort);
  lastSortList = [...lastSortList, newSort];
  var lastSortListStr="";
  lastSortList.map(function(sortElement,i){
    if(i!==lastSortList.length-1){
      lastSortListStr=lastSortListStr+sortElement+",";
    } else {
      lastSortListStr=lastSortListStr+sortElement;
    }
  })
  return lastSortListStr;
}
