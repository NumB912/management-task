"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useUserState from "../states/user/user.state";

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fetchUser = useUserState((s) => s.fetchUser);
  const hasHydrated = useUserState((s) => s.hasHydrated);
  const status = useUserState((s) => s.status);

  const { isPending, isError, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    enabled: hasHydrated,
    retry: (count, err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) return false;
      return count < 2;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isPending) return <p>Đang tải...</p>;
  if (status === "unauthenticated") return null;

  if (isError) {
    return (
      <div>
        <p>Không thể tải thông tin người dùng.</p>
        <button onClick={() => refetch()}>Thử lại</button>
      </div>
    );
  }

  return <>{children}</>;
}