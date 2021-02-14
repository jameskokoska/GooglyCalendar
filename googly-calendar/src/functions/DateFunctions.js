//import {eventToday, getDisplayDayFull, getDisplayDay, getDisplayMonth, getDisplayMonthFull, displayDate, displayTime} from "./DateFunctions"

export function eventToday(date,today=new Date()){
  if(date.getDay()===today.getDay() && date.getDate()===today.getDate() && date.getMonth()===today.getMonth() && date.getYear()===today.getYear()){
    return true;
  } else {
    return false;
  }
}

export function getDisplayDayFull(date){
  var weekDay="";
  if(date.getDay()===0){
    weekDay="Sunday";
  } else if (date.getDay()===1){
    weekDay="Monday";
  } else if (date.getDay()===2){
    weekDay="Tuesday";
  } else if (date.getDay()===3){
    weekDay="Wednesday";
  } else if (date.getDay()===4){
    weekDay="Thursday";
  } else if (date.getDay()===5){
    weekDay="Friday";
  } else if (date.getDay()===6){
    weekDay="Saturday";
  }
  return weekDay;
}

export function getDisplayDay(date){
  var weekDay="";
  if(date.getDay()===0){
    weekDay="Sun.";
  } else if (date.getDay()===1){
    weekDay="Mon.";
  } else if (date.getDay()===2){
    weekDay="Tues.";
  } else if (date.getDay()===3){
    weekDay="Wed.";
  } else if (date.getDay()===4){
    weekDay="Thurs.";
  } else if (date.getDay()===5){
    weekDay="Fri.";
  } else if (date.getDay()===6){
    weekDay="Sat.";
  }
  return weekDay;
}

export function getDisplayMonth(date){
  var month="";
  if(date.getMonth()===0){
    month="Jan."
  } else if (date.getMonth()===1){
    month="Feb."
  } else if (date.getMonth()===2){
    month="Mar."
  } else if (date.getMonth()===3){
    month="Apr."
  } else if (date.getMonth()===4){
    month="May"
  } else if (date.getMonth()===5){
    month="June"
  } else if (date.getMonth()===6){
    month="July"
  } else if (date.getMonth()===7){
    month="Aug."
  } else if (date.getMonth()===8){
    month="Sept."
  } else if (date.getMonth()===9){
    month="Oct."
  } else if (date.getMonth()===10){
    month="Nov."
  } else if (date.getMonth()===11){
    month="Dec."
  }
  return month;
}

export function getDisplayMonthFull(date){
  var month="";
  if(date.getMonth()===0){
    month="January"
  } else if (date.getMonth()===1){
    month="February"
  } else if (date.getMonth()===2){
    month="March"
  } else if (date.getMonth()===3){
    month="April"
  } else if (date.getMonth()===4){
    month="May"
  } else if (date.getMonth()===5){
    month="June"
  } else if (date.getMonth()===6){
    month="July"
  } else if (date.getMonth()===7){
    month="August"
  } else if (date.getMonth()===8){
    month="September"
  } else if (date.getMonth()===9){
    month="October"
  } else if (date.getMonth()===10){
    month="November"
  } else if (date.getMonth()===11){
    month="December"
  }
  return month;
}

export function displayDate(date){
  if(isNaN(date.getMonth())&&isNaN(date.getDay())&&isNaN(date.getDate())){
    return "All day"
  } else {
    var output="";
    var month=getDisplayMonth(date);
    var weekDay = getDisplayDayFull(date)
    output=weekDay+" "+month+" " + date.getDate()
    return output;
  }
}

export function displayTime(date){
  if(isNaN(date.getHours())&&isNaN(date.getMinutes())){
    return "All day"
  } else {
    var output = "Undefined";
    var minutes = date.getMinutes();
    if(minutes<=9){
      minutes="0"+minutes;
    }
    var hours = date.getHours();
    var meridian;
    if(hours>=12){
      hours=hours-12;
      meridian="pm";
    } else {
      meridian="am"
    }
    if(hours===0){
      hours = 12;
    }

    if(minutes==="00"){
      output = hours+" "+meridian;
    } else {
      output = hours+":"+minutes+" "+meridian;
    }
    return output;
  } 
}