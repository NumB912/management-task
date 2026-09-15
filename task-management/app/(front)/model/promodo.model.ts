import { ITaskModel } from "./task.model"

export interface IPromodoroModel {
  id: string
  task?: Pick<ITaskModel,"id"|"name">
  start: Date
  progress: {
    startPause: Date
    duration: number
  }[]
  user: string
  created_at: Date
}