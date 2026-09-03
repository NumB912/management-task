"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useUserState from "../states/user/user.state";

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const fetchUser = useUserState((s) => s.fetchUser);
  const hasHydrated = useUserState((s) => s.hasHydrated);
  const status = useUserState((s) => s.status);
  const user = useUserState((s) => s.user);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchUser();
  }, [hasHydrated, fetchUser]);

  useEffect(() => {
    if (status === "unauthenticated" || (hasHydrated && status !== "loading" && !user)) {
      router.replace("/auth/login");
    }
  }, [status, user, hasHydrated, router]);

  if (!hasHydrated || status === "idle" || status === "loading") {
    return <p>Hello</p>;
  }

  if (status === "unauthenticated" || !user) {
    return null; 
  }

  return <>{children}</>;
}