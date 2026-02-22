# Bartera — Business Requirements Document
### "The Anticipation Social Game"
*Version 1.0 — February 2026*

---

## 1. Vision

Bartera is **not a marketplace**. It's an **anticipation social game** where players trade real items through trusted circles of friends. The core product is the **thrill of waiting** — like fishing, slot machines, or opening card packs — except the reward is something real.

**One-liner:** *Swipe. Wait. Win real stuff from your friends.*

---

## 2. Core Concept

### The Game Loop
```
Add Bait (list items) → Join/Create Circles → Swipe → Wait → MATCH! 🎉
     ↑                                                          |
     └──────── Add more bait to increase chances ←──────────────┘
```

### Key Metaphors
| Game Term | What It Means |
|-----------|--------------|
| **Player** | User |
| **Bait** | Items you're offering to trade |
| **Circle** | A trusted group of friends who trade together |
| **Casting** | Swiping through items |
| **Catch** | An item you swiped right on (want) |
| **Match** | A completed trade cycle found by the algorithm |
| **Bait Score** | How many items you've listed (more = better odds) |

### Why It's Addictive
- **You can't force a match** — you have to wait (anticipation)
- **More bait = better odds** — encourages listing more items (like buying lottery tickets)
- **"Almost there" signals** — "You're 2 connections away!" (slot machine 2/3 cherries)
- **Circles = social pressure** — friends remind each other to add bait
- **The payoff is REAL** — you physically receive something you wanted

---

## 3. Core Features

### 3.1 Circles (Trust Groups)
Circles are the foundation. Every trade happens within circles.

- **Create a circle**: Give it a name, get an invite link/code
- **Join a circle**: Via invite link, QR code, or code entry
- **Circle = your trading pool**: You only see/swipe items from people in your circles
- **Multi-circle membership**: One player can be in multiple circles
  - This creates **cross-pollination** — a player in Circle A and Circle B connects both groups
  - Longer trade chains become possible across circles
- **Circle admin**: Creator can remove members, rename circle
- **Circle chat** (Phase 2): Light messaging within circles
- **Circle stats**: "12 players, 45 items, 3 trades completed"

### 3.2 Bait (Listing Items)
- **Quick add**: Photo + title + category (that's it — keep friction LOW)
- **Optional fields**: Description, condition, estimated value
- **No pricing**: This is barter, not selling. No money involved.
- **Bait Score levels**:
  - 0 items: "No Bait Yet 🪝"
  - 1-2 items: "Beginner Fisher 🐟"
  - 3-5 items: "Getting Hooked 🎣"
  - 6-10 items: "Master Angler 🐋"
  - 10+ items: "Fishing Legend 👑"
- **Bait visible across all your circles** — one item can match in any circle

### 3.3 Swiping (The Core Interaction)
- **Tinder-style card stack** — one item at a time
- **Swipe right** = I want this (adds to your "Catches")
- **Swipe left** = Not interested (skip)
- **Card shows**: Photo, title, category, condition, owner name, 🔥 "X people want this"
- **Smart stack ordering** (Phase 2):
  1. Items from people who want YOUR stuff (highest priority)
  2. Items that would complete a near-cycle
  3. Items in categories you've swiped right on before
  4. Everything else (randomized)
- **Only shows items from your circles**
- **Doesn't show your own items**
- **Doesn't show items you've already swiped on**

### 3.4 Matching Algorithm
- **Cycle detection**: Find trade chains where A→B→C→A (everyone gives and receives)
- **Runs periodically** (every few hours or on-demand)
- **Cycle scoring**:
  - Shorter cycles preferred (2-person swaps > 5-person chains)
  - All participants must have swiped right on what they'd receive
  - Cross-circle cycles allowed if participants bridge circles
- **Max cycle length**: 8 participants (keeps it manageable)
- **Match notification**: Full celebration screen — confetti, reveal animation
  - "You give: [your item] → [person]"
  - "You get: [item] ← [person]"
- **Both parties must confirm** before trade is final
- **Decline**: If anyone declines, cycle is broken, items go back to pool

### 3.5 Anticipation Mechanics (The Secret Sauce)
- **"Almost There" indicators**: "Your item is 2 connections from a match!"
- **Heat map on items**: "🔥 12 people want this" — makes you feel your bait is working
- **Near-miss notifications**: "Someone in your circle just listed something you might want!"
- **Weekly digest**: "This week in your circles: 5 new items, 2 trades completed"
- **Streak counter**: "5 day swiping streak 🔥"

### 3.6 Notifications (Pull players back)
- **Match found**: Immediate push notification (this is the BIG one)
- **New items in your circles**: "3 new items just listed in School Friends circle"
- **Almost-match**: "You're SO close to a match — add one more item!"
- **Friend joined**: "Sarah just joined your circle with 4 items!"
- **Inactive nudge**: "Your bait has been sitting for 3 days. Swipe to find matches!"

---

## 4. User Journey

### First-Time Player
1. **Download app / visit website**
2. **Sign up** (email or Google)
3. **Create or Join a circle** — this is the FIRST action, not listing items
   - "Create a circle and invite your friends" OR "Enter an invite code"
4. **Onboarding**: Quick tutorial explaining bait, swiping, circles
5. **Add your first bait** — prompted with "What do you have that you don't need?"
   - Camera opens immediately — snap a photo, add title, done
6. **Start swiping** — if circle has items already
7. **Invite friends** — "Your circle needs more players! Share this link"

### Returning Player
1. Open app → see dashboard (Bait Score, circles, recent activity)
2. Check for matches/notifications
3. Swipe through new items
4. Add more bait if inspired

---

## 5. Go-To-Market Strategy

### The Insight
**Don't try to build a marketplace. Build circles.**

Traditional marketplaces need critical mass of strangers. Bartera needs **small groups of friends**. This is fundamentally easier and more viral.

### Phase 1: Seed (Month 1-3) — "The Kids Play"
- **Target**: School kids (12-18) — they trade CONSTANTLY (cards, games, clothes, tech)
- **Strategy**: David's kids + their friends create the first circles
- **Each school = a natural circle** 
- **Viral mechanic**: The app is useless alone. You MUST invite friends. Every user is a recruiter.
- **Goal**: 50 active circles, 500 players
- **Everything is FREE** — no limits, no monetization

### Phase 2: Expand (Month 3-6) — "The Parent Effect"
- Kids tell parents → parents create adult circles (neighbors, work colleagues)
- **University circles** — students are natural swappers
- **Neighborhood circles** — "Maadi Trading Circle", "Zamalek Swaps"
- **Goal**: 500 circles, 5,000 players

### Phase 3: Monetize (Month 6+) — "The Circle Tax"
- Introduce circle limits for free accounts
- Premium tiers for power users (see Monetization below)
- **Goal**: 5% conversion to paid

### Growth Flywheel
```
Create circle → Invite friends → Friends add bait →
Matches happen → Friends tell THEIR friends →
New circles created → Cross-circle matches →
More value → More circles → 🔄
```

---

## 6. Monetization

### Principle: Monetize AFTER traction, not before

### Phase 1 (Months 1-6): FREE
Everything unlimited. Focus purely on growth and engagement.

### Phase 2 (Month 6+): Circle-Based Tiers

| Plan | Price | Circles | Features |
|------|-------|---------|----------|
| **Free** | 0 | 2 circles | Core experience, 10 bait slots |
| **Hooked** | 30 EGP/mo (~$0.60) | 5 circles | Unlimited bait, priority in algorithm |
| **Master Angler** | 80 EGP/mo (~$1.60) | 10 circles | + See who wants your stuff, custom cards |
| **Legend** | 200 EGP/mo (~$4) | Unlimited | + Golden Hook boosts, analytics, early features |

### Why circles are the monetization axis:
- More circles = more matches = directly more value
- People who are in many circles are POWER USERS — they'll pay
- 2 free circles is enough to get hooked; you'll FEEL the limit

### Future Revenue Streams
- **Golden Hook** (one-time): Boost an item to top of stack in all circles for 24h
- **Crystal Ball** (premium perk): See who wants your stuff before swiping
- **Cosmetics**: Card designs, celebration animations, profile badges
- **Promoted Circles**: Businesses create branded circles (e.g. "Nike Egypt Swap Circle")

---

## 7. Technical Architecture

### Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (Neon) via Prisma ORM
- **Auth**: NextAuth.js (Email + Google OAuth)
- **Hosting**: Vercel
- **Push Notifications**: TBD (Firebase Cloud Messaging or OneSignal)
- **Image Storage**: Cloudinary or Supabase Storage

### Data Model (Key Entities)
```
Player (user)
├── has many Items (bait)
├── has many Wants (right swipes)
├── has many Passes (left swipes)
├── belongs to many Circles (via CircleMember)
└── participates in many Trades

Circle
├── has many CircleMembers
├── has invite code/link
└── has admin (creator)

Item (bait)
├── belongs to Player
├── has photos, title, category, condition
└── visible in all of owner's circles

Want (right swipe)
├── player_id → who wants it
└── item_id → what they want

Trade (completed match)
├── has many TradeMember entries
├── status: pending/confirmed/completed/declined
└── found by matching algorithm

TradeMember
├── trade_id
├── player_id
├── gives_item_id
└── receives_item_id
```

### Matching Algorithm
- **Type**: Cycle detection (Johnson's algorithm variant)
- **Input**: Player→Item want graph, filtered by circles
- **Output**: Non-overlapping cycles where every participant gives and receives
- **Scoring**: Shorter cycles preferred, proximity bonus
- **Max cycle length**: 8
- **Frequency**: Every 6 hours + on-demand trigger
- **Cross-circle**: Allowed when a player bridges two circles

---

## 8. Design System

### Theme: Dark + Green (Nature/Growth)
- Background: `#0a0f0a`
- Cards: `#111a11`
- Borders: `#1a2a1a`
- Accent green: `#22c55e`
- Danger red: `#ef4444`
- Warning amber: `#f59e0b`
- Text: white / `#8a9a8a` (muted)

### Mobile-First
- Primary experience is mobile (phone)
- Bottom tab navigation: Dashboard, Swipe, Circles, Matches
- Large touch targets for swiping
- Haptic feedback on swipe (mobile app)

---

## 9. MVP Scope (What We Build First)

### Must Have (MVP)
- [ ] Circle creation + invite links
- [ ] Join circle via code/link
- [ ] Add items (photo + title + category)
- [ ] Swipe interface (Tinder-style cards)
- [ ] Basic matching algorithm (runs on-demand)
- [ ] Match notification + confirmation flow
- [ ] Dashboard with Bait Score
- [ ] Email + Google sign-up/login
- [ ] Mobile-responsive design

### Nice to Have (Post-MVP)
- [ ] Smart stack ordering
- [ ] "Almost there" indicators
- [ ] Push notifications
- [ ] Circle chat
- [ ] Streak counter
- [ ] Weekly digest
- [ ] Profile customization

### Phase 2
- [ ] Monetization (circle tiers)
- [ ] Golden Hook boosts
- [ ] React Native mobile app
- [ ] Circle discovery (find circles near you)
- [ ] Analytics dashboard

---

## 10. Success Metrics

| Metric | Target (3 months) |
|--------|-------------------|
| Active circles | 50+ |
| Active players | 500+ |
| Items listed | 2,000+ |
| Trades completed | 100+ |
| DAU/MAU ratio | >30% (healthy engagement) |
| Avg items per player | 4+ |
| Circle invite conversion | >50% |
| Swipe sessions per day | 2+ per active player |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Cold start (no items to swipe) | Circles solve this — start small with friends |
| Junk listings | Community moderation within circles; admin can remove |
| No matches found | "Almost there" mechanics keep hope alive; encourage more bait |
| People ghost after matching | Confirmation deadline (48h to confirm or match expires) |
| Kids safety | Circles are invite-only; no public discovery in Phase 1 |
| Copycat apps | Speed + community moat; circles create switching costs |

---

## 12. Open Questions

1. **Item categories**: Should we have fixed categories or free-form tags?
2. **Value matching**: Should we try to match items of similar value, or pure desire-based?
3. **Location**: Do we factor in proximity for matching, or is it all within circles?
4. **Item expiry**: Should items expire after X days if no matches?
5. **Reporting/blocking**: How to handle disputes within circles?
6. **Cross-circle matching**: Should cycles span multiple circles, or stay within one?
7. **Re-swipe**: Can you change your mind on a left-swipe?

---

*Document owner: David & Patrick 🪼*
*Last updated: February 22, 2026*
