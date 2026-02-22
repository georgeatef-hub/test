'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'FOR_PARTS', label: 'For Parts' },
];

export default function AddItemPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const addImageUrlField = () => {
    if (imageUrls.length < 5) {
      setImageUrls([...imageUrls, '']);
    }
  };

  const removeImageUrlField = (index: number) => {
    if (imageUrls.length > 1) {
      const newUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newUrls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Process tags
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      // Process images (remove empty URLs)
      const images = imageUrls.filter(url => url.trim().length > 0);

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          condition,
          tags,
          images,
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create item');
      }
    } catch {
      setError('Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0a] px-4 py-6 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/dashboard"
              className="text-[#8a9a8a] hover:text-white transition-colors"
            >
              ← Back to dashboard
            </Link>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">🎣</div>
            <h1 className="text-3xl font-bold text-white mb-2">Cast Your Bait</h1>
            <p className="text-[#8a9a8a]">List an item you&apos;d like to trade</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#111a11] border border-[#1a2a1a] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#8a9a8a] mb-2">
                Item Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg text-white placeholder-[#4a5a4a] focus:border-[#22c55e] focus:outline-none"
                placeholder="e.g., iPhone 12 Pro, Vintage Leather Jacket"
                maxLength={100}
                required
              />
              <div className="text-xs text-[#4a5a4a] mt-1">
                {title.length}/100 characters
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-[#8a9a8a] mb-2">
                Photos (URLs) - Up to 5
              </label>
              <div className="space-y-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg text-white placeholder-[#4a5a4a] focus:border-[#22c55e] focus:outline-none"
                      placeholder="https://example.com/image.jpg"
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrlField(index)}
                        className="px-3 py-2 text-[#ef4444] hover:bg-[#ef4444] hover:bg-opacity-10 rounded-lg transition-colors"
                      >
                        ✗
                      </button>
                    )}
                  </div>
                ))}
                {imageUrls.length < 5 && (
                  <button
                    type="button"
                    onClick={addImageUrlField}
                    className="px-4 py-2 bg-[#1a2a1a] text-[#8a9a8a] rounded-lg hover:bg-[#2a3a2a] transition-colors text-sm"
                  >
                    + Add Photo URL
                  </button>
                )}
              </div>
              <p className="text-xs text-[#4a5a4a] mt-2">
                💡 Paste image URLs from the web. Good photos get more swipes!
              </p>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-[#8a9a8a] mb-2">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg text-white focus:border-[#22c55e] focus:outline-none"
                required
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-[#8a9a8a] mb-2">
                Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg text-white placeholder-[#4a5a4a] focus:border-[#22c55e] focus:outline-none"
                placeholder="electronics, apple, smartphone"
              />
              <p className="text-xs text-[#4a5a4a] mt-1">
                Separate tags with commas. Helps others find your item!
              </p>
              {tagsInput && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tagsInput.split(',').map((tag, index) => {
                    const cleanTag = tag.trim();
                    if (!cleanTag) return null;
                    return (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#22c55e] bg-opacity-20 text-[#22c55e] rounded text-sm"
                      >
                        {cleanTag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#8a9a8a] mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0f0a] border border-[#1a2a1a] rounded-lg text-white placeholder-[#4a5a4a] focus:border-[#22c55e] focus:outline-none resize-none"
                placeholder="Tell people more about your item, why you're trading it, any details that matter..."
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-[#4a5a4a] mt-1">
                {description.length}/500 characters
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-[#ef4444] text-sm bg-[#ef4444] bg-opacity-10 border border-[#ef4444] border-opacity-20 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="w-full px-6 py-4 bg-[#22c55e] text-white rounded-xl text-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Casting Your Bait...' : '🎣 Cast Your Bait'}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-[#111a11] border border-[#1a2a1a] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">💡 Tips for Great Bait</h3>
          <ul className="space-y-2 text-[#8a9a8a] text-sm">
            <li>• Use clear, well-lit photos showing the item&apos;s condition</li>
            <li>• Be honest about condition - trust builds better trades</li>
            <li>• Add relevant tags to help others find your item</li>
            <li>• Include details like size, color, brand if relevant</li>
            <li>• Mention why you&apos;re trading it (upgrading, no longer need, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}