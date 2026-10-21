import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full min-w-0 flex-col bg-neutral-50/40 sm:px-4 sm:py-6">
      <div className="w-full min-w-0 self-center sm:my-auto">{children}</div>
    </div>
  );
}
