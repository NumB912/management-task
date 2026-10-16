import { INotificationModel } from "@/app/(front)/model/notification.model";
import { create } from "zustand";


type Updater =
  | INotificationModel[]
  | ((prev: INotificationModel[]) => INotificationModel[]);

interface NotificationState {
  notifications: INotificationModel[];
  connect: boolean;
  acceptedListId: string;
  setNotifications: (v: Updater) => void;
  addNotification: (n: INotificationModel) => void;
  mergeOlder: (list: INotificationModel[]) => void;
  markAllRead: () => void;
  setConnect: (v: boolean) => void;
  setAcceptedListId: (id: string) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  connect: false,
  acceptedListId: "",
  setNotifications: (v) =>
    set((s) => ({
      notifications: typeof v === "function" ? v(s.notifications) : v,
    })),
  addNotification: (n) =>
    set((s) =>
      s.notifications.some((x) => x.id === n.id)
        ? s
        : { notifications: [n, ...s.notifications] },
    ),
  mergeOlder: (list) =>
    set((s) => {
      const ids = new Set(s.notifications.map((n) => n.id));
      return {
        notifications: [
          ...s.notifications,
          ...list.filter((n) => !ids.has(n.id)),
        ],
      };
    }),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
    })),
  setConnect: (connect) => set({ connect }),
  setAcceptedListId: (acceptedListId) => set({ acceptedListId }),
  reset: () => set({ notifications: [], acceptedListId: "", connect: false }),
}));