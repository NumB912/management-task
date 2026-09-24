export interface IRealtimeNotifier {
  push<T>(userIds: string[], event: string, data: T): Promise<void>;
}