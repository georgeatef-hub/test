'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen bg-bt-background flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full"
      >
        {/* Header with logo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          {/* Logo with icon */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-bt-accent rounded-2xl flex items-center justify-center shadow-lg">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M8 3L4 7l4 4"/>
                <path d="M4 7h11a4 4 0 0 1 4 4v1"/>
                <path d="M16 21l4-4-4-4"/>
                <path d="M20 17H9a4 4 0 0 1-4-4v-1"/>
              </svg>
            </div>
            <h1 className="bt-logo text-3xl">Bartera</h1>
          </div>
          
          <p className="bt-body text-bt-text-secondary">
            Sign in to start trading with friends
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bt-card p-8 mb-6"
        >
          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="
                bg-bt-error/10 border border-bt-error/20 text-bt-error 
                p-4 rounded-xl text-sm mb-6 text-center
              "
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="bt-label text-sm text-bt-text-secondary mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bt-input"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="bt-label text-sm text-bt-text-secondary mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bt-input"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bt-button bt-button-primary w-full mt-8"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-bt-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-bt-surface bt-label text-bt-text-tertiary">
                  OR
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              className="
                bt-button w-full mt-6 bg-white border-2 border-bt-border 
                text-bt-text-primary hover:border-bt-accent hover:bg-bt-accent/5
              "
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Forgot password */}
          <div className="mt-8 text-center">
            <Link 
              href="/forgot-password" 
              className="bt-body text-bt-text-secondary hover:text-bt-accent transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </div>
        </motion.div>

        {/* Sign up link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bt-card p-6 text-center"
        >
          <span className="bt-body text-bt-text-secondary">
            New to Bartera?{' '}
            <Link 
              href="/register" 
              className="text-bt-accent font-medium hover:text-bt-accent-dark transition-colors duration-200"
            >
              Create account
            </Link>
          </span>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="bt-small text-bt-text-tertiary">
            Trade responsibly • Connect authentically • Build community
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}