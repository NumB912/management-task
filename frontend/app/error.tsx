"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section
        aria-labelledby="page-error-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
      >
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>
        <h1 id="page-error-title" className="text-2xl font-semibold text-foreground">
          Đã xảy ra lỗi
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Không thể tải trang lúc này. Bạn có thể thử lại hoặc quay về trang công việc.
        </p>
        {error.digest && (
          <p className="mt-3 break-all text-xs text-muted-foreground">
            Mã lỗi: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={() => retry()}>
            <RotateCcw aria-hidden="true" />
            Thử lại
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/work/today">
              <ArrowLeft aria-hidden="true" />
              Về trang công việc
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
