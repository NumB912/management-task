import { Ipomodoro, IPomodoroWithId } from "../entities/pomodoro.entity.js";
import { IRepository } from "./IRepository.js";


export interface IPomodoroRepository extends IRepository<IPomodoroWithId>{
    getpomodoroDetail(userId:string):Promise<Partial<Ipomodoro>[]>
    updateTaskToPomodoro(
        DTO: { userId: string; task?: string|null; id: string },
        session?: unknown
      ):Promise<boolean> 
}
