import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(email, password)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div id="form-signin">
      <div className="mb-3">
        <h2 className="text-lg sm:text-xl font-bold font-headline-sm text-slate-900 dark:text-white tracking-tight">
          Welcome back
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-body-sm mt-0.5">
          Enter your clinical credentials to access your patient charts.
        </p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Hospital Email
          </label>
          <Input
            type="email"
            icon="mail"
            placeholder="dr.sterling@metrohealth.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-2 text-[13px]"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <a className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline" href="#">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              icon="lock"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="py-2 text-[13px]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 focus:ring-2"
            />
            <span className="text-[13px] text-slate-600 dark:text-slate-400">
              Remember this clinical workstation
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="voice"
          className="w-full"
          isLoading={isLoading}
          icon="arrow_forward"
        >
          Sign In to Workspace
        </Button>
      </form>
    </div>
  )
}
