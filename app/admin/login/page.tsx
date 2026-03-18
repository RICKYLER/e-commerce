'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function AdminLoginPage() {
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-4xl text-foreground">
            Pure Path Admin
          </h1>
          <p className="text-foreground/60">
            Sign in to manage your store
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg p-8 border border-border">
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
              placeholder="admin@pureimage.com"
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium text-foreground/60 uppercase">Demo Credentials</p>
          <p className="text-sm text-foreground/70">Email: admin@pureimage.com</p>
          <p className="text-sm text-foreground/70">Password: demo1234</p>
        </div>
      </div>
    </div>
  )
}
