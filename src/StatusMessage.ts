import * as moment from "moment";
import { extendMoment } from "moment-range";
import { MessageStatus, Presence, StatusBuilder } from "./types";
const slack = require("slack");
const nodeEmoji = require('node-emoji');
const token = process.env.SLACK_TOKEN;

export class StatusMessage{
  eventSummary:string;
  startDate:moment.Moment;
  endDate:moment.Moment;
  presence:Presence;
  constructor(eventSummary:string, startDate:moment.Moment, endDate:moment.Moment){
    this.eventSummary = eventSummary;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  stripMessage(message:string, str:string){
    return message.replace(str, '').trim();
  }

  buildMessage():MessageStatus{
    let statusEmoji = nodeEmoji.unemojify('🗓');
    let eventSummary = this.eventSummary.toLowerCase();

    var statuses:Array<StatusBuilder> = [{
      presence: Presence.hospital,
      emoji: '🏥', 
      strip: true,
      away: true
    },{
      presence: Presence.away,
      emoji: '🚶',
      away: true
    },{
      presence: Presence.dnd,
      emoji: '🔕'
    },{
      presence: Presence.leave,
      emoji: '🏖️',
      away: true
    }, {
      presence: Presence.lunch,
      emoji: '🍔'
    }, {
      presence: Presence.auto,
      emoji: '🗓', 
      eventSummary: 'In meeting'
    }];

    statuses.some(s => {
      let fullPresence = `[${s.presence}]`;
      if(eventSummary.indexOf(fullPresence) > -1){
        statusEmoji = nodeEmoji.unemojify(s.emoji);
        slack.users.setPresence({
          token,
          presence: s.away? 'away': 'auto'
        });

        if(s.strip){
          this.eventSummary = this.stripMessage(this.eventSummary, fullPresence);
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