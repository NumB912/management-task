"use client";
import { useState, useEffect, useCallback } from "react";
import { AuthBackLink } from "@/app/(front)/components/auth/authBackLink";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/(front)/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/app/(front)/components/ui/card";
import { Mail, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/app/(front)/components/ui/input-otp";
import { axiosInstance } from "../../lib/axios";
export default function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || !email) return;

    try {
      const { data } = await axiosInstance.post("auth/send/email/otp", {
        email: email,
      });

      setResendCooldown(60);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    }
  }, [email, resendCooldown]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setError("");
    setIsLoading(true);

    try {
      await axiosInstance.post("auth/send/email/verify", {
        email,
        otp,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/auth/register?email=${decodeURI(email)}`);
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xác thực thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  return (
    <div className="flex w-full min-w-0 justify-center">
      <Card className="w-full min-w-0 min-h-dvh max-w-none break-words rounded-none border-0 shadow-none ring-0 sm:min-h-0 sm:max-w-md sm:rounded-xl sm:shadow-2xl/20 sm:ring-1">
        <AuthBackLink href={`/auth/login?email=${encodeURIComponent(email)}`} />
        <CardHeader className="min-w-0 px-4 text-center sm:px-6">
          <div className="mx-auto mb-4 size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Xác thực email</CardTitle>
          <CardDescription className="mt-2">
            Chúng tôi đã gửi mã 6 số đến{" "}
            <strong className="break-all text-foreground">{email}</strong>
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
              <span>Xác thực thành công! Đang chuyển hướng...</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex items-center justify-center flex-col"
          >
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              disabled={isLoading || success}
              className="w-full"
              containerClassName="w-full min-w-0"
            >
              <InputOTPGroup className="grid w-full min-w-0 grid-cols-6 gap-1.5 sm:gap-2">
                {[...new Array(6)].map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="h-11 w-full min-w-0 border p-0 text-lg font-bold sm:h-12"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>

            <Button
              type="submit"
              className="h-11 w-full px-4 py-2"
              size="lg"
              disabled={isLoading || success || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  "Đang xác thực..."
                </>
              ) : (
                "Xác thực"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Không nhận được mã?{" "}
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
            >
              {resendCooldown > 0 ? (
                <>Gửi lại sau {resendCooldown}s</>
              ) : (
                "Gửi lại mã"
              )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            Sai email?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline font-medium"
            >
              Đăng ký lại
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
