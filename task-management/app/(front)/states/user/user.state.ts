// src/store/useUserState.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { IUserModel } from "../../model";
import { axiosInstance } from "../../lib/axios";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated" | "error";

export interface LoginInput {
  email: string;
  password: string;
}

interface UserState {
  open:boolean,
  setOpen:(open:boolean)=>void
  user: IUserModel | null;
  status: AuthStatus;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setUser:(user:Partial<Pick<IUserModel,"avatar"|"name">>)=>void
  fetchUser: () => Promise<IUserModel|undefined>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
}

const useUserState = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      status: "idle",
      open:false,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      fetchUser: async () => {
        if (get().status === "loading") return;
        set({ status: "loading" });
        try {
          const { data } = await axiosInstance.get<{ profile: IUserModel }>("/user/me/profile");
          set({ user: data.profile, status: "authenticated" });
          return data.profile
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            set({ user: null, status: "unauthenticated" });
            
          } else {
            set({ status: "error" });
          }
        }
      },
      setUser(user) {
        set((state) =>
    state.user ? { user: { ...state.user, ...user } } : state
  )
      },
      setOpen(open) {
        set({open:open})
      },
      login: async (input) => {
        set({ status: "loading" });
        try {
          const { data } = await axiosInstance.post<{ user: IUserModel }>("/auth/login", input);
          set({ user: data.user, status: "authenticated" });
        } catch (err) {
          set({ user: null, status: "unauthenticated" });
                 useUserState.persist.clearStorage()
          throw err; 
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout",{credentials:true});
          set({status:"unauthenticated"})
        } catch {
          set({status:"unauthenticated"})
        } finally {
          get().reset();
        }
      },

      reset: () => {
        set({ user: null, status: "unauthenticated" })
        useUserState.persist.clearStorage()
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  ),
);

export default useUserState;