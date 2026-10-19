"use client";
import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/app/(front)/feature/store/workspace.state";

import { ITaskModel } from "../model";
import { useUpdateTaskStatusBulk } from "../feature/hook/useTaskMutation.hook";
import { appendRecurringRecord } from "./task-status-records";

export type Pending = {
  status: ITaskModel["status"];
  record: Record<string, { date: Date; rule: string }>|undefined;
  type:"recurring"|"single",
  snapshot: { status: ITaskModel["status"]; rule: ITaskModel["rule"] };
};

type ScheduleFn = (
  id: string,
  status: ITaskModel["status"],
  snapshot: Pending["snapshot"],
  type:"recurring"|"single",
  recurring?: { tempId: string; rule: string; date: Date },
) => void;

const Ctx = createContext<{ schedule: ScheduleFn; flushAll: () => void,canSchedule:boolean } | null>(null);

const DELAY = 500;
const MIN_CLICK_GAP=200

export function TaskStatusBatchProvider({ children }: { children: React.ReactNode }) {
  const { mutate } = useUpdateTaskStatusBulk();
  const updateTaskStore = useWorkspaceStore((s) => s.updateTask);
  const removeTaskStore = useWorkspaceStore((s) => s.removeTask);
  const pendings = useRef(new Map<string, Pending>()||undefined);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const lastClickAt = useRef(0)
  const flushAll = useCallback(() => {
    clearTimeout(timer.current!);
    if (pendings.current.size === 0) return;
    const batch = [...pendings.current].map(([id, p]) => ({ id, ...p }));
    pendings.current.clear();

    mutate(
      batch.map(({ id, status, record,type }) => ({ id, status, record,type})),
      {
        onError: () => {
           batch.forEach(({ id, snapshot, record }) => {
            updateTaskStore(id, snapshot);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            record && Object.keys(record).forEach((tempId) => removeTaskStore(tempId));
          });
          toast.error("Không thể cập nhật trạng thái task");
        },
      },
    );
  }, [mutate, updateTaskStore, removeTaskStore]);


  const canSchedule = useMemo(() => {
    const now =new Date().getTime();
    console.log("hello")
    // eslint-disable-next-line react-hooks/refs
    if (now - lastClickAt.current < MIN_CLICK_GAP){
      return false
    };
    // eslint-disable-next-line react-hooks/refs
    lastClickAt.current = now;
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastClickAt.current]);

  const schedule = useCallback<ScheduleFn>(
    (id, status, snapshot,type, recurring) => {
      const cur = pendings.current.get(id);
      if (cur && cur.status !== status) flushAll();
      let p = pendings.current.get(id);
      if (!p) {
        p = { status, record: undefined, type, snapshot };
        pendings.current.set(id, p);
      }
      
      if (recurring) {
        p.record = appendRecurringRecord(p.record, recurring);
      }

      clearTimeout(timer.current!);
      timer.current = setTimeout(flushAll, DELAY);
    },
    [flushAll],
  );

  const value = useMemo(() => ({ schedule, flushAll, canSchedule}), [schedule, flushAll, canSchedule]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTaskStatusBatch = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Wrap with TaskStatusBatchProvider");
  return ctx;
}
