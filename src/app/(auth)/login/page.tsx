'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/home')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/home' })
  }

  return (
    <div className="min-h-screen bg-ig-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="logo-font text-ig-primary mb-4">
            Bartera
          </div>
          <p className="text-ig-secondary text-sm">Sign in to see photos and items from your friends.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-ig-border rounded-lg p-8 mb-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded text-sm mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-ig-background border border-ig-border rounded text-sm text-ig-primary placeholder-ig-tertiary focus:outline-none focus:border-ig-secondary"
              placeholder="Phone number, username, or email"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-ig-background border border-ig-border rounded text-sm text-ig-primary placeholder-ig-tertiary focus:outline-none focus:border-ig-secondary"
              placeholder="Password"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors mt-4"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ig-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-ig-tertiary font-semibold">OR</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="mt-6 w-full flex justify-center items-center text-ig-primary text-sm font-semibold hover:text-ig-secondary transition-colors"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Log in with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-ig-link text-sm">
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Sign up link */}
        <div className="bg-white border border-ig-border rounded-lg p-6 text-center">
          <span className="text-sm text-ig-primary">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-ig-link font-semibold">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}