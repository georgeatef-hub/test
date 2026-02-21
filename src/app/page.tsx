import Link from 'next/link'

export default function HomePage() {
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
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            Trade what you have for{' '}
            <span className="text-green-500">what you need</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join the future of bartering. Connect with people in your community 
            through smart circular trades that benefit everyone.
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-green-500 text-white px-8 py-4 text-lg rounded-lg hover:bg-green-600 transition-colors"
          >
            Start Trading Today
          </Link>
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
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">List Your Items</h3>
              <p className="text-gray-300">
                Add items you no longer need. Upload photos, set condition, 
                and describe what you&apos;re offering to the community.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Browse & Pick</h3>
              <p className="text-gray-300">
                Explore items from other users. Mark things you want and 
                build your wishlist of desired trades.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Get Matched</h3>
              <p className="text-gray-300">
                Our smart algorithm finds circular trades where everyone gets 
                what they want. Confirm your participation and trade!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Circular Trade Visualization */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-16">
            Smart Circular Trading
          </h2>
          
          <div className="relative max-w-2xl mx-auto">
            {/* Circle visualization */}
            <div className="relative w-80 h-80 mx-auto">
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
            
            <p className="text-gray-300 mt-8 text-lg">
              Everyone gets what they want in a single coordinated trade cycle
            </p>
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
            Join our community and discover the power of circular bartering
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-green-500 text-white px-8 py-4 text-lg rounded-lg hover:bg-green-600 transition-colors"
          >
            Create Your Account
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