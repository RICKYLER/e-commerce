'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      // Handle signup
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
              Create Account
            </h1>
            <p className="text-foreground/60">
              Join Pure Path and discover your perfect scent
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-foreground/70">
                I agree to the{' '}
                <Link href="#" className="underline hover:text-foreground">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-foreground/60">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
