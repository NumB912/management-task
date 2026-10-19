
import { IPomodoroModel } from "../pomodoro.model";

export interface ICreatepomodoroDTO extends Pick<IPomodoroModel,"progress"|"start"|"totalDuration">{
    task?:string,
}


export interface IUpdatePomodoroDTO extends Pick<IPomodoroModel,"task">{

}
