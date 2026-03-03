'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Circle } from '@/types';
import InviteModal from '@/components/invite-modal';
import Image from 'next/image';
import TopBar from '@/components/top-bar';

interface CircleItem {
  id: string;
  title: string;
  description?: string;
  condition: string;
  images: string[];
  createdAt: string;
  user: { id: string; name: string; image?: string };
  _count: { swipes: number };
}

export default function CircleDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const circleId = params.id as string;

  const [circle, setCircle] = useState<Circle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [circleItems, setCircleItems] = useState<CircleItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    if (session && circleId) {
      fetchCircle();
      fetchCircleItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, circleId]);

  const fetchCircle = async () => {
    try {
      const res = await fetch(`/api/circles/${circleId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCircle(data);
        setEditName(data.name);
        setEditDescription(data.description || '');
      } else { router.push('/circles'); }
    } catch { router.push('/circles'); }
    finally { setLoading(false); }
  };

  const fetchCircleItems = async () => {
    try {
      const res = await fetch(`/api/circles/${circleId}/items`, { credentials: 'include' });
      if (res.ok) setCircleItems(await res.json());
    } catch (e) { console.error(e); }
    finally { setItemsLoading(false); }
  };

  const isAdmin = circle?.adminId === session?.user?.id;

  const handleLeaveCircle = async () => {
    if (!circle) return;
    const res = await fetch(`/api/circles/${circle.id}/leave`, { method: 'POST', credentials: 'include' });
    if (res.ok) router.push('/circles');
  };

  const handleRemoveMember = async (userId: string) => {
    if (!circle || !confirm('Remove this member?')) return;
    const res = await fetch(`/api/circles/${circle.id}/members/${userId}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      setCircle(prev => prev ? {
        ...prev,
        members: prev.members?.filter(m => m.userId !== userId) || [],
        memberCount: prev.memberCount - 1
      } : null);
    }
  };

  const handleUpdateCircle = async () => {
    if (!circle || !editName.trim()) return;
    const res = await fetch(`/api/circles/${circle.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name: editName.trim(), description: editDescription.trim() || undefined }),
    });
    if (res.ok) { setCircle(await res.json()); setEditMode(false); }
  };

  const handleDeleteCircle = async () => {
    if (!circle) return;
    const res = await fetch(`/api/circles/${circle.id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) router.push('/circles');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bt-background">
        <TopBar />
        <div className="flex items-center justify-center" style={{ paddingTop: '120px' }}>
          <div className="w-8 h-8 border-3 border-bt-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!circle) return null;

  return (
    <div className="min-h-screen bg-bt-background pb-24">
      <TopBar />

      <div className="max-w-md mx-auto" style={{ paddingTop: 'var(--bt-header-height)' }}>
        {/* Back */}
        <div className="px-5 pt-4 pb-2">
          <button onClick={() => router.push('/circles')} className="text-bt-accent font-medium text-sm">← Circles</button>
        </div>

        {/* Circle Header Card */}
        <div className="mx-5 mb-4 bt-card p-5">
          {editMode ? (
            <div className="space-y-3">
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-bt-border bg-bt-surface bt-heading text-lg text-bt-text-primary focus:border-bt-accent outline-none" maxLength={50} />
              <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-bt-border bg-bt-surface bt-body text-sm text-bt-text-secondary resize-none focus:border-bt-accent outline-none" rows={2} placeholder="Description..." maxLength={200} />
              <div className="flex gap-2">
                <button onClick={handleUpdateCircle} className="flex-1 py-2 rounded-xl bg-bt-accent text-white font-semibold text-sm">Save</button>
                <button onClick={() => { setEditMode(false); setEditName(circle.name); setEditDescription(circle.description || ''); }}
                  className="flex-1 py-2 rounded-xl bg-bt-surface-secondary text-bt-text-secondary font-medium text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {/* Circle avatar + name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bt-accent to-bt-teal flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {circle.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="bt-heading text-2xl text-bt-text-primary truncate">{circle.name}</h1>
                    {isAdmin && <span className="px-2 py-0.5 bg-bt-teal/10 text-bt-teal text-xs font-bold rounded-lg flex-shrink-0">Admin</span>}
                  </div>
                  {circle.description && <p className="bt-caption text-sm line-clamp-2">{circle.description}</p>}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-around py-3 mb-4 rounded-xl bg-bt-surface-secondary">
                <div className="text-center">
                  <div className="bt-heading text-lg text-bt-text-primary">{circle.memberCount}</div>
                  <div className="bt-small">members</div>
                </div>
                <div className="w-px h-8 bg-bt-border-light" />
                <div className="text-center">
                  <div className="bt-heading text-lg text-bt-text-primary">{circle.itemCount}</div>
                  <div className="bt-small">items</div>
                </div>
                <div className="w-px h-8 bg-bt-border-light" />
                <div className="text-center">
                  <div className="bt-heading text-lg text-bt-text-primary">{circle.tradeCount}</div>
                  <div className="bt-small">trades</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mb-3">
                <button onClick={() => setShowInviteModal(true)}
                  className="flex-1 py-2.5 rounded-xl bg-bt-accent text-white font-semibold text-sm">
                  📤 Invite
                </button>
                {isAdmin && (
                  <button onClick={() => setEditMode(true)}
                    className="py-2.5 px-4 rounded-xl border border-bt-border text-bt-text-secondary font-medium text-sm">
                    ✏️ Edit
                  </button>
                )}
              </div>

              {/* Swipe CTA */}
              <Link href={`/circles/${circle.id}/swipe`}
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-bt-accent to-bt-teal text-white text-center font-bold shadow-md">
                💎 Swipe in this Circle →
              </Link>
            </>
          )}
        </div>

        {/* Items Section */}
        <div className="mx-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="bt-heading text-lg text-bt-text-primary">Items</h2>
            <Link href={`/dashboard/add-item?circle=${circleId}`}
              className="px-3 py-1.5 rounded-lg bg-bt-accent text-white font-semibold text-xs">
              + Post Item
            </Link>
          </div>

          {itemsLoading ? (
            <div className="bt-card p-8 text-center"><div className="bt-caption">Loading...</div></div>
          ) : circleItems.length === 0 ? (
            <div className="bt-card p-8 text-center">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="bt-heading text-base text-bt-text-primary mb-1">No items yet</h3>
              <p className="bt-caption text-sm mb-4">Be the first to post!</p>
              <Link href={`/dashboard/add-item?circle=${circleId}`}
                className="inline-block px-4 py-2 rounded-xl bg-bt-accent text-white font-semibold text-sm">
                Post First Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {circleItems.map(item => (
                <Link key={item.id} href={`/items/${item.id}`} className="bt-card overflow-hidden">
                  <div className="aspect-square relative bg-bt-surface-secondary">
                    {item.images?.[0] ? (
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" sizes="200px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-40">📦</div>
                    )}
                    {item._count.swipes > 0 && (
                      <div className="absolute top-1.5 right-1.5 bg-bt-teal text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
                        💎 {item._count.swipes}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="bt-label text-sm text-bt-text-primary truncate">{item.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-4 h-4 rounded-full bg-bt-accent flex items-center justify-center text-white text-[8px] font-bold">
                        {item.user.name[0].toUpperCase()}
                      </div>
                      <span className="bt-small truncate">{item.user.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Members Section */}
        <div className="mx-5 mb-4">
          <h2 className="bt-heading text-lg text-bt-text-primary mb-3">Members</h2>
          <div className="bt-card overflow-hidden divide-y divide-bt-border-light">
            {circle.members?.map(member => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bt-accent flex items-center justify-center text-white font-bold">
                    {member.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bt-label text-sm text-bt-text-primary">{member.user.name}</span>
                      {member.userId === circle.adminId && (
                        <span className="px-1.5 py-0.5 bg-bt-teal/10 text-bt-teal text-[10px] font-bold rounded">Admin</span>
                      )}
                    </div>
                    <span className="bt-small">Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {isAdmin && member.userId !== session?.user?.id && (
                  <button onClick={() => handleRemoveMember(member.userId)}
                    className="text-xs text-bt-error font-medium px-2 py-1 rounded-lg hover:bg-bt-error/10 transition-colors">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leave / Delete */}
        <div className="mx-5 mb-6">
          {isAdmin ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-xl bg-bt-error/10 text-bt-error font-semibold text-sm">
              🗑️ Delete Circle
            </button>
          ) : (
            <button onClick={handleLeaveCircle}
              className="w-full py-3 rounded-xl bg-bt-error/10 text-bt-error font-semibold text-sm">
              🚪 Leave Circle
            </button>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="bt-heading text-lg text-bt-text-primary mb-2">Delete Circle</h3>
            <p className="bt-body text-sm text-bt-text-secondary mb-5">
              Delete &quot;{circle.name}&quot;? This can&apos;t be undone. All members and trades will be removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-bt-surface-secondary text-bt-text-secondary font-medium text-sm">Cancel</button>
              <button onClick={handleDeleteCircle}
                className="flex-1 py-2.5 rounded-xl bg-bt-error text-white font-semibold text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && circle && (
        <InviteModal inviteCode={circle.inviteCode} circleName={circle.name} onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}
