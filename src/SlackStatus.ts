import { SlackInputs } from "./types";
const slack = require("slack");
const token = process.env.SLACK_TOKEN;

export class SlackStatus {
  payload:SlackInputs;
  constructor(payload:SlackInputs){
    this.payload = payload;
  }

  add(){
    let status = `${this.payload.eventSummary}`;
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