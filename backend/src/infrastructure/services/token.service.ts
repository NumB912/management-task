
import { ITokenService } from "@/domain";
import { TokenConfig } from "@/domain/config/token.config";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import jwt from "jsonwebtoken";


@Injectable()
export default class TokenService implements ITokenService {
  private readonly SecretKey: string;

  constructor(config: ConfigService) {
     this.SecretKey = config.getOrThrow<string>('SECRET_KEY');
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