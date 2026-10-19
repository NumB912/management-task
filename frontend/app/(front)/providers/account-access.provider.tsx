"use client";

import { ShieldBan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccountAccessState } from '../feature/store/account-access.state';

export function AccountAccessProvider({ children }: { children: React.ReactNode }) {
  const blocked = useAccountAccessState(state => state.blocked);
  if (!blocked) return <>{children}</>;

  return <main className="flex min-h-dvh items-center justify-center bg-background px-6 text-foreground">
    <div role="alert" className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm space-y-5">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <ShieldBan aria-hidden="true" className="size-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-semibold">Tài khoản đã bị cấm</h1>
      <p className="text-muted-foreground">Người dùng đã bị cấm, vui lòng liên hệ với hệ thống.</p>
      <div className="flex flex-wrap justify-center items-center gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>Kiểm tra lại</Button>
        <a className="text-sm font-medium underline underline-offset-4" href="/auth/login">Về đăng nhập</a>
      </div>
    </div>
  </main>;
}
