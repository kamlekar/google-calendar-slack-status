var assert = require('assert');
import Init from '../init';
import { MessageStatus, SlackInputs, ResponseStructure, EventAction, Presence } from "../types";
import * as moment from "moment";
import { extendMoment } from "moment-range";

describe('init', function(){
  // Same time different times. Actual local time 1:30 AM 8th Aug.
  let expectedInputDateFormats = [ 
    '07-Aug-2020 19:30:00',
    'August 8, 2020 at 01:00AM'
  ];

  it('should add status on slack', function(){
    var initOne = new Init({ 
      eventSummary: "Hello", 
      startDate: '07-Aug-2020 19:30:00',
      endDate: '07-Aug-2020 20:30:00', 
      eventAction: EventAction.add
    });
    console.log(initOne.startDate.date(), initOne.endDate);
  })
})

describe('Utility and common functions', function(){
  it('should check whether the time range falls under current datetime', function(){

  });

  it('should update the slack status', function(){

  });

  it('should clear the current slack status', function(){

  });

  it('should check whether the event is declined', function(){

  });

  it("should handle the error gracefully when the response is not a valid json", function(){

  });
});

describe('Event added', function() {
  it('should update the slack status when the time range falls under current datetime', function() {

  });

  it("should not update the slack status when the time range doesn't fall under current datetime", function(){

  });
});

describe('Event updated', function(){
  it('should update the status when the ongoing event is updated with change in Event summary', function(){

  });

  it('should update the status when the ongoing event is updated with change in time extension', function(){

  });

  it('should update the slack status when an event is updated by other organiser which falls under current time', function (){

  });

  it('should clear the status when the ongoing event is moved to other time range', function(){

  });

  it('should not do anything when other than ongoing event is updated', function(){

  });
});

describe('Event deleted', function(){
  it('should clear the status when the ongoing event is deleted', function(){

  });

  it('should not do anything when other than ongoing event is deleted', function(){

  });
})

