'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'FOR_PARTS', label: 'For Parts' },
];

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfo6u6pw4';

export default function AddItemPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'bartera_unsigned');
    formData.append('folder', 'bartera/items');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - imageUrls.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setUploading(true);
    setError(null);

    try {
      const urls = await Promise.all(filesToUpload.map(uploadImage));
      setImageUrls(prev => [...prev, ...urls]);
    } catch {
      setError('Failed to upload one or more images. Try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
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
    <div className="min-h-screen bg-[#fafafa] px-4 py-6 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/dashboard"
              className="text-[#8a9a8a] hover:text-gray-900 transition-colors"
            >
              ← Back to dashboard
            </Link>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">🎣</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cast Your Bait</h1>
            <p className="text-[#8a9a8a]">List an item you&apos;d like to trade</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-[#dbdbdb] rounded-xl p-6">
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
                className="w-full px-4 py-3 bg-[#fafafa] border border-[#dbdbdb] rounded-lg text-gray-900 placeholder-[#4a5a4a] focus:border-[#22c55e] focus:outline-none"
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
                Photos - Up to 5
              </label>
              
              {/* Image previews */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[#dbdbdb]">
                      <Image
                        src={url}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {imageUrls.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-8 border-2 border-dashed border-[#dbdbdb] rounded-lg text-center hover:border-[#22c55e] transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="text-[#8a9a8a]">
                      <div className="text-2xl mb-2">⏳</div>
                      <div>Uploading...</div>
                    </div>
                  ) : (
                    <div className="text-[#8a9a8a]">
                      <div className="text-3xl mb-2">📸</div>
                      <div className="font-medium">Tap to add photos</div>
                      <div className="text-xs mt-1">{imageUrls.length}/5 photos</div>
                    </div>
                  )}
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <p className="text-xs text-[#4a5a4a] mt-2">
                📸 Good photos get more swipes! Add up to 5 photos.
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
                className="w-full px-4 py-3 bg-[#fafafa] border border-[#dbdbdb] rounded-lg text-gray-900 focus:border-[#22c55e] focus:outline-none"
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
                className="w-full px-4 py-3 bg-[#fafafa] border border-[#dbdbdb] rounded-lg text-gray-900 placeholder-[#4a5a4a] focus:border-[#22c55e] focus:outline-none"
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
                className="w-full px-4 py-3 bg-[#fafafa] border border-[#dbdbdb] rounded-lg text-gray-900 placeholder-[#4a5a4a] focus:border-[#22c55e] focus:outline-none resize-none"
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
                className="w-full px-6 py-4 bg-[#22c55e] text-gray-900 rounded-xl text-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Casting Your Bait...' : '🎣 Cast Your Bait'}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-white border border-[#dbdbdb] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Tips for Great Bait</h3>
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