import { Types } from "mongoose";
import { GenerateId } from "../../domain/services/generateID.service";
import { Injectable } from "@nestjs/common";
@Injectable()
export class GenerateIdService implements GenerateId {
  generate(): string {
    return new Types.ObjectId().toString();
  }
}