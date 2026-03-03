'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import TopBar from '@/components/top-bar'

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      // Fetch profile for bio
      fetch('/api/items', { credentials: 'include' }) // just to check auth
    }
  }, [session])

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Add profile update API when needed
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  if (!session?.user) return null

  return (
    <div className="min-h-screen bg-bt-background pb-24">
      <TopBar />
      
      <div className="max-w-md mx-auto" style={{ paddingTop: 'var(--bt-header-height)' }}>
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => router.back()} className="text-bt-accent font-medium text-sm">← Back</button>
          </div>
          <h1 className="bt-heading text-2xl text-bt-text-primary mt-3">Account Settings</h1>
          <p className="bt-caption">Manage your profile and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="mx-5 mb-4 bt-card p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-bt-accent flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {session.user.image ? (
                <Image src={session.user.image} alt={session.user.name || ''} width={64} height={64} className="object-cover w-full h-full" />
              ) : (
                (session.user.name || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="bt-heading text-lg text-bt-text-primary">{session.user.name}</h2>
              <p className="bt-small">{session.user.email}</p>
            </div>
          </div>

          {/* Name field */}
          <div className="mb-4">
            <label className="bt-label text-sm text-bt-text-secondary mb-1.5 block">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-bt-border bg-bt-surface text-bt-text-primary bt-body focus:border-bt-accent focus:ring-1 focus:ring-bt-accent/30 outline-none transition-all"
            />
          </div>

          {/* Bio field */}
          <div className="mb-4">
            <label className="bt-label text-sm text-bt-text-secondary mb-1.5 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people what you like to trade..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-bt-border bg-bt-surface text-bt-text-primary bt-body focus:border-bt-accent focus:ring-1 focus:ring-bt-accent/30 outline-none transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-bt-accent text-white font-semibold hover:bg-bt-accent-dark transition-colors disabled:opacity-50"
          >
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Account Actions */}
        <div className="mx-5 mb-4 bt-card overflow-hidden">
          <button
            onClick={() => router.push('/profile')}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-bt-surface-secondary transition-colors border-b border-bt-border-light"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">👤</span>
              <span className="bt-body text-bt-text-primary">View Profile</span>
            </div>
            <span className="text-bt-text-tertiary">→</span>
          </button>

          <button
            onClick={() => router.push('/notifications')}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-bt-surface-secondary transition-colors border-b border-bt-border-light"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <span className="bt-body text-bt-text-primary">Notifications</span>
            </div>
            <span className="text-bt-text-tertiary">→</span>
          </button>

          <button
            onClick={() => router.push('/circles')}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-bt-surface-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⭕</span>
              <span className="bt-body text-bt-text-primary">My Circles</span>
            </div>
            <span className="text-bt-text-tertiary">→</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mx-5 mb-4 bt-card overflow-hidden">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🚪</span>
              <span className="bt-body text-red-500 font-medium">Sign Out</span>
            </div>
          </button>
        </div>

        <p className="text-center bt-small mb-8">Bartera v1.0 🎣</p>
      </div>
    </div>
  )
}
