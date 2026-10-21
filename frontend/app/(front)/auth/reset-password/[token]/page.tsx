"use client";
import { useState, useEffect } from "react";
import { AuthBackLink } from "@/app/(front)/components/auth/authBackLink";
import { useParams, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(front)/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Link,
  Loader2,
  Lock,
  Mail,
  Timer,
} from "lucide-react";
import { Label } from "@/app/(front)/components/ui/label";
import { Input } from "@/app/(front)/components/ui/input";
import { Button } from "@/app/(front)/components/ui/button";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/app/(front)/lib/axios";

interface ResetTokenPayload {
  email: string;
  exp: number;
  iat: number;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!token) {
      setError("Thiếu token trong link đặt lại mật khẩu");
      router.replace("/auth/login");
      return;
    }

    try {
      const payload = jwtDecode<ResetTokenPayload>(token);
      if (payload.exp * 1000 < Date.now()) {
        setError("Link đặt lại mật khẩu đã hết hạn");
        router.replace("/auth/login");
        return;
      }

      setEmail(payload.email);
    } catch {
      setError("Link đặt lại mật khẩu không hợp lệ");
      router.replace("/auth/login");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post("/auth/reset/email", {
        email: email,
        password,
      });
      setSuccess(true);
      setCountdown(3);
      setTimeout(() => {
        router.push("/auth/login");
        router.refresh();
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-w-0 justify-center">
      <Card className="w-full min-w-0 min-h-dvh max-w-none break-words rounded-none border-0 shadow-none ring-0 sm:min-h-0 sm:max-w-md sm:rounded-xl sm:shadow-2xl/20 sm:ring-1">
        <AuthBackLink />
        <CardHeader className="min-w-0 px-4 text-center sm:px-6">
          <div className="mx-auto mb-4 size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Đặt lại mật khẩu</CardTitle>
          <CardDescription className="mt-2">
            {success
              ? "Mật khẩu đã được cập nhật"
              : "Nhập mật khẩu mới cho tài khoản"}
          </CardDescription>
        </CardHeader>

        <CardContent className="min-w-0 space-y-4 px-4 sm:px-6">
          {error && (
            <div
              className={cn(
                "flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg",
              )}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className={cn(
                "flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg",
              )}
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>
                Đặt lại mật khẩu thành công!
                {countdown > 0 && (
                  <span className="ml-2 flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    Chuyển hướng sau {countdown}s...
                  </span>
                )}
              </span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    className="h-11 py-2 pl-9"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-9"
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Ít nhất 8 ký tự</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 pl-9"
                    required
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full px-4 py-2"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    "Đang cập nhật..."
                  </>
                ) : (
                  "Cập nhật mật khẩu"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
