import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/(front)/components/ui/button";

export function AuthBackLink({ href = "/auth/login" }: { href?: string }) {
  return (
    <div className="px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="size-10 rounded-full text-muted-foreground hover:text-primary" asChild>
        <Link href={href} aria-label="Quay lại đăng nhập" title="Quay lại đăng nhập">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
