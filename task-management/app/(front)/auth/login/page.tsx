"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/app/(front)/components/ui/button"
import { Input } from "@/app/(front)/components/ui/input"
import { Label } from "@/app/(front)/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/(front)/components/ui/card"
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import useUserState from "../../states/user/user.state"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fetchUser = useUserState((state)=>state.fetchUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) throw new Error("Invalid credentials")
      await fetchUser()
      router.push("/dashboard") 
    } catch {
      setError("Email hoặc mật khẩu không chính xác")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className={cn("w-full min-w-md shadow-2xl/20 border-0")}>
        <CardHeader className="text-center pt-5 px-10">
          <CardTitle className="text-3xl font-bold">Đăng nhập</CardTitle>
          <CardDescription className="mt-2">
            Đăng nhập để tiếp tục sử dụng ứng dụng
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-5 px-10">
          {error && (
            <div className={cn("flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg")}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-5 pl-9"
                  required
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button type="submit" className="w-full p-5 focus:transition-all focus:scale-95" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>Đăng nhập</>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2 bg-primary/5">
          <p className="text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/auth/send-register" className="text-primary hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}