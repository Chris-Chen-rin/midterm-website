import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="container max-w-md py-12">
      <h1 className="text-3xl font-bold text-center mb-6">Authentication</h1>
      <AuthForm />
    </div>
  )
}
