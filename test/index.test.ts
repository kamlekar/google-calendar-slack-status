var assert = require('assert');
import Init from '../index';
import { MessageStatus, SlackInputs, ResponseStructure, EventAction, Presence } from "../types";

describe('init', function(){
  it('should add status on slack', function(){
    var init = new Init({ 
      eventSummary: "Hello", 
      startDate: "2020-03-09 17:31:22",
      endDate: "2020-03-09 17:31:22", 
      eventAction: EventAction.add
    });

    init.init();
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

