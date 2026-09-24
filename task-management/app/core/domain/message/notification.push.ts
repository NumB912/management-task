
export const REALTIME_MQ = {
  EXCHANGE: "realtime.events",
  ROUTING_KEY: "realtime.push",
  TYPE: "direct",
} as const;

export interface RealtimePushMessage<T = unknown> {
  userIds: string[];
  event: string;    
  data: T;          
}