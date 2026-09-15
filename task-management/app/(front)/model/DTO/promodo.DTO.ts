
import { IPromodoroModel } from "../promodo.model";

export interface ICreatePromodoDTO extends Pick<IPromodoroModel,"progress"|"start">{
    task?:string,
}
