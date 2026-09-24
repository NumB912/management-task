export default interface IUsecase<T>{
    execute(...args: any[]): Promise<T>;
}