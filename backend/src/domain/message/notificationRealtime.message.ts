export interface IRealtimeNotifier {
  push<T,U>(userIds: string[], event: string, data: T,dataPush?:U): Promise<void>;
}