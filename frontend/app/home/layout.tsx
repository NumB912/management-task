import { Link, ShieldCheck } from "lucide-react";
import React from "react";
export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>

      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-10">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-lg">
            <ShieldCheck aria-hidden="true" className="text-primary" /> Toboco Admin
          </Link>
          <nav aria-label="Điều hướng quản trị" className="flex gap-5 text-sm">
            <Link href="/admin" className="font-medium text-primary">Người dùng</Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Về ứng dụng</Link>
          </nav>
        </div>
      </header>
        {children}
    </div>
  );
}
