import * as moment from "moment";
import { extendMoment } from "moment-range";
import { MessageStatus, SlackInputs, ResponseStructure, EventAction, Presence, StatusBuilder } from "./types";
const slack = require("slack");
const nodeEmoji = require('node-emoji');
const token = process.env.SLACK_TOKEN;

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
    let statusEmoji = nodeEmoji.unemojify('🗓');
    let eventSummary = this.eventSummary.toLowerCase();

    var statuses:Array<StatusBuilder> = [{
      presence: Presence.away,
      emoji: '🚶'
    },{
      presence: Presence.dnd,
      emoji: '🔕'
    },{
      presence: Presence.leave,
      emoji: '🏖️'
    }, {
      presence: Presence.lunch,
      emoji: '🍔'
    }, {
      presence: Presence.auto,
      emoji: '🗓', 
      eventSummary: 'In meeting'
    }];

    statuses.some(s => {
      let token = `[${s.presence}]`;
      if(eventSummary.indexOf(token) > -1){
        statusEmoji = nodeEmoji.unemojify(s.emoji);
        if(s.presence === Presence.away){
          slack.users.setPresence({
            token,
            presence: s.presence
          });
          s.strip = true;
        }
        else if(s.presence === Presence.dnd){
          slack.dnd.setSnooze({
            token,
            num_minutes: this.endDate.diff(this.startDate, 'minutes')
          });
          s.strip = true;
        }

        if(s.strip){
          this.eventSummary = this.stripMessage(this.eventSummary, token);
        }

        if(s.eventSummary){
          this.eventSummary = s.eventSummary;
        }
        this.presence = s.presence;
        return true;
      }
    });

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
