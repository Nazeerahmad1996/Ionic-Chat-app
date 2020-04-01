import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DatetimeProvider {

  constructor(public http: HttpClient) {
  }

  formatAMPM (time) {
    if (time) {
      const date = new Date(time);
      let hours: any = date.getHours();
      let minutes: any = date.getMinutes();
      let ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      let strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }

    return '00:00 --';
  }

  getTimezoneSpecificTimestamp(offset: any) {
    // create Date object for current location
    let date1 = new Date();
    
    // convert to msec
    // add local time zone offset 
    // get UTC time in msec
    let utc = date1.getTime() + (date1.getTimezoneOffset() * 60000);

    // return time as a string
    // return "The local time in " + city + " is " + nd.toLocaleString();// create Date object for current location
    let date2 = new Date();
    
    // convert to msec
    // add local time zone offset 
    // get UTC time in msec
    utc = date2.getTime() + (date2.getTimezoneOffset() * 60000);
    return utc + (3600000 * offset); // return timestamp
  }

}
