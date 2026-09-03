import { IUnitWork } from "@/app/core/domain/entities/unitwork.entities";
import mongoose, { ClientSession } from "mongoose";
import { injectable } from "tsyringe";
@injectable()
export class UnitWorkMongo implements IUnitWork {
  private session!: ClientSession;
  async commitTransaction(): Promise<void> {
    await this.session.commitTransaction();
    await this.session.endSession();
  }
  getSession(): ClientSession | null {
    return this.session ?? null;
  }
  async rollBackTransaction(): Promise<void> {
    await this.session.abortTransaction();
    await this.session.endSession();
  }
  async startTransaction(): Promise<void> {
    this.session = await mongoose.startSession();
    this.session.startTransaction();
  }
}
