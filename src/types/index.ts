// Core data types for Bartera

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  adminId: string;
  createdAt: Date;
  memberCount: number;
  itemCount: number;
  tradeCount: number;
  members?: CircleMember[];
}

export interface CircleMember {
  id: string;
  userId: string;
  circleId: string;
  joinedAt: Date;
  user: User;
}

export interface Item {
  id: string;
  title: string;
  description?: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'FOR_PARTS';
  tags: string[];
  images: string[];
  userId: string;
  user: User;
  wantCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  likes?: Like[];
  comments?: Comment[];
}

export interface Swipe {
  id: string;
  userId: string;
  itemId: string;
  direction: 'LEFT' | 'RIGHT';
  circleId: string;
  createdAt: Date;
}

export interface Trade {
  id: string;
  circleId: string;
  status: 'MATCHED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
  completedAt?: Date;
  circle: Circle;
  members: TradeMember[];
}

export interface TradeMember {
  id: string;
  tradeId: string;
  userId: string;
  itemId: string;
  receivesFromUserId: string;
  receivesItemId: string;
  isCompleted: boolean;
  completedAt?: Date;
  user: User;
  item: Item;
  receivesFromUser: User;
  receivesItem: Item;
}

export interface DashboardData {
  baitScore: number;
  fishingLevel: string;
  levelEmoji: string;
  circles: Circle[];
  recentItems: Item[];
  catchesCount: number;
  tradesCompleted: number;
  streakDays: number;
}

export interface SwipeData {
  items: Item[];
  total: number;
}

export interface MatchResult {
  cyclesFound: number;
  tradesCreated: number;
  participants: string[];
}

export interface CirclePreview {
  name: string;
  memberCount: number;
  adminName: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Component prop types
export interface SwipeCardProps {
  item: Item;
  onSwipeLeft: (itemId: string) => void;
  onSwipeRight: (itemId: string) => void;
  isTop: boolean;
}

export interface CircleCardProps {
  circle: Circle;
  onClick?: () => void;
}

export interface TradeVisualizationProps {
  trade: Trade;
  currentUserId: string;
}

export interface Like {
  id: string;
  userId: string;
  itemId: string;
  createdAt: Date;
  user: User;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  itemId: string;
  createdAt: Date;
  user: User;
}

// Feed and Social Components
export interface FeedItem extends Item {
  circles?: Circle[];
  isLikedByCurrentUser: boolean;
  isWantedByCurrentUser: boolean;
}

export interface FeedPostProps {
  item: FeedItem;
  onLike: (itemId: string) => void;
  onWant: (itemId: string) => void;
  onComment: (itemId: string) => void;
  currentUserId: string;
}