"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/(front)/components/ui/button";
import { Input } from "@/app/(front)/components/ui/input";
import { Label } from "@/app/(front)/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/app/(front)/components/ui/card";
import { Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { axiosInstance } from "../../lib/axios";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      await axiosInstance.post("auth/register", {
        password,email,name
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
        router.refresh();
      }, 1500);
    } catch (err) {
      const fallbackMessage = "Không thể tạo tài khoản. Vui lòng thử lại.";

      if (isAxiosError<{ message?: unknown }>(err)) {
        const message = err.response?.data?.message;
        const serverMessage = Array.isArray(message)
          ? message
              .filter((item): item is string => typeof item === "string")
              .map((item) => item.trim())
              .filter(Boolean)
              .join("; ")
          : typeof message === "string"
            ? message.trim()
            : "";

        setError(
          serverMessage ||
            (err.response
              ? fallbackMessage
              : "Không thể kết nối đến server. Vui lòng thử lại."),
        );
      } else {
        setError(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-w-0 justify-center">
      <Card className="w-full min-w-0 min-h-dvh max-w-none break-words rounded-none border-0 shadow-none ring-0 sm:min-h-0 sm:max-w-md sm:rounded-xl sm:shadow-2xl/20 sm:ring-1">
        <CardHeader className="min-w-0 px-4 text-center sm:px-6">
          <CardTitle className="text-2xl font-bold">
            Tạo tài khoản mới
          </CardTitle>
          <CardDescription className="mt-2">
            Điền thông tin để bắt đầu sử dụng ứng dụng
          </CardDescription>
        </CardHeader>

        <CardContent className="min-w-0 space-y-4 px-4 sm:px-6">
          {error && (
            <div
              role="alert"
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
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Đăng ký thành công đang chuẩn bị chuyển hướng</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 py-2 pl-9"
                  required
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 py-2 pl-9"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  minLength={8}
                />
              </div>
              <p className="text-xs text-muted-foreground">Ít nhất 8 ký tự</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 py-2 pl-9"
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
                  "Đang gửi mã xác thực..."
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2 p-4 text-center">
          <p className="text-sm text-muted-foreground">Đã có tài khoản?</p>{" "}
          <Link
            href="/auth/login"
            className="text-primary hover:underline font-medium"
          >
            Đăng nhập
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
