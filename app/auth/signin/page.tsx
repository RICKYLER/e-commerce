'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      // Handle login
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-serif text-4xl text-foreground">
              Welcome Back
            </h1>
            <p className="text-foreground/60">
              Sign in to your Pure Path account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-foreground/70">
                  Remember me
                </span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-accent hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-foreground/60">
                New to Pure Path?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Button
            asChild
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Link href="/auth/signup">Create Account</Link>
          </Button>

          {/* Footer */}
          <p className="text-center text-xs text-foreground/50">
            By signing in, you agree to our{' '}
            <Link href="#" className="underline hover:text-foreground/70">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="underline hover:text-foreground/70">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
