import { ApiResponse } from './../../../types/global';
export enum TrafficEventType {
  PageView = "pageView",
  Click = "click",
  FormSubmit = "formSubmit",
}

export interface TrafficEvent {
  id: string;
  landingId?: string;
  userId?: string;
  sessionId: string;
  eventType: TrafficEventType;
  url?: string;
  eventName?: string;
  isUnique: boolean;
  referrer?: string;
  device?: string;
  country?: string;
  language?: string;
  createdAt: string;
}

export interface TrackEventRequest {
  sessionId: string;
  eventType: TrafficEventType;
  landingId?: string;
  userId?: string;
  url?: string;
  eventName?: string;
  referrer?: string;
  device?: string;
  country?: string;
  language?: string;
}

export type TrackEventResponse = TrafficEvent;

export interface TrafficTotalsEntry {
  total: number;
  unique: number;
}

export interface TrafficTotals {
  pageView: TrafficTotalsEntry;
  click: TrafficTotalsEntry;
  formSubmit: TrafficTotalsEntry;
}

export interface FeedbackByDate {
  date: string;
  count: number;
}

export interface TrafficAnalyticsResponse {
  events: TrafficEvent[];
  stats: {
    totals: TrafficTotals;
    feedbackByDate: FeedbackByDate[];
  };
}

export type TrafficEventsListResponse = ApiResponse<TrafficAnalyticsResponse>;
