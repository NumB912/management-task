import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUserModel } from "../../model";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface UserState {
  user: IUserModel | null;
  status: AuthStatus;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  fetchUser: () => Promise<void>;
  reset: () => void;
}

const useUserState = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      status: "idle",
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      fetchUser: async () => {
        if (get().status === "loading") return;

        set({ status: "loading" });
        try {
          const res = await fetch("/api/user/me", { credentials: "include" });
          if (!res.ok) throw new Error("Unauthorized");
          const {user} = await res.json();
          set({ user, status: "authenticated" });
        } catch {
          set({ user: null, status: "unauthenticated" });
        }
      },
      reset: () => set({ user: null, status: "unauthenticated" }),
    }),
    {
      name: "user-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useUserState;