import * as moment from "moment";
import { extendMoment } from "moment-range";
import { MessageStatus, ResponseStructure, EventAction, Presence } from "./types";
import { DateCalcs } from './DateCalcs';
import { StatusMessage } from './StatusMessage';
import { SlackStatus } from './SlackStatus';

export class Init{
  payload:ResponseStructure;
  date: DateCalcs;
  currentDate: moment.Moment;
  startDate: moment.Moment;
  endDate: moment.Moment;
  originalStartDate: moment.Moment;
  originalEndDate: moment.Moment;
  slackStatus: SlackStatus;
  statusMessage: StatusMessage;
  messageStatus: MessageStatus;
  dateInRange: boolean;
  constructor(payload:ResponseStructure){
    this.payload = payload;
    this.date = new DateCalcs();

    this.startDate = this.date.convertToMoment(this.payload.startDate);
    this.endDate = this.date.convertToMoment(this.payload.endDate);
    this.currentDate = moment();
    this.dateInRange = this.date.isInRange(this.startDate, this.endDate, this.currentDate);
  }

  init(){
    if(this.payload.eventAction === EventAction.add){
      this.startAdd();
    }
    else if(this.payload.eventAction === EventAction.delete){
      this.startDelete();
    }
    else if(this.payload.eventAction === EventAction.update){
      this.startUpdate();
    }
    else{
      throw "invalid event action type";
    }
  }

  buildData(){
    this.statusMessage = new StatusMessage(this.payload.eventSummary, this.startDate, this.endDate);
    this.messageStatus = this.statusMessage.buildMessage();
    this.slackStatus = new SlackStatus({
      presence: this.messageStatus.presence,
      emoji: this.messageStatus.emoji,
      endDate: this.endDate,
      startDate: this.startDate,
      eventSummary: this.messageStatus.message
    });
  }

  buildClearData(){
    this.slackStatus = new SlackStatus({
      presence: Presence.auto,
      emoji: "",
      endDate: this.endDate,
      startDate: this.startDate,
      eventSummary: ""
    })
  }

  startAdd(){
    if(this.dateInRange){
      this.buildData();
      this.slackStatus.add();
    }
    else{
      // do nothing
    }
  }

  startUpdate(){
    this.originalStartDate = moment(this.payload.originalStartDate);
    this.originalEndDate = moment(this.payload.originalEndDate);
    let originalDateInRange = this.date.isInRange(this.originalStartDate, this.originalEndDate, this.currentDate);
    if(this.dateInRange){
      this.buildData();
      this.slackStatus.add();
    }
    else if(originalDateInRange){
      this.buildClearData();
      this.slackStatus.clear();
    }
    else{
      // do nothing
    }
  }

  startDelete(){
    if(this.dateInRange){
      this.buildClearData();
      this.slackStatus.clear();
    }
    else{
      // do nothing
    }
  }
}