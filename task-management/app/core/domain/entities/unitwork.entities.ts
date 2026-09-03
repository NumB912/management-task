

export interface IUnitWork{
    getSession(): unknown|null
    startTransaction(): Promise<void>
    rollBackTransaction(): Promise<void>
    commitTransaction(): Promise<void>
}