import * as moment from "moment";
import { extendMoment } from "moment-range";
const slack = require("slack");
const nodeEmoji = require('node-emoji');
const token = process.env.SLACK_TOKEN;



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

enum Presence {
  away = "away",
  leave = "leave",
  dnd = "dnd",
  auto = "auto",
  lunch = "lunch",
  personal = "personal"
}


class SlackStatus {
  payload:SlackInputs;
  constructor(payload:SlackInputs){
    this.payload = payload;
  }

  add(){
    let status = `${this.payload.eventSummary} from ${this.payload.startDate.format('h:mm')} to ${this.payload.endDate.format('h:mm a')} ${process.env.TIME_ZONE}`;
    let profile = JSON.stringify({
      "status_text": status,
      "status_emoji": this.payload.emoji,
      "status_expiration": this.payload.endDate.unix()
    });
    console.log(profile);
    slack.users.profile.set({ token, profile });
  }

  clear(){

  }
}

class StatusMessage{
  eventSummary:string;
  startDate:moment.Moment;
  endDate:moment.Moment;
  presence:Presence;
  constructor(eventSummary:string, startDate:moment.Moment, endDate:moment.Moment){
    this.eventSummary = eventSummary;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  stripMessage(message:string, token:string){
    return message.replace(token, '').trim();
  }

  buildMessage():MessageStatus{
    var awayToken = `[${Presence.away}]`;
    var dndToken = `[${Presence.dnd}]`;
    var leaveToken = `[${Presence.leave}]`;
    var lunchToken = `[${Presence.lunch}]`;

    let statusEmoji = nodeEmoji.unemojify('🗓');

    if(this.eventSummary.indexOf(awayToken) > -1){
      this.eventSummary = this.stripMessage(this.eventSummary, awayToken);
      statusEmoji = nodeEmoji.unemojify('🚶');
      slack.users.setPresence({
        token,
        presence: Presence.away
      });
      this.presence = Presence.away;
    }
    else if(this.eventSummary.indexOf(dndToken) > -1){
      statusEmoji = nodeEmoji.unemojify('🔕');
      slack.dnd.setSnooze({
        dndToken,
        num_minutes: this.endDate.diff(this.startDate, 'minutes')
      });
      this.eventSummary = this.stripMessage(this.eventSummary, dndToken);
      this.presence = Presence.dnd;
    }
    else if(this.eventSummary.indexOf(leaveToken) > -1){
      statusEmoji = nodeEmoji.unemojify('🏖️');
      this.eventSummary = this.stripMessage(this.eventSummary, leaveToken);
      this.presence = Presence.leave;
    }
    else if(this.eventSummary.indexOf(lunchToken) > -1){
      statusEmoji = nodeEmoji.unemojify('🍔');
      this.eventSummary = this.stripMessage(this.eventSummary, lunchToken);
      this.presence = Presence.lunch;
    }
    else{
      this.eventSummary = "In meeting";
      this.presence = Presence.auto;
    }
    return {
      message: this.eventSummary,
      emoji: statusEmoji,
      presence: this.presence
    }
  }
}

class DateCalcs{
  isInRange(startDate:moment.Moment, endDate:moment.Moment, currentDate:moment.Moment):boolean{
    var range = extendMoment(moment).range(startDate, endDate);
    return range.contains(currentDate);
  }
}

export default class Init{
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