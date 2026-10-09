import { ITaskModel } from "./task.model"

export interface IPomodoroModel {
  id: string
  task?: Pick<ITaskModel,"id"|"name">
  start: Date
  progress: {
    startPause: Date
    duration: number
  }[]
  user: string
  totalDuration:number,
  created_at: Date
}