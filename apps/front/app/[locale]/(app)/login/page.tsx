import { type Metadata } from "next"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login — Geo Gamer",
  description: "Sign in to your Geo Gamer account to track your daily challenge streak, save your scores, and challenge friends.",
}

export default function LoginPage() {
  return (
    <div className="bg-muted flex h-full-height flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
