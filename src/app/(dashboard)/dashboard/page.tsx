'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
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
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-[#FF6B4A] text-lg">Loading your fishing stats...</div>
      </div>
    );
  }

  // Find most active circle for "Start Swiping" button
  const mostActiveCircle = circles.reduce((prev, current) => 
    (current.itemCount > prev.itemCount) ? current : prev
  , circles[0]);

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name}! 🎣
          </h1>
          <p className="text-[#8a9a8a]">Ready to make some trades?</p>
        </div>

        {/* Bait Score Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-[#dbdbdb] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-4xl">{dashboardData?.levelEmoji || '🐟'}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-[#FF6B4A]">
                      {dashboardData?.fishingLevel || 'Rookie Fisher'}
                    </h2>
                    <p className="text-[#8a9a8a]">
                      {items.length} items as bait
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-[#f5f5f5] rounded-full h-2 mb-2">
                  <div 
                    className="bg-[#FF6B4A] h-2 rounded-full transition-all duration-500"
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
                className="bg-[#FF6B4A] text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-[#E55A41] transition-colors"
              >
                + Add Bait
              </Link>
            </div>
          </div>
        </div>

        {/* Your Circles Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Circles</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {circles.map((circle) => (
              <Link
                key={circle.id}
                href={`/circles/${circle.id}`}
                className="bg-white border border-[#dbdbdb] rounded-xl p-4 hover:bg-[#f5f5f5] transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#FF6B4A] transition-colors">
                    {circle.name}
                  </h3>
                  <div className="text-[#8a9a8a] group-hover:text-[#FF6B4A] transition-colors">
                    →
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-[#8a9a8a]">
                  <p>{circle.memberCount} members</p>
                  <p>{circle.itemCount} items</p>
                  {circle.itemCount > 0 && (
                    <span className="inline-block bg-[#FF6B4A] bg-opacity-20 text-[#FF6B4A] px-2 py-1 rounded text-xs">
                      New items available!
                    </span>
                  )}
                </div>
              </Link>
            ))}
            
            {/* Create Circle Card */}
            <button className="bg-white border border-[#dbdbdb] border-dashed rounded-xl p-4 hover:bg-[#f5f5f5] transition-colors group text-center">
              <div className="text-3xl text-[#FF6B4A] mb-2 group-hover:scale-110 transition-transform">
                +
              </div>
              <p className="text-[#8a9a8a] group-hover:text-gray-900 transition-colors">
                Create Circle
              </p>
            </button>
          </div>
        </div>

        {/* Your Bait Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Bait</h2>
            <Link
              href="/dashboard/add-item"
              className="text-[#FF6B4A] text-sm hover:text-[#E55A41] transition-colors"
            >
              + Add more
            </Link>
          </div>
          
          {items.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 bg-white border border-[#dbdbdb] rounded-xl p-3 w-40"
                >
                  <div className="w-full h-24 bg-[#f5f5f5] rounded-lg mb-2 flex items-center justify-center relative">
                    {item.images.length > 0 ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 truncate mb-1">
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
            <div className="bg-white border border-[#dbdbdb] border-dashed rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🎣</div>
              <p className="text-[#8a9a8a] mb-4">No bait cast yet!</p>
              <Link
                href="/dashboard/add-item"
                className="bg-[#FF6B4A] text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-[#E55A41] transition-colors"
              >
                Cast Your First Bait
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[#dbdbdb] p-4 text-center">
            <div className="text-2xl font-bold text-[#FF6B4A]">{items.length}</div>
            <div className="text-sm text-[#8a9a8a]">Items</div>
          </div>
          <div className="bg-white rounded-xl border border-[#dbdbdb] p-4 text-center">
            <div className="text-2xl font-bold text-[#f59e0b]">{dashboardData?.catchesCount || 0}</div>
            <div className="text-sm text-[#8a9a8a]">Catches</div>
          </div>
          <div className="bg-white rounded-xl border border-[#dbdbdb] p-4 text-center">
            <div className="text-2xl font-bold text-[#FF6B4A]">{dashboardData?.tradesCompleted || 0}</div>
            <div className="text-sm text-[#8a9a8a]">Trades</div>
          </div>
          <div className="bg-white rounded-xl border border-[#dbdbdb] p-4 text-center">
            <div className="text-2xl font-bold text-[#FF6B4A]">{dashboardData?.streakDays || 0}</div>
            <div className="text-sm text-[#8a9a8a]">Day Streak</div>
          </div>
        </div>

        {/* Start Swiping CTA */}
        {mostActiveCircle && (
          <div className="text-center">
            <Link
              href={`/circles/${mostActiveCircle.id}/swipe`}
              className="inline-block bg-[#FF6B4A] text-gray-900 px-8 py-3 rounded-xl text-lg font-bold hover:bg-[#E55A41] transition-colors shadow-lg"
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