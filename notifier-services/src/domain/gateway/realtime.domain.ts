export default interface IRealtimeGateway {
  pushToUser<T = unknown>(userId: string, event: string, payload: T): void;
}