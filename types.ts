import * as moment from "moment";
import { extendMoment } from "moment-range";

export interface MessageStatus{
  message: string;
  emoji: string;
  presence: Presence;
}

export interface SlackInputs{
  eventSummary: string,
  startDate: moment.Moment,
  endDate: moment.Moment,
  presence: Presence,
  emoji: string
}

export interface ResponseStructure{
  eventSummary: string,
  startDate: string,
  endDate: string,
  originalStartDate?: string,
  originalEndDate?: string,
  eventAction: EventAction
}

export interface StatusBuilder{
  eventSummary?: string,
  strip?: boolean,
  emoji: string,
  presence: Presence
}

export enum EventAction {
  update = "update",
  delete = "delete",
  add = "add"
}

export enum Presence {
  away = "away",
  leave = "leave",
  dnd = "dnd",
  auto = "auto",
  lunch = "lunch",
  personal = "personal",
  hospital = "hospital"
}

