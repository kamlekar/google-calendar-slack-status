import * as moment from "moment";
import { extendMoment } from "moment-range";

export class DateCalcs{
  isInRange(startDate:moment.Moment, endDate:moment.Moment, currentDate:moment.Moment):boolean{
    var range = extendMoment(moment).range(startDate.subtract(6, "minutes"), endDate);
    return range.contains(currentDate);
  }

  convertToMoment(date:string):moment.Moment{
    let utcDate = moment.utc(date, "DD-MMM-YYYY HH:mm:ss");
    let toLocal = utcDate.local();
    let localDateFormat = toLocal.format("DD-MM-YYYY HH:mm");
    let finalMoment = moment(localDateFormat, "DD-MM-YYYY HH:mm");
    return finalMoment; //moment(moment.utc(date).local().format("DD-MM-YYYY HH:mm"));
  }
}
