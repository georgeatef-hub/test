'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (session) {
      router.push('/home') // Redirect to feed if authenticated
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-[#22c55e] text-lg">Loading...</div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect
  }
  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center">
        <div className="text-xl font-bold text-[#22c55e]">
          Bartera 🎣
        </div>
        <div className="space-x-4">
          <Link 
            href="/login"
            className="px-4 py-2 text-[#8a9a8a] hover:text-gray-900 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/register"
            className="px-6 py-2 bg-[#22c55e] text-gray-900 rounded-xl font-medium hover:bg-green-600 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center px-6 py-20">
        <motion.h1 
          className="text-6xl md:text-8xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#22c55e]">Swipe.</span>
          <br />
          <span className="text-[#22c55e]">Match.</span>
          <br />
          <span className="text-[#22c55e]">Trade.</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-[#8a9a8a] mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Trade items with friends through trusted circles. No money needed.
        </motion.p>

        {/* Animated Cards Visual */}
        <motion.div 
          className="relative mx-auto mb-16 w-80 h-96"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Card Stack */}
          <div className="absolute inset-0">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-full h-full bg-white rounded-xl border border-[#dbdbdb] shadow-lg"
                style={{
                  zIndex: 3 - i,
                  transform: `translateY(${i * 8}px) scale(${1 - i * 0.05})`,
                }}
                animate={{
                  x: i === 0 ? [0, 20, -20, 0] : 0,
                  rotate: i === 0 ? [0, 5, -5, 0] : 0,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="w-full h-48 bg-[#f5f5f5] rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">📱</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">iPhone 12</h3>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-[#22c55e] bg-opacity-20 text-[#22c55e] text-xs rounded-lg">
                      electronics
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-[#22c55e] rounded-full"></div>
                      <span className="text-sm text-[#8a9a8a]">Alice</span>
                    </div>
                    <span className="text-sm text-[#f59e0b]">🔥 3 want this</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link 
            href="/register"
            className="inline-block px-8 py-4 bg-[#22c55e] text-gray-900 text-xl font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg"
          >
            Start Trading
          </Link>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-white bg-opacity-50">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            How It Works
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                emoji: '🎣',
                title: 'Cast Your Bait',
                description: 'List items you don\'t need anymore. From gadgets to clothes, everything has value to someone.'
              },
              {
                emoji: '⭕',
                title: 'Create Your Circle',
                description: 'Invite friends, family, or community members you trust. Trading works best with people you know.'
              },
              {
                emoji: '🎉',
                title: 'Get Matched!',
                description: 'Our smart algorithm finds trade chains. You might trade with Alice to get what Bob has for Carol!'
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
              >
                <div className="text-6xl mb-6">{step.emoji}</div>
                <h3 className="text-2xl font-bold mb-4 text-[#22c55e]">{step.title}</h3>
                <p className="text-[#8a9a8a] text-lg leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-6 text-center text-[#4a5a4a] border-t border-[#dbdbdb]">
        <p>&copy; 2024 Bartera. Made with 💚 for sustainable trading.</p>
      </footer>
    </div>
  );
}