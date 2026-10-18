"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/app/(front)/components/ui/button"
import { Input } from "@/app/(front)/components/ui/input"
import { Label } from "@/app/(front)/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/(front)/components/ui/card"
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import useUserState from "../../feature/store/user/user.state"
import Image from "next/image"


function getLoginErrorMessage(error: unknown): string {
  const err = error as {
    status?: number
    response?: { status?: number; data?: { message?: string } }
    message?: string
  }
  const status = err?.response?.status ?? err?.status

  if (status === 400 || status === 401 || status === 404) {
    return "Email hoặc mật khẩu không chính xác"
  }
  if (status === 429) {
    return "Bạn thử quá nhiều lần, vui lòng đợi một lúc rồi thử lại"
  }
  if (status && status >= 500) {
    return "Máy chủ đang gặp sự cố, vui lòng thử lại sau"
  }
  if (err?.message === "Network Error" || err?.message === "Failed to fetch") {
    return "Không thể kết nối tới máy chủ, kiểm tra lại mạng của bạn"
  }
  return err?.response?.data?.message ?? "Đăng nhập thất bại, vui lòng thử lại"
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [googleError, setGoogleError] = useState("")
  const [googlePending, setGooglePending] = useState(false)

  useEffect(() => {
    const url = new URL(window.location.href)
    const error = url.searchParams.get("google_error")
    if (!error) return
    setGoogleError(error === "email_exists"
      ? "Email này đã có tài khoản. Hãy đăng nhập bằng mật khẩu, sau đó mở Profile để liên kết Google."
      : error === "unavailable"
        ? "Đăng nhập Google chưa được cấu hình. Vui lòng thử cách đăng nhập bằng email."
        : "Đăng nhập Google chưa thành công hoặc đã bị hủy. Vui lòng thử lại.")
    url.searchParams.delete("google_error")
    window.history.replaceState(null, "", url.toString())
  }, [])

  const loginGoogle = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      setGoogleError("Chưa cấu hình địa chỉ máy chủ đăng nhập.")
      return
    }
    setGooglePending(true)
    window.location.assign(`${apiUrl.replace(/\/$/, "")}/auth/google`)
  }

  const fetchUser = useUserState((state) => state.fetchUser)
  const loginFn = useUserState((state) => state.login)
  const {
    mutate: login,
    isPending,
    error,
    isError,
    reset,
  } = useMutation({
    mutationFn: (payload: { email: string; password: string }) => loginFn(payload),
    onSuccess: async () => {
      await fetchUser()
      router.replace("/dashboard")
    },
    onError: (err) => {
      console.error("[Login] error:", err)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email: email.trim(), password })
  }

  const clearError = () => {
    if (isError) reset()
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
          {googleError && <p role="alert" className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{googleError}</p>}
          <Button type="button" variant="outline" className="w-full" onClick={loginGoogle} disabled={isPending || googlePending}>
            {googlePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Image src="/google.svg" alt="" width={20} height={20} /> Tiếp tục với Google
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />hoặc đăng nhập bằng email<span className="h-px flex-1 bg-border" />
          </div>
          {isError && (
            <div
              role="alert"
              className={cn("flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg")}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{getLoginErrorMessage(error)}</span>
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
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearError()
                  }}
                  className="p-5 pl-9"
                  required
                  autoComplete="email"
                  disabled={isPending}
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
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearError()
                  }}
                  className="p-5 pl-9"
                  required
                  autoComplete="current-password"
                  disabled={isPending}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full p-5 focus:transition-all focus:scale-95"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
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
