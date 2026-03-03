'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // TODO: Implement actual password reset API
      // For now, simulate sending
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">Bartera</h1>
          <p className="text-gray-500 mt-2">Reset your password</p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-sm border-2 border-gray-100 text-center"
          >
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 mb-6">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent password reset instructions.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 bg-gray-900 text-white rounded-2xl font-bold text-center hover:bg-gray-800 transition-colors"
            >
              Back to Login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                ← Back to Login
              </Link>
            </div>
          </form>
        )}

        <p className="text-center mt-6 text-xs text-gray-400">
          Trade responsibly • Connect authentically • Build community
        </p>
      </motion.div>
    </div>
  )
}
