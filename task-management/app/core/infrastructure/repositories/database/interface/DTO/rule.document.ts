import {ITaskWithId } from "@/app/core/domain";
import { IRuleDocument } from "../rule.document";

export interface IRuleTagDTODocument extends IRuleDocument {
    taskInfo:ITaskWithId
}
