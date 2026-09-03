
import jwt from "jsonwebtoken";
import { ITokenService } from "../../domain";


export default class TokenService implements ITokenService {
  private readonly SecretKey: string;

  constructor() {
    if (!process.env.SECRET_KEY) {
      throw new Error("SECRET_KEY is required");
    }
    this.SecretKey = process.env.SECRET_KEY;
  }

  async generateToken(payload:object,expireIn:string|number|any="5m"): Promise<string> {
    const token = jwt.sign(payload, this.SecretKey, { expiresIn: expireIn });
    return token;
  }

  async verifyToken(token: string): Promise<any> {
    const decoded = jwt.verify(token, this.SecretKey);
    return decoded;
  }
}