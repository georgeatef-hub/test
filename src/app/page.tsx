'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [animationStep, setAnimationStep] = useState(0)

  // Animate card stack on load
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 3)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0f0a]">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#1a2a1a]">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            Bar<span className="text-green-500">tera</span>
          </div>
          <div className="space-x-4">
            <Link 
              href="/login" 
              className="text-white hover:text-green-500 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-6xl font-bold text-white mb-6">
                <span className="text-green-500">Swipe</span>. Match.{' '}
                <span className="text-green-500">Trade</span>.
              </h1>
              <p className="text-xl text-gray-300 mb-12">
                The smartest way to trade items with your community. 
                Just swipe, get matched, and trade in perfect circles.
              </p>
              <Link 
                href="/register" 
                className="inline-block bg-green-500 text-white px-8 py-4 text-lg rounded-lg hover:bg-green-600 transition-colors"
              >
                Start Trading
              </Link>
            </div>

            {/* Animated Card Stack */}
            <div className="relative h-96 flex items-center justify-center">
              <div className="relative w-64 h-80">
                {/* Card stack background cards */}
                <div className="absolute inset-0 bg-[#111a11] border border-[#1a2a1a] rounded-xl transform rotate-3 opacity-30"></div>
                <div className="absolute inset-0 bg-[#111a11] border border-[#1a2a1a] rounded-xl transform rotate-1 opacity-60"></div>
                
                {/* Active card */}
                <div 
                  className={`absolute inset-0 bg-[#111a11] border-2 border-green-500 rounded-xl p-6 transition-transform duration-500 ${
                    animationStep === 1 ? 'translate-x-24 rotate-12 opacity-0' : 
                    animationStep === 2 ? '-translate-x-24 -rotate-12 opacity-0' : 
                    'translate-x-0 rotate-0'
                  }`}
                >
                  <div className="h-full flex flex-col">
                    <div className="bg-[#0a0f0a] h-32 rounded-lg mb-4 flex items-center justify-center text-4xl">
                      📚
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Programming Book</h3>
                    <p className="text-gray-400 text-sm mb-3">React &amp; Next.js guide</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-500">📚 Books</span>
                      <span className="text-gray-500">Like New</span>
                    </div>
                    <div className="mt-auto pt-4">
                      <div className="text-xs text-gray-400 mb-2">By Sarah • NYC</div>
                      <div className="text-xs text-amber-400">🔥 12 people want this</div>
                    </div>
                  </div>
                </div>

                {/* Swipe indicators */}
                <div className={`absolute -right-8 top-1/2 transform -translate-y-1/2 text-6xl transition-opacity duration-300 ${animationStep === 1 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="bg-green-500 rounded-full p-2">
                    <span className="text-white text-2xl">✓</span>
                  </div>
                </div>
                <div className={`absolute -left-8 top-1/2 transform -translate-y-1/2 text-6xl transition-opacity duration-300 ${animationStep === 2 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="bg-red-500 rounded-full p-2">
                    <span className="text-white text-2xl">✗</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-[#111a11]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                🎣
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Cast your bait</h3>
              <p className="text-gray-300">
                List items you don't need anymore. Your "bait" attracts others to trade with you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                👆
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Swipe to catch</h3>
              <p className="text-gray-300">
                Swipe right on items you want. Build your wishlist by catching what interests you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                🎉
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Get matched!</h3>
              <p className="text-gray-300">
                Our algorithm finds trade circles where everyone gets what they want.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8">
                Join the Trading Revolution
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">1,247</div>
                  <div className="text-gray-400">Items listed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">389</div>
                  <div className="text-gray-400">Trades completed</div>
                </div>
              </div>
            </div>

            {/* Trade Circle Visualization */}
            <div className="relative max-w-md mx-auto">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 rounded-full border-4 border-green-500 opacity-30"></div>
                
                {/* User A */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                  <div className="w-16 h-16 bg-[#111a11] border-2 border-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div className="text-sm text-gray-300 mt-2 text-center">Has: Book<br/>Wants: Game</div>
                </div>
                
                {/* User B */}
                <div className="absolute top-1/2 right-0 transform translate-x-4 -translate-y-1/2">
                  <div className="w-16 h-16 bg-[#111a11] border-2 border-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">B</span>
                  </div>
                  <div className="text-sm text-gray-300 mt-2 text-center">Has: Phone<br/>Wants: Book</div>
                </div>
                
                {/* User C */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4">
                  <div className="w-16 h-16 bg-[#111a11] border-2 border-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">C</span>
                  </div>
                  <div className="text-sm text-gray-300 mt-2 text-center">Has: Game<br/>Wants: Phone</div>
                </div>
                
                {/* Arrows */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-green-500 text-6xl font-thin">
                    ↻
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-[#111a11]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Cast your bait, swipe to catch, and get matched instantly
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-green-500 text-white px-8 py-4 text-lg rounded-lg hover:bg-green-600 transition-colors"
          >
            Start Trading
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-[#1a2a1a]">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 Bartera. Built for the community, by the community.</p>
        </div>
      </footer>
    </div>
  )
}