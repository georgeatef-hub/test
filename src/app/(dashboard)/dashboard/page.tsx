'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { DashboardData, Circle, Item } from '@/types';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const dashboardRes = await fetch('/api/dashboard', {
        credentials: 'include'
      });
      if (dashboardRes.ok) {
        const dashboard = await dashboardRes.json();
        setDashboardData(dashboard);
      }

      // Fetch user items
      const itemsRes = await fetch('/api/items', {
        credentials: 'include'
      });
      if (itemsRes.ok) {
        const userItems = await itemsRes.json();
        setItems(userItems);
      }

      // Fetch circles
      const circlesRes = await fetch('/api/circles', {
        credentials: 'include'
      });
      if (circlesRes.ok) {
        const userCircles = await circlesRes.json();
        setCircles(userCircles);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
        <div className="text-[#22c55e] text-lg">Loading your fishing stats...</div>
      </div>
    );
  }

  // Find most active circle for "Start Swiping" button
  const mostActiveCircle = circles.reduce((prev, current) => 
    (current.itemCount > prev.itemCount) ? current : prev
  , circles[0]);

  return (
    <div className="min-h-screen bg-[#0a0f0a] px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name}! 🎣
          </h1>
          <p className="text-[#8a9a8a]">Ready to make some trades?</p>
        </div>

        {/* Bait Score Section */}
        <div className="mb-8">
          <div className="bg-[#111a11] rounded-xl border border-[#1a2a1a] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-4xl">{dashboardData?.levelEmoji || '🐟'}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-[#22c55e]">
                      {dashboardData?.fishingLevel || 'Rookie Fisher'}
                    </h2>
                    <p className="text-[#8a9a8a]">
                      {items.length} items as bait
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-[#1a2a1a] rounded-full h-2 mb-2">
                  <div 
                    className="bg-[#22c55e] h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((dashboardData?.baitScore || 0) % 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-[#4a5a4a]">
                  {100 - ((dashboardData?.baitScore || 0) % 100)} points to next level
                </p>
              </div>
              
              <Link
                href="/dashboard/add-item"
                className="bg-[#22c55e] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                + Add Bait
              </Link>
            </div>
          </div>
        </div>

        {/* Your Circles Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Your Circles</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {circles.map((circle) => (
              <Link
                key={circle.id}
                href={`/circles/${circle.id}`}
                className="bg-[#111a11] border border-[#1a2a1a] rounded-xl p-4 hover:bg-[#1a2a1a] transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white group-hover:text-[#22c55e] transition-colors">
                    {circle.name}
                  </h3>
                  <div className="text-[#8a9a8a] group-hover:text-[#22c55e] transition-colors">
                    →
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-[#8a9a8a]">
                  <p>{circle.memberCount} members</p>
                  <p>{circle.itemCount} items</p>
                  {circle.itemCount > 0 && (
                    <span className="inline-block bg-[#22c55e] bg-opacity-20 text-[#22c55e] px-2 py-1 rounded text-xs">
                      New items available!
                    </span>
                  )}
                </div>
              </Link>
            ))}
            
            {/* Create Circle Card */}
            <button className="bg-[#111a11] border border-[#1a2a1a] border-dashed rounded-xl p-4 hover:bg-[#1a2a1a] transition-colors group text-center">
              <div className="text-3xl text-[#22c55e] mb-2 group-hover:scale-110 transition-transform">
                +
              </div>
              <p className="text-[#8a9a8a] group-hover:text-white transition-colors">
                Create Circle
              </p>
            </button>
          </div>
        </div>

        {/* Your Bait Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Your Bait</h2>
            <Link
              href="/dashboard/add-item"
              className="text-[#22c55e] text-sm hover:text-green-400 transition-colors"
            >
              + Add more
            </Link>
          </div>
          
          {items.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 bg-[#111a11] border border-[#1a2a1a] rounded-xl p-3 w-40"
                >
                  <div className="w-full h-24 bg-[#1a2a1a] rounded-lg mb-2 flex items-center justify-center">
                    {item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-white truncate mb-1">
                    {item.title}
                  </h3>
                  {item.wantCount > 0 && (
                    <p className="text-xs text-[#f59e0b]">
                      🔥 {item.wantCount} want this
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#111a11] border border-[#1a2a1a] border-dashed rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🎣</div>
              <p className="text-[#8a9a8a] mb-4">No bait cast yet!</p>
              <Link
                href="/dashboard/add-item"
                className="bg-[#22c55e] text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Cast Your First Bait
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111a11] rounded-xl border border-[#1a2a1a] p-4 text-center">
            <div className="text-2xl font-bold text-[#22c55e]">{items.length}</div>
            <div className="text-sm text-[#8a9a8a]">Items</div>
          </div>
          <div className="bg-[#111a11] rounded-xl border border-[#1a2a1a] p-4 text-center">
            <div className="text-2xl font-bold text-[#f59e0b]">{dashboardData?.catchesCount || 0}</div>
            <div className="text-sm text-[#8a9a8a]">Catches</div>
          </div>
          <div className="bg-[#111a11] rounded-xl border border-[#1a2a1a] p-4 text-center">
            <div className="text-2xl font-bold text-[#22c55e]">{dashboardData?.tradesCompleted || 0}</div>
            <div className="text-sm text-[#8a9a8a]">Trades</div>
          </div>
          <div className="bg-[#111a11] rounded-xl border border-[#1a2a1a] p-4 text-center">
            <div className="text-2xl font-bold text-[#22c55e]">{dashboardData?.streakDays || 0}</div>
            <div className="text-sm text-[#8a9a8a]">Day Streak</div>
          </div>
        </div>

        {/* Start Swiping CTA */}
        {mostActiveCircle && (
          <div className="text-center">
            <Link
              href={`/circles/${mostActiveCircle.id}/swipe`}
              className="inline-block bg-[#22c55e] text-white px-8 py-3 rounded-xl text-lg font-bold hover:bg-green-600 transition-colors shadow-lg"
            >
              Start Swiping →
            </Link>
            <p className="text-[#8a9a8a] text-sm mt-2">
              {mostActiveCircle.itemCount} items waiting in {mostActiveCircle.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}