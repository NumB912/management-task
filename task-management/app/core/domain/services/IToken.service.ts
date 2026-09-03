export interface ITokenService{
    generateToken(payload: object,expireIn:string|number|any): Promise<string>
    verifyToken<T>(token: string): Promise<T>
}