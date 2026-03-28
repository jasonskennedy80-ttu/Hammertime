import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline'
import { signIn } from '@/services/auth.service'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/router/routes'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password is required'),
})
type LoginValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: LoginValues) {
    setError(null)
    try {
      await signIn(values.email, values.password)
      const redirect = searchParams.get('redirect') ?? ROUTES.dashboard
      navigate(redirect, { replace: true })
    } catch {
      setError('Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <WrenchScrewdriverIcon className="h-8 w-8 text-sky-600" />
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">Hammertime</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Construction Business Management</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-5">Sign in</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Email" required error={errors.email?.message}>
              <Input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                hasError={!!errors.email}
              />
            </FormField>
            <FormField label="Password" required error={errors.password?.message}>
              <Input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                hasError={!!errors.password}
              />
            </FormField>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
