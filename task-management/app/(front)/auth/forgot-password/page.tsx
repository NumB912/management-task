"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/app/(front)/components/ui/button"
import { Input } from "@/app/(front)/components/ui/input"
import { Label } from "@/app/(front)/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/(front)/components/ui/card"
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/sendResetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Không thể gửi email")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <Card className="w-full min-w-md shadow-2xl/20 border-0">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Quên mật khẩu</CardTitle>
          <CardDescription className="mt-2">
            {success
              ? "Kiểm tra email để đặt lại mật khẩu"
              : "Nhập email để nhận link đặt lại mật khẩu"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className={cn("flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg")}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={cn("flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg")}>
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Đã gửi link đặt lại mật khẩu tới email của bạn</span>
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
                    placeholder="nhap@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-5 pl-9"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full p-5" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    "Đang gửi..."
                  </>
                ) : (
                  "Gửi link đặt lại mật khẩu"
                )}
              </Button>
            </form>
          )}

          <Button variant="outline" className="w-full p-5" asChild>
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}