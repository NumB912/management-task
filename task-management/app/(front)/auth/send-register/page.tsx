"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/app/(front)/components/ui/button"
import { Input } from "@/app/(front)/components/ui/input"
import { Label } from "@/app/(front)/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/(front)/components/ui/card"
import { Mail, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
export default function SendRegisterPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/sendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error("Failed to send reset email")
      await new Promise(resolve => setTimeout(resolve, 1000))

      const {email:emailResponse} = await response.json()
      window.location.href = `/auth/otp?email=${emailResponse}`
      setSuccess(true)
    } catch {
      setError("Không thể gửi email yêu cầu mã xác nhận")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full min-w-md  shadow-2xl/20 border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Gửi yêu cầu đăng ký</CardTitle>
          <CardDescription className="mt-2">
            {success
              ? "Kiểm tra email để đăng ký tài khoản"
              : "Nhập email để nhận link đăng ký tài khoản"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className={cn("flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg")}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <span>Đã gửi link đăng ký tới email của bạn</span>
            </div>
          ) : (
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

              <Button type="submit" className="w-full p-5 focus:transition-all focus:scale-95" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    "Đang gửi..."
                  </>
                ) : (
                  "Gửi lại link đăng ký"
                )}
              </Button>
            </form>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Hoặc</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full p-5 focus:transition-all focus:scale-95"
            asChild
          >
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