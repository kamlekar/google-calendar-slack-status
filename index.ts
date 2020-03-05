import * as moment from "moment";
import { extendMoment } from "moment-range";

class SlackStatus {
  payload:SlackInputs;
  constructor(payload:SlackInputs){
    this.payload = payload;
  }

  add(){

  }

  clear(){

  }

  setPresence(){

  }
}

class StatusMessage{
  eventSummary:string;
  constructor(eventSummary:string){
    this.eventSummary = eventSummary;
  }

  buildMessage():MessageStatus{
    return {
      message: "",
      emoji: "",
      presence: Presence.meeting
    }
  }
}

class DateCalcs{
  isInRange(startDate:moment.Moment, endDate:moment.Moment, currentDate:moment.Moment):boolean{
    var range = extendMoment(moment).range(startDate, endDate);
    return range.contains(currentDate);
  }
}

interface MessageStatus{
  message: string;
  emoji: string;
  presence: Presence;
}

interface SlackInputs{
  eventSummary: string,
  startDate: moment.Moment,
  endDate: moment.Moment,
  presence: Presence,
  emoji: string
}

interface ResponseStructure{
  eventSummary: string,
  startDate: string,
  endDate: string,
  originalStartDate?: string,
  originalEndDate?: string,
  callType: CallType
}

enum CallType {
  update = "update",
  delete = "delete",
  add = "add"
}

enum Presence{
  away = "away",
  leave = "leave",
  dnd = "dnd",
  meeting = "meeting"
}

class Init{
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

    this.startDate = moment(this.payload.startDate);
    this.endDate = moment(this.payload.endDate);
    this.currentDate = moment();
    this.dateInRange = this.date.isInRange(this.startDate, this.endDate, this.currentDate);
  }

  init(){
    if(this.payload.callType === CallType.add){
      this.startAdd();
    }
    else if(this.payload.callType === CallType.delete){
      this.startDelete();
    }
    else if(this.payload.callType === CallType.update){
      this.startUpdate();
    }
    else{
      throw "invalid call type";
    }
  }

  buildData(){
    this.statusMessage = new StatusMessage(this.payload.eventSummary);
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
      presence: Presence.meeting,
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