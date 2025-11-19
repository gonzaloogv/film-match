# Film-Match Frontend-Backend Integration Plan

## Executive Summary

This document outlines the comprehensive integration strategy for connecting Film-Match's React frontend with the Express/Prisma backend. The plan is structured into 5 strategic phases, prioritizing user-facing features and RAG-powered AI capabilities.

**Project Status:**
- ✅ **Backend Complete**: Express REST API with Google OAuth, TMDB, Gemini AI, Pinecone vector search
- ✅ **Frontend Complete**: React with Context API, React Query, Google OAuth authentication
- ✅ **Phase 3C Complete**: React Query migration and authentication integration
- 🚀 **Next Phase**: Phase 4 - Home Page & Movie Discovery Integration

---

## Architecture Overview

### Backend Stack
```
Express + TypeScript
├── Database: PostgreSQL (Prisma ORM)
├── Authentication: Google OAuth 2.0 + JWT
├── External APIs: TMDB, Gemini AI, Pinecone
└── Deployment: Vercel Serverless
```

### Frontend Stack
```
React + TypeScript + Vite
├── State Management: React Query + Context API
├── Routing: React Router v6
├── UI: Tailwind CSS + Framer Motion
└── Authentication: Google OAuth client
```

### API Endpoints Inventory

| Category | Endpoint | Method | Auth | Purpose |
|----------|----------|--------|------|---------|
| **Auth** | `/api/auth/google/url` | GET | No | Get OAuth URL |
| | `/api/auth/google/callback` | POST | No | Complete OAuth flow |
| | `/api/auth/logout` | POST | Yes | Logout user |
| **Movies** | `/api/movies` | GET | Optional | List movies (paginated) |
| | `/api/movies/:id` | GET | Optional | Get movie details |
| | `/api/movies/tmdb/:tmdbId` | GET | Optional | Get by TMDB ID |
| | `/api/movies/category/:slug` | GET | Optional | Filter by category |
| **Ratings** | `/api/ratings` | GET | Yes | Get user ratings |
| | `/api/ratings` | POST | Yes | Create/update rating |
| | `/api/ratings/stats` | GET | Yes | Get rating statistics |
| | `/api/ratings/movie/:movieId` | GET | Yes | Get rating for movie |
| | `/api/ratings/:id` | DELETE | Yes | Delete rating |
| **Collections** | `/api/collections` | GET | Yes | Get all collections |
| | `/api/collections/:type` | GET | Yes | Get by type (watchlist/favorites/watched) |
| | `/api/collections` | POST | Yes | Add to collection |
| | `/api/collections/check/:movieId` | GET | Yes | Check movie status |
| | `/api/collections/:id` | DELETE | Yes | Remove from collection |
| **User** | `/api/users/me` | GET | Yes | Get current user profile |
| | `/api/users/me` | PUT | Yes | Update user profile |
| | `/api/users/me/stats` | GET | Yes | Get user statistics |
| **RAG/AI** | `/api/rag/chat` | POST | Yes | Chat with Gemini AI |
| | `/api/rag/chat/status` | GET | No | Check chat service status |
| | `/api/rag/recommendations` | GET | Yes | Get AI recommendations |
| | `/api/rag/search` | POST | No | Semantic search |
| | `/api/rag/similar/:movieId` | GET | No | Find similar movies |
| | `/api/rag/suggestions` | GET | No | Get popular suggestions |
| **Categories** | `/api/categories` | GET | No | List all categories |
| **TMDB** | `/api/tmdb/sync/popular` | POST | Admin | Sync popular movies |

---

## Phase 4: Home Page & Movie Discovery Integration

**Priority:** 🔴 CRITICAL
**Timeline:** 3-4 days
**Dependencies:** Authentication (Phase 3C - Complete)

### Strategic Goals
1. Replace mock data with real backend movies
2. Implement infinite scroll/pagination for movie discovery
3. Enable category-based filtering
4. Optimize performance with React Query caching
5. Handle loading/error states gracefully

### 4.1 - Movie List Container Refactor

**Files to Modify:**
- `frontend/src/presentation/hooks/MovieListContainer.tsx`
- `frontend/src/hooks/useMovies.ts` (extend functionality)

**Backend Endpoint:**
```
GET /api/movies?page=1&limit=20&category=action&sort=popularity
```

**Implementation Steps:**

1. **Create Movie Pagination Hook** (`frontend/src/hooks/api/useMoviesPaginated.ts`)
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { movieService } from '@/api/services';
import { queryKeys } from '@/lib/cache/query-cache';

export const useMoviesPaginated = (params?: MovieQueryParams) => {
  return useInfiniteQuery({
    queryKey: queryKeys.movies.list(params),
    queryFn: ({ pageParam = 1 }) =>
      movieService.getMovies({ ...params, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

2. **Update MovieListContainer to use real data**
```typescript
// Replace mock data imports with:
import { useMoviesPaginated } from '@/hooks/api/useMoviesPaginated';
import { useInView } from 'react-intersection-observer';

const MovieListContainer = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error
  } = useMoviesPaginated({
    category: selectedCategory || undefined,
    sort: 'popularity'
  });

  // Infinite scroll trigger
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Flatten paginated data
  const movies = data?.pages.flatMap(page => page.data) ?? [];

  return (
    <div>
      <CategoryFilter
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />

      {isLoading && <MovieListSkeleton />}
      {isError && <ErrorMessage error={error} />}

      <MovieCardStack movies={movies} />

      {/* Infinite scroll trigger */}
      <div ref={ref} className="h-10" />

      {hasNextPage && <LoadingSpinner />}
    </div>
  );
};
```

3. **Create Category Filter Component** (`frontend/src/components/movies/CategoryFilter.tsx`)
```typescript
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/api/services';

interface CategoryFilterProps {
  selected: string | null;
  onChange: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selected,
  onChange
}) => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes (rarely changes)
  });

  if (isLoading) return <SkeletonLoader />;

  return (
    <div className="flex gap-2 overflow-x-auto pb-4">
      <FilterChip
        label="All"
        active={!selected}
        onClick={() => onChange(null)}
      />
      {categories?.map(category => (
        <FilterChip
          key={category.slug}
          label={category.name}
          active={selected === category.slug}
          onClick={() => onChange(category.slug)}
        />
      ))}
    </div>
  );
};
```

**Data Flow Diagram:**
```
User scrolls
    ↓
IntersectionObserver detects
    ↓
fetchNextPage() called
    ↓
React Query checks cache
    ↓
If stale/missing → API call to /api/movies?page=N
    ↓
Backend returns paginated response
    ↓
React Query caches & merges pages
    ↓
Component re-renders with new movies
```

**Error Handling:**
- Network errors: Show retry button
- Empty results: "No movies found" message
- Rate limit: Exponential backoff
- Invalid category: Fallback to "All"

**Performance Optimizations:**
- Prefetch next page when user reaches 80% of current content
- Image lazy loading with Intersection Observer
- Virtual scrolling for 100+ movies (future enhancement)

---

## Phase 4A: Movie Swiping & Ratings Integration

**Priority:** 🔴 CRITICAL
**Timeline:** 2-3 days
**Dependencies:** Phase 4 (Movie Discovery)

### Strategic Goals
1. Connect swipe gestures to rating creation
2. Sync ratings with backend immediately
3. Implement optimistic UI updates
4. Show user's rating history
5. Enable rating editing/deletion

### 4A.1 - Swipe Rating Integration

**Files to Modify:**
- `frontend/src/presentation/components/MovieCard.tsx`
- `frontend/src/presentation/hooks/MovieListContainer.tsx`
- `frontend/src/hooks/api/useRatings.ts`

**Backend Endpoints:**
```
POST /api/ratings
DELETE /api/ratings/:id
GET /api/ratings/movie/:movieId
```

**Implementation Steps:**

1. **Connect Swipe Gestures to Rating API**
```typescript
// In MovieListContainer.tsx
import { useRatings } from '@/hooks/api/useRatings';

const MovieListContainer = () => {
  const { createOrUpdateRating, isCreatingRating } = useRatings();
  const queryClient = useQueryClient();

  const handleSwipe = async (movieId: number, direction: 'left' | 'right') => {
    const rating = direction === 'right' ? 5 : 1; // Simplify: Like (5) / Dislike (1)

    try {
      // Optimistic update: Remove card immediately
      setMovies(prev => prev.filter(m => m.id !== movieId));

      // Send to backend
      await createOrUpdateRating({
        movieId,
        rating,
        review: null, // Optional review
      });

      // Show success toast
      toast.success(direction === 'right' ? 'Added to favorites!' : 'Noted!');

      // Invalidate recommendations (ratings affect RAG)
      queryClient.invalidateQueries({
        queryKey: queryKeys.rag.recommendations()
      });

    } catch (error) {
      // Rollback on error
      toast.error('Failed to save rating. Please try again.');
      // Re-add movie to list
      setMovies(prev => [...prev, movie]);
    }
  };

  return (
    <MovieCard
      movie={currentMovie}
      onSwipe={handleSwipe}
      isLoading={isCreatingRating}
    />
  );
};
```

2. **Enhanced Rating System with Stars** (for detail views)
```typescript
// In MovieDetailsPage.tsx
import { StarRating } from '@/components/ui/StarRating';

const MovieDetailsPage = () => {
  const { movieId } = useParams();
  const { createOrUpdateRating } = useRatings();
  const { data: currentRating } = useRatings().getRatingForMovie(Number(movieId));

  const handleRatingChange = async (newRating: number) => {
    await createOrUpdateRating({
      movieId: Number(movieId),
      rating: newRating,
      review: currentRating?.review || null,
    });
  };

  return (
    <div>
      <h2>Rate this movie</h2>
      <StarRating
        value={currentRating?.rating || 0}
        onChange={handleRatingChange}
        size="large"
      />
    </div>
  );
};
```

3. **Create Rating History Component** (`frontend/src/components/profile/RatingHistory.tsx`)
```typescript
export const RatingHistory: React.FC = () => {
  const { ratings, isLoadingRatings, deleteRating } = useRatings();
  const { movies } = useMovies(); // For movie metadata

  const ratingsWithMovies = useMemo(() => {
    return ratings.map(rating => ({
      ...rating,
      movie: movies.find(m => m.id === rating.movieId)
    }));
  }, [ratings, movies]);

  return (
    <div className="space-y-4">
      {ratingsWithMovies.map(({ rating, movie, createdAt, id }) => (
        <RatingCard
          key={id}
          movie={movie}
          rating={rating}
          date={createdAt}
          onDelete={() => deleteRating(id)}
        />
      ))}
    </div>
  );
};
```

**Optimistic Update Strategy:**
```typescript
// In useRatings.ts mutation config
onMutate: async (newRating) => {
  // Cancel pending queries
  await queryClient.cancelQueries({ queryKey: queryKeys.ratings.all });

  // Snapshot previous state
  const previousRatings = queryClient.getQueryData(queryKeys.ratings.list());

  // Optimistically update UI
  queryClient.setQueryData(queryKeys.ratings.list(), (old: any) => {
    return [...(old || []), newRating];
  });

  return { previousRatings };
},
onError: (err, newRating, context) => {
  // Rollback on error
  queryClient.setQueryData(
    queryKeys.ratings.list(),
    context.previousRatings
  );
},
onSuccess: () => {
  // Invalidate related queries
  queryClient.invalidateQueries({ queryKey: queryKeys.ratings.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.rag.recommendations() });
}
```

**Data Flow:**
```
User swipes right →
  Optimistic UI update (card disappears) →
    POST /api/ratings {movieId: 123, rating: 5} →
      Backend validates & saves →
        Prisma creates rating record →
          Triggers vector embedding update (background) →
            Returns success →
              React Query invalidates cache →
                UI remains updated

If error →
  Rollback optimistic update →
    Show error message →
      Re-display movie card
```

---

## Phase 4B: User Profile & Preferences Integration

**Priority:** 🟡 HIGH
**Timeline:** 2-3 days
**Dependencies:** Phase 4A (Ratings)

### Strategic Goals
1. Fetch real user data from backend
2. Enable profile editing with validation
3. Display accurate user statistics
4. Sync preferences with database
5. Show personalized recommendations

### 4B.1 - Profile Data Integration

**Files to Modify:**
- `frontend/src/pages/Profile.tsx`
- `frontend/src/components/ProfileEditModal.tsx`
- `frontend/src/hooks/api/useUser.ts` (create new hook)

**Backend Endpoints:**
```
GET /api/users/me
PUT /api/users/me
GET /api/users/me/stats
```

**Implementation Steps:**

1. **Create User Hook** (`frontend/src/hooks/api/useUser.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/api/services';

export const useUser = () => {
  const queryClient = useQueryClient();

  // Get current user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get user statistics
  const { data: stats } = useQuery({
    queryKey: ['user', 'stats'],
    queryFn: () => userService.getStats(),
    staleTime: 5 * 60 * 1000,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserDTO) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update cache immediately
      queryClient.setQueryData(['user', 'profile'], updatedUser);
      toast.success('Profile updated successfully!');
    },
  });

  return {
    profile,
    stats,
    isLoading,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
```

2. **Update Profile Page with Real Data**
```typescript
// In Profile.tsx
import { useUser } from '@/hooks/api/useUser';
import { useRatings } from '@/hooks/api/useRatings';

const Profile: React.FC = () => {
  const { profile, stats, isLoading } = useUser();
  const { ratings } = useRatings();

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div>
      {/* Profile Header */}
      <ProfileHeader user={profile} />

      {/* Statistics */}
      <StatsGrid stats={{
        totalRatings: stats?.totalRatings || 0,
        averageRating: stats?.averageRating || 0,
        totalWatchtime: stats?.totalWatchtime || 0,
        favoriteGenres: stats?.favoriteGenres || [],
      }} />

      {/* Recent Ratings */}
      <RatingHistory ratings={ratings} />
    </div>
  );
};
```

3. **Profile Edit Modal Integration**
```typescript
// In ProfileEditModal.tsx
export const ProfileEditModal: React.FC = () => {
  const { profile, updateProfile, isUpdating } = useUser();
  const [formData, setFormData] = useState({
    nickname: profile?.nickname || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar || '',
    twitterUrl: profile?.twitterUrl || '',
    instagramUrl: profile?.instagramUrl || '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate URLs
    if (formData.twitterUrl && !isValidUrl(formData.twitterUrl)) {
      toast.error('Invalid Twitter URL');
      return;
    }

    // Submit to backend
    await updateProfile(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Nickname"
        value={formData.nickname}
        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
        maxLength={50}
      />

      <Textarea
        label="Bio"
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        maxLength={500}
      />

      <AvatarSelector
        current={formData.avatar}
        onChange={(avatar) => setFormData({ ...formData, avatar })}
      />

      <Button type="submit" loading={isUpdating}>
        Save Changes
      </Button>
    </form>
  );
};
```

4. **User Statistics Component**
```typescript
interface UserStats {
  totalRatings: number;
  averageRating: number;
  totalWatchtime: number; // in minutes
  favoriteGenres: { genre: string; count: number }[];
}

export const StatsGrid: React.FC<{ stats: UserStats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<Film />}
        label="Movies Rated"
        value={stats.totalRatings}
      />
      <StatCard
        icon={<Star />}
        label="Avg Rating"
        value={stats.averageRating.toFixed(1)}
      />
      <StatCard
        icon={<Clock />}
        label="Watch Time"
        value={`${Math.floor(stats.totalWatchtime / 60)}h`}
      />
      <StatCard
        icon={<Heart />}
        label="Top Genre"
        value={stats.favoriteGenres[0]?.genre || 'N/A'}
      />
    </div>
  );
};
```

**Data Validation:**
```typescript
// User update validation schema (Zod)
const updateUserSchema = z.object({
  nickname: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().optional(),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
});
```

---

## Phase 4C: AI Chat Integration

**Priority:** 🔴 CRITICAL (Key differentiator)
**Timeline:** 3-4 days
**Dependencies:** Phase 4A (Ratings data needed for context)

### Strategic Goals
1. Replace mock chatbot with Gemini AI backend
2. Implement conversational movie recommendations
3. Maintain chat history per session
4. Stream AI responses for better UX
5. Show loading states and typing indicators

### 4C.1 - Gemini Chat Integration

**Files to Modify:**
- `frontend/src/components/Chatbot.tsx`
- `frontend/src/hooks/api/useRAGChat.ts`

**Backend Endpoints:**
```
POST /api/rag/chat
GET /api/rag/chat/status
GET /api/rag/recommendations
```

**Implementation Steps:**

1. **Update Chatbot Component with Real AI**
```typescript
// In Chatbot.tsx
import { useRAGChat } from '@/hooks/api/useRAGChat';
import { useAuth } from '@/hooks/api/useAuth';
import { v4 as uuidv4 } from 'uuid';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId] = useState(() => uuidv4());

  const { currentUser } = useAuth();
  const {
    sendMessage,
    isChattingLoading,
    chatResponse,
    isServiceAvailable
  } = useRAGChat();

  // Add AI response to messages when received
  useEffect(() => {
    if (chatResponse) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: chatResponse.response,
        sender: 'assistant',
        timestamp: new Date(),
        recommendedMovies: chatResponse.recommendedMovies || [],
      }]);
    }
  }, [chatResponse]);

  const handleSend = async () => {
    if (!inputValue.trim() || !currentUser) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Send to Gemini AI
    await sendMessage(inputValue, conversationId, 5);
  };

  // Check service availability on mount
  if (!isServiceAvailable) {
    return <ChatUnavailableMessage />;
  }

  return (
    <ChatWindow
      messages={messages}
      onSend={handleSend}
      inputValue={inputValue}
      onInputChange={setInputValue}
      isLoading={isChattingLoading}
    />
  );
};
```

2. **Enhanced Chat Message Component**
```typescript
interface ChatMessageProps {
  message: ChatMessage;
  isLastMessage: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastMessage
}) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[80%] p-4 rounded-2xl
        ${isUser ? 'bg-gradient-primary text-white' : 'bg-dark-input'}
      `}>
        {/* Message text with markdown support */}
        <ReactMarkdown>{message.text}</ReactMarkdown>

        {/* Recommended movies (if AI suggested any) */}
        {message.recommendedMovies && message.recommendedMovies.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold">Recommended for you:</p>
            {message.recommendedMovies.map(movie => (
              <MovieRecommendationCard
                key={movie.id}
                movie={movie}
                compact
              />
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {!isUser && isLastMessage && message.isTyping && (
          <TypingIndicator />
        )}
      </div>
    </div>
  );
};
```

3. **Create Conversation Persistence** (Optional - localStorage)
```typescript
// In Chatbot.tsx
const CONVERSATION_STORAGE_KEY = 'film-match-chat-history';

// Load conversation on mount
useEffect(() => {
  const savedConversation = localStorage.getItem(CONVERSATION_STORAGE_KEY);
  if (savedConversation) {
    setMessages(JSON.parse(savedConversation));
  } else {
    // Add welcome message
    setMessages([{
      id: 1,
      text: `Hi ${currentUser?.name}! I'm your AI movie assistant. I can recommend movies based on your taste, answer questions, and help you discover hidden gems. What are you in the mood for?`,
      sender: 'assistant',
      timestamp: new Date(),
    }]);
  }
}, [currentUser]);

// Save conversation on change
useEffect(() => {
  if (messages.length > 0) {
    localStorage.setItem(
      CONVERSATION_STORAGE_KEY,
      JSON.stringify(messages.slice(-20)) // Keep last 20 messages
    );
  }
}, [messages]);
```

4. **Implement Streaming Responses** (Future Enhancement)
```typescript
// For real-time streaming (if backend supports SSE)
const streamChatResponse = async (message: string) => {
  const response = await fetch('/api/rag/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message, userId: currentUser.id }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  let accumulatedText = '';

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    accumulatedText += chunk;

    // Update message in real-time
    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        text: accumulatedText,
        isTyping: true,
      };
      return updated;
    });
  }
};
```

**Chat Context Strategy:**
```typescript
// Backend automatically includes:
// 1. User's rating history (last 50 ratings)
// 2. Favorite genres
// 3. Recent searches
// 4. Collection status (watchlist, favorites)

// This context enables AI to provide personalized recommendations
```

**Error Handling:**
```typescript
// In useRAGChat.ts
const sendMessage = async (message: string, conversationId?: string) => {
  try {
    await sendMessageMutation.mutate({ message, conversationId });
  } catch (error) {
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait a moment.');
    } else if (error.response?.status === 503) {
      toast.error('AI service temporarily unavailable. Try again soon.');
    } else {
      toast.error('Failed to send message. Please try again.');
    }
  }
};
```

---

## Phase 4D: Matches List Integration

**Priority:** 🟢 MEDIUM
**Timeline:** 2-3 days
**Dependencies:** Phase 4A (Ratings)

### Strategic Goals
1. Show users with matching movie tastes
2. Display shared favorite movies
3. Enable social interactions (future)
4. Calculate match percentage
5. Real-time updates (future - WebSockets)

### 4D.1 - Matches Algorithm

**Note:** This feature requires a new backend endpoint that doesn't exist yet. We'll need to implement it.

**New Backend Endpoint to Create:**
```typescript
// GET /api/users/matches
// Returns users with similar ratings
interface Match {
  userId: number;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  matchPercentage: number;
  sharedMovies: {
    movieId: number;
    movie: MovieDTO;
    yourRating: number;
    theirRating: number;
  }[];
}
```

**Implementation Steps:**

1. **Create Matches Backend Endpoint** (Backend task)
```typescript
// backend/src/routes/user.routes.ts
router.get('/matches', authenticate, userController.getUserMatches);

// backend/src/services/user.service.ts
async getUserMatches(userId: number): Promise<Match[]> {
  // 1. Get user's ratings
  const userRatings = await prisma.rating.findMany({
    where: { userId },
    select: { movieId: true, rating: true }
  });

  // 2. Find other users who rated the same movies
  const movieIds = userRatings.map(r => r.movieId);

  const otherUsersRatings = await prisma.rating.findMany({
    where: {
      movieId: { in: movieIds },
      userId: { not: userId }
    },
    include: { user: true, movie: true }
  });

  // 3. Calculate similarity scores (Cosine similarity or Jaccard index)
  const matches = calculateMatchScores(userRatings, otherUsersRatings);

  // 4. Return top 20 matches
  return matches.slice(0, 20);
}
```

2. **Create Matches Hook** (`frontend/src/hooks/api/useMatches.ts`)
```typescript
export const useMatches = () => {
  const { data: matches, isLoading } = useQuery({
    queryKey: ['user', 'matches'],
    queryFn: () => matchService.getMatches(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    matches: matches || [],
    isLoading,
  };
};
```

3. **Update Matches Page**
```typescript
// In Matches.tsx
import { useMatches } from '@/hooks/api/useMatches';

const Matches: React.FC = () => {
  const { matches, isLoading } = useMatches();

  if (isLoading) return <MatchesSkeleton />;

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={<Users />}
        title="No matches yet"
        description="Rate more movies to find users with similar taste!"
        action={
          <Button onClick={() => navigate('/')}>
            Start Rating Movies
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {matches.map(match => (
        <MatchCard
          key={match.userId}
          user={match.user}
          matchPercentage={match.matchPercentage}
          sharedMovies={match.sharedMovies}
        />
      ))}
    </div>
  );
};
```

4. **Match Card Component**
```typescript
interface MatchCardProps {
  user: UserDTO;
  matchPercentage: number;
  sharedMovies: SharedMovie[];
}

export const MatchCard: React.FC<MatchCardProps> = ({
  user,
  matchPercentage,
  sharedMovies
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="bg-dark-card rounded-2xl p-6 border border-gray-800"
      whileHover={{ scale: 1.02 }}
    >
      {/* User Info */}
      <div className="flex items-center gap-4">
        <Avatar src={user.avatar} name={user.name} size="lg" />
        <div className="flex-1">
          <h3 className="text-xl font-bold">{user.name}</h3>
          <p className="text-gray-400">{sharedMovies.length} movies in common</p>
        </div>

        {/* Match Score */}
        <div className="text-center">
          <CircularProgress value={matchPercentage} size="lg" />
          <p className="text-sm text-gray-400 mt-2">Match</p>
        </div>
      </div>

      {/* Shared Movies Preview */}
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {sharedMovies.slice(0, 5).map(shared => (
          <MoviePosterThumbnail
            key={shared.movieId}
            movie={shared.movie}
            badge={
              <RatingComparisonBadge
                yours={shared.yourRating}
                theirs={shared.theirRating}
              />
            }
          />
        ))}
      </div>

      {/* Expand to see all shared movies */}
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="mt-4 w-full"
      >
        {expanded ? 'Show Less' : `See All ${sharedMovies.length} Movies`}
      </Button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-2"
          >
            {sharedMovies.map(shared => (
              <SharedMovieRow key={shared.movieId} shared={shared} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

**Match Algorithm Details:**
```typescript
// Cosine Similarity for match calculation
function calculateMatchScore(
  userRatings: Rating[],
  otherUserRatings: Rating[]
): number {
  const sharedMovies = userRatings.filter(r1 =>
    otherUserRatings.some(r2 => r2.movieId === r1.movieId)
  );

  if (sharedMovies.length === 0) return 0;

  // Cosine similarity
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  sharedMovies.forEach(r1 => {
    const r2 = otherUserRatings.find(r => r.movieId === r1.movieId)!;
    dotProduct += r1.rating * r2.rating;
    mag1 += r1.rating ** 2;
    mag2 += r2.rating ** 2;
  });

  const similarity = dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));

  // Boost score for more shared movies
  const sharedBoost = Math.min(sharedMovies.length / 20, 1);

  return Math.round((similarity * 0.7 + sharedBoost * 0.3) * 100);
}
```

---

## Cross-Cutting Concerns

### 1. Error Handling Strategy

**Global Error Boundary:**
```typescript
// frontend/src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service (e.g., Sentry)
    logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}
```

**API Error Handling:**
```typescript
// frontend/src/api/client/interceptors.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - attempt refresh
      return refreshTokenAndRetry(error);
    }

    if (error.response?.status === 429) {
      // Rate limit - show user-friendly message
      toast.error('Too many requests. Please slow down.');
    }

    if (error.response?.status >= 500) {
      // Server error - log and show generic message
      logError(error);
      toast.error('Something went wrong. Please try again.');
    }

    return Promise.reject(error);
  }
);
```

### 2. Loading States

**Skeleton Loaders:**
```typescript
// Consistent skeleton components for each view
export const MovieCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-800 rounded-3xl aspect-[2/3]" />
    <div className="h-6 bg-gray-800 rounded mt-4 w-3/4" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="w-32 h-32 bg-gray-800 rounded-full" />
    <div className="h-8 bg-gray-800 rounded w-1/2" />
    <div className="h-4 bg-gray-800 rounded w-3/4" />
  </div>
);
```

**Loading Indicators:**
```typescript
// Use React Query's loading states consistently
const { isLoading, isFetching, isError } = useQuery(...);

// Initial load
if (isLoading) return <Skeleton />;

// Background refetch
if (isFetching) return <RefreshIndicator />;

// Error state
if (isError) return <ErrorMessage />;
```

### 3. Caching Strategy

**React Query Cache Configuration:**
```typescript
// frontend/src/lib/cache/query-cache.ts
export const QUERY_CACHE_TIMES = {
  CURRENT_USER: 15 * 60 * 1000,      // 15 min (rarely changes)
  MOVIES: 5 * 60 * 1000,              // 5 min (updated frequently)
  MOVIE_DETAILS: 30 * 60 * 1000,      // 30 min (static content)
  RATINGS: 2 * 60 * 1000,             // 2 min (user's own data)
  RATING_STATS: 5 * 60 * 1000,        // 5 min (aggregated data)
  COLLECTIONS: 2 * 60 * 1000,         // 2 min (user's own data)
  RECOMMENDATIONS: 10 * 60 * 1000,    // 10 min (expensive to compute)
  SEARCH_RESULTS: 5 * 60 * 1000,      // 5 min (search results)
};

// Prefetching strategy
export const usePrefetchStrategies = () => {
  const queryClient = useQueryClient();

  // Prefetch on hover
  const prefetchMovieDetails = (movieId: number) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.movies.detail(movieId),
      queryFn: () => movieService.getMovieById(movieId),
    });
  };

  // Prefetch on route change
  const prefetchUserData = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.ratings.list(),
      queryFn: () => ratingService.getUserRatings(),
    });
  };

  return { prefetchMovieDetails, prefetchUserData };
};
```

### 4. Performance Optimizations

**Image Optimization:**
```typescript
// Lazy load images with Intersection Observer
export const LazyImage: React.FC<ImageProps> = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: '100px' } // Load 100px before visible
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      className={`transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      {...props}
    />
  );
};
```

**Code Splitting:**
```typescript
// Lazy load heavy components
const Chatbot = lazy(() => import('@/components/Chatbot'));
const ProfileEditModal = lazy(() => import('@/components/ProfileEditModal'));

// In component
<Suspense fallback={<LoadingSpinner />}>
  <Chatbot />
</Suspense>
```

### 5. Authentication Flow

**Protected Routes:**
```typescript
// frontend/src/components/auth/ProtectedRoute.tsx
export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const location = useLocation();

  if (isLoadingUser) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

**Token Refresh Strategy:**
```typescript
// frontend/src/lib/auth/token-manager.ts
export class TokenManager {
  private static refreshPromise: Promise<string> | null = null;

  static async refreshToken(): Promise<string> {
    // Prevent concurrent refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = authService
      .refreshToken(this.getRefreshToken()!)
      .then(response => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.refreshPromise = null;
        return response.accessToken;
      })
      .catch(error => {
        this.clearTokens();
        this.refreshPromise = null;
        throw error;
      });

    return this.refreshPromise;
  }

  static isTokenExpiring(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresIn = payload.exp * 1000 - Date.now();

    // Refresh if less than 5 minutes remaining
    return expiresIn < 5 * 60 * 1000;
  }
}
```

---

## Testing Strategy

### Unit Tests
```typescript
// Example: useRatings hook test
describe('useRatings', () => {
  it('should create rating optimistically', async () => {
    const { result } = renderHook(() => useRatings(), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.createOrUpdateRating({
        movieId: 1,
        rating: 5,
      });
    });

    // Should update UI immediately
    await waitFor(() => {
      expect(result.current.ratings).toContainEqual(
        expect.objectContaining({ movieId: 1, rating: 5 })
      );
    });
  });

  it('should rollback on error', async () => {
    server.use(
      rest.post('/api/ratings', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result } = renderHook(() => useRatings());

    act(() => {
      result.current.createOrUpdateRating({ movieId: 1, rating: 5 });
    });

    await waitFor(() => {
      expect(result.current.createRatingError).toBeTruthy();
      expect(result.current.ratings).not.toContainEqual(
        expect.objectContaining({ movieId: 1 })
      );
    });
  });
});
```

### Integration Tests
```typescript
// Example: End-to-end rating flow
describe('Rating Flow', () => {
  it('should allow user to rate movie and see in profile', async () => {
    render(<App />, { wrapper: AppProviders });

    // Navigate to home
    await screen.findByText('Film-Match');

    // Swipe right on movie
    const movieCard = screen.getByTestId('movie-card');
    fireEvent.swipeRight(movieCard);

    // Check toast confirmation
    expect(screen.getByText('Added to favorites!')).toBeInTheDocument();

    // Navigate to profile
    fireEvent.click(screen.getByText('Profile'));

    // Verify rating appears
    await screen.findByText('My Recent Ratings');
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });
});
```

---

## Deployment Checklist

### Pre-deployment
- [ ] All environment variables configured in Vercel
- [ ] Database migrations applied to production
- [ ] TMDB API sync completed (popular movies indexed)
- [ ] Pinecone vector index populated
- [ ] Gemini API key validated
- [ ] CORS configured for production domain
- [ ] Rate limits tested under load

### Post-deployment
- [ ] Health check endpoint returns 200
- [ ] Google OAuth flow works end-to-end
- [ ] Movie discovery loads correctly
- [ ] Ratings persist to database
- [ ] AI chat responds within 5 seconds
- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Performance monitoring enabled
- [ ] Analytics tracking active

---

## Migration Path from Mock Data

### Phase-by-Phase Migration

**Current State:**
```typescript
// Using mock data
import moviesData from '../data/movies.json';
const movies = moviesData;
```

**Phase 4 Target:**
```typescript
// Using backend API
const { movies, isLoading } = useMovies({ sort: 'popularity' });
```

**Migration Steps:**

1. **Create feature flags** (gradual rollout)
```typescript
const USE_BACKEND_MOVIES = import.meta.env.VITE_USE_BACKEND === 'true';

const movies = USE_BACKEND_MOVIES
  ? useMovies().movies
  : mockMoviesData;
```

2. **Parallel data validation**
```typescript
// Ensure backend data matches expected shape
const validateMovieData = (movie: MovieDTO): boolean => {
  return (
    movie.id &&
    movie.title &&
    movie.poster &&
    Array.isArray(movie.genres)
  );
};
```

3. **Incremental rollout**
- Day 1: 10% of users see backend data
- Day 3: 50% of users
- Day 5: 100% of users
- Monitor error rates and performance at each step

---

## Success Metrics

### Performance Metrics
- **Initial page load:** < 2 seconds
- **Movie list fetch:** < 500ms
- **Rating creation:** < 200ms (optimistic) + background sync
- **AI chat response:** < 5 seconds
- **Search results:** < 1 second

### User Experience Metrics
- **Authentication success rate:** > 95%
- **Rating submission success rate:** > 99%
- **Chat response accuracy:** Manual QA review
- **Error rate:** < 1% of all requests
- **Cache hit rate:** > 80%

### Business Metrics
- **User retention:** Monitor daily active users
- **Engagement:** Average ratings per user per session
- **Feature adoption:** % of users who use AI chat
- **Performance:** Backend response times (p50, p95, p99)

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend API downtime | High | Implement fallback to cached data, show offline message |
| Rate limiting (TMDB/Gemini) | Medium | Implement queue system, cache aggressively |
| Database connection limits | High | Use connection pooling, optimize queries |
| Large payload sizes | Medium | Implement pagination, compress responses |
| Token expiration during session | Medium | Automatic token refresh, retry failed requests |

### User Experience Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Slow AI responses | Medium | Show typing indicator, timeout after 10s |
| Network failures | High | Optimistic UI updates, offline support |
| Incomplete user profile | Low | Sensible defaults, progressive disclosure |
| Empty states (no ratings) | Medium | Onboarding flow, sample recommendations |

---

## Next Steps After Phase 4D

### Phase 5: Advanced Features
- Real-time notifications (WebSockets)
- Social features (follow users, share lists)
- Advanced search (multi-filter, faceted search)
- Movie collections (create custom playlists)
- Watch party (sync viewing with friends)

### Phase 6: Performance Optimization
- Implement service worker (offline support)
- Add CDN for static assets
- Optimize bundle size (< 200KB initial)
- Implement virtual scrolling for long lists
- Add predictive prefetching

### Phase 7: Analytics & Monitoring
- User behavior tracking (Mixpanel/Amplitude)
- A/B testing framework
- Performance monitoring (Web Vitals)
- Error tracking (Sentry)
- Conversion funnel analysis

---

## Appendix

### A. API Response Schemas

**Movie DTO:**
```typescript
interface MovieDTO {
  id: number;
  tmdbId: number;
  title: string;
  overview: string;
  poster: string;
  backdrop: string | null;
  releaseDate: Date;
  runtime: number | null;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genres: string[];
  categories: CategoryDTO[];
  userRating?: number; // If user is authenticated
  userCollections?: string[]; // ['watchlist', 'favorites']
}
```

**Paginated Response:**
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

**Chat Response:**
```typescript
interface ChatResponseDTO {
  response: string;
  conversationId: string;
  recommendedMovies?: MovieDTO[];
  confidence: number; // 0-1 (AI confidence in recommendation)
  sources?: string[]; // Which data informed the response
}
```

### B. Environment Variables

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_USE_BACKEND=true
```

**Backend (.env):**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/filmatch
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
TMDB_API_KEY=your_key
GEMINI_API_KEY=your_key
PINECONE_API_KEY=your_key
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=film-match-movies
FRONTEND_URL=http://localhost:5173
```

### C. Useful Commands

```bash
# Frontend
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run test             # Run tests

# Backend
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript
npm run start            # Start production server
npm run seed             # Seed database with movies
npm run index-vectors    # Index movies in Pinecone
npm run db:push          # Push Prisma schema to DB
npm run db:studio        # Open Prisma Studio
```

### D. Architecture Diagrams

**Authentication Flow:**
```
User clicks "Login with Google"
    ↓
Frontend redirects to Google OAuth
    ↓
User authorizes
    ↓
Google redirects to backend callback
    ↓
Backend validates token with Google
    ↓
Backend creates/updates user in DB
    ↓
Backend generates JWT access + refresh tokens
    ↓
Frontend stores tokens in localStorage
    ↓
Frontend sets Authorization header for all requests
    ↓
Backend validates JWT on protected routes
```

**RAG Recommendation Flow:**
```
User rates movies
    ↓
Backend stores rating in PostgreSQL
    ↓
Background job: Generate embedding for user preferences
    ↓
Store embedding in Pinecone with metadata
    ↓
User requests recommendations
    ↓
Backend queries Pinecone for similar vectors
    ↓
Retrieve candidate movies
    ↓
Pass to Gemini with user context
    ↓
Gemini ranks and explains recommendations
    ↓
Return top N with AI-generated descriptions
```

---

## Conclusion

This integration plan provides a comprehensive roadmap for connecting Film-Match's frontend and backend systems. By following this phased approach, we ensure:

1. **Incremental Progress**: Each phase delivers tangible value
2. **Risk Mitigation**: Gradual rollout prevents catastrophic failures
3. **User Experience**: Optimistic updates and caching minimize perceived latency
4. **Scalability**: Architecture supports future growth
5. **Maintainability**: Clear separation of concerns and documented patterns

**Estimated Total Timeline:** 12-15 days for Phases 4-4D

**Recommended Order of Execution:**
1. Phase 4 (Home Page) - Foundation for all features
2. Phase 4A (Ratings) - Core functionality for RAG
3. Phase 4C (AI Chat) - Key differentiator
4. Phase 4B (Profile) - User engagement
5. Phase 4D (Matches) - Social features

---

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Author:** Film-Match Backend Architect
**Status:** Ready for Implementation
