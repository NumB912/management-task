export interface IUsecase<T> {
  execute(...args: any[]): Promise<T>;
}
