# Phase 4: Home Page & Movie Discovery - Implementation Guide

## Overview

This guide provides detailed, step-by-step instructions for implementing Phase 4 of the Film-Match frontend-backend integration. This is the **highest priority phase** as it establishes the foundation for all subsequent features.

**Estimated Time:** 3-4 days
**Difficulty:** Medium
**Prerequisites:** Phase 3C (Authentication) must be complete

---

## Table of Contents

1. [Day 1: Setup & Basic Movie Loading](#day-1-setup--basic-movie-loading)
2. [Day 2: Pagination & Infinite Scroll](#day-2-pagination--infinite-scroll)
3. [Day 3: Category Filtering & Optimization](#day-3-category-filtering--optimization)
4. [Day 4: Polish & Testing](#day-4-polish--testing)

---

## Day 1: Setup & Basic Movie Loading

### Morning Session (3-4 hours)

#### Task 1.1: Create Category Service

**File:** `frontend/src/api/services/category.service.ts`

```typescript
import { apiClient } from '@/api/client';
import { ApiResponse } from '@/api/types/common.types';

export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
}

class CategoryService {
  private basePath = '/categories';

  /**
   * Get all categories
   */
  async getCategories(): Promise<CategoryDTO[]> {
    const response = await apiClient.get<ApiResponse<CategoryDTO[]>>(
      this.basePath
    );
    return response.data.data;
  }
}

export const categoryService = new CategoryService();
```

**File:** `frontend/src/api/services/index.ts`
```typescript
// Add to existing exports
export { categoryService } from './category.service';
export type { CategoryDTO } from './category.service';
```

#### Task 1.2: Create useCategories Hook

**File:** `frontend/src/hooks/api/useCategories.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/api/services';

/**
 * useCategories hook
 * Fetches all available movie categories/genres
 */
export const useCategories = () => {
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes (rarely changes)
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
  });

  return {
    categories: categories || [],
    isLoading,
    error,
  };
};

export default useCategories;
```

**File:** `frontend/src/hooks/api/index.ts`
```typescript
// Add to existing exports
export { useCategories } from './useCategories';
```

#### Task 1.3: Test Category Endpoint

Create a simple test component to verify the endpoint works:

**File:** `frontend/src/components/dev/CategoryTest.tsx`

```typescript
import { useCategories } from '@/hooks/api';

export const CategoryTest = () => {
  const { categories, isLoading, error } = useCategories();

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Categories ({categories.length})</h2>
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>{cat.name} ({cat.slug})</li>
        ))}
      </ul>
    </div>
  );
};
```

**Testing Steps:**
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Add `<CategoryTest />` to `Home.tsx` temporarily
4. Verify categories load in browser
5. Check Network tab for API call to `/api/categories`
6. Remove test component when verified

### Afternoon Session (3-4 hours)

#### Task 1.4: Update useMovies Hook for Better Pagination Support

**File:** `frontend/src/hooks/api/useMovies.ts`

Add new functionality to existing hook:

```typescript
// Add to existing useMovies.ts

/**
 * Hook for infinite scroll pagination
 */
export const useMoviesInfinite = (params?: Omit<MovieQueryParams, 'page'>) => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: queryKeys.movies.list(params),
    queryFn: ({ pageParam = 1 }) =>
      movieService.getMovies({
        ...params,
        page: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: QUERY_CACHE_TIMES.MOVIES,
  });

  // Flatten pages into single array
  const movies = useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data]
  );

  return {
    movies,
    pagination: data?.pages[data.pages.length - 1]?.pagination,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  };
};
```

#### Task 1.5: Create Basic Movie List Component

**File:** `frontend/src/components/movies/MovieList.tsx`

```typescript
import React from 'react';
import { MovieDTO } from '@/api/types';
import { MovieCard } from './MovieCard';
import { Loader2 } from 'lucide-react';

interface MovieListProps {
  movies: MovieDTO[];
  isLoading?: boolean;
  onMovieSwipe?: (movieId: number, direction: 'left' | 'right') => void;
}

export const MovieList: React.FC<MovieListProps> = ({
  movies,
  isLoading,
  onMovieSwipe,
}) => {
  if (isLoading && movies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary-pink" />
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No movies found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {movies.map(movie => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onSwipe={onMovieSwipe}
        />
      ))}
    </div>
  );
};
```

#### Task 1.6: Create Simple MovieCard Component

**File:** `frontend/src/components/movies/MovieCard.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { MovieDTO } from '@/api/types';

interface MovieCardProps {
  movie: MovieDTO;
  onSwipe?: (movieId: number, direction: 'left' | 'right') => void;
  onClick?: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onClick,
}) => {
  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      {/* Poster */}
      <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-gray-800">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-sm line-clamp-2 mb-2">
          {movie.title}
        </h3>

        <div className="flex items-center gap-2 text-xs">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-white font-semibold">
            {movie.voteAverage.toFixed(1)}
          </span>
          <span className="text-gray-300">
            {new Date(movie.releaseDate).getFullYear()}
          </span>
        </div>
      </div>

      {/* User Rating Badge (if rated) */}
      {movie.userRating && (
        <div className="absolute top-2 right-2 bg-primary-pink text-white px-2 py-1 rounded-full text-xs font-bold">
          {movie.userRating}/5
        </div>
      )}
    </motion.div>
  );
};
```

#### Task 1.7: Test Basic Movie Loading

**File:** `frontend/src/pages/Home.tsx`

Update to test the new components:

```typescript
import React from 'react';
import Navbar from '../components/Navbar';
import { MovieList } from '../components/movies/MovieList';
import { useMoviesInfinite } from '../hooks/api/useMovies';

const Home: React.FC = () => {
  const { movies, isLoading, error } = useMoviesInfinite({
    sort: 'popularity',
  });

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />

      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Discover Movies
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
            Error loading movies: {error.message}
          </div>
        )}

        <MovieList
          movies={movies}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Home;
```

**Testing Checklist:**
- [ ] Movies load from backend API
- [ ] Loading spinner shows while fetching
- [ ] Movie posters display correctly
- [ ] Hover effects work
- [ ] Movie ratings visible
- [ ] Error message shows if API fails
- [ ] Network tab shows `/api/movies?page=1&limit=20`

---

## Day 2: Pagination & Infinite Scroll

### Morning Session (3-4 hours)

#### Task 2.1: Install Intersection Observer Hook

```bash
cd frontend
npm install react-intersection-observer
```

#### Task 2.2: Implement Infinite Scroll

**File:** `frontend/src/components/movies/MovieListInfinite.tsx`

```typescript
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { MovieDTO } from '@/api/types';
import { MovieCard } from './MovieCard';
import { Loader2 } from 'lucide-react';

interface MovieListInfiniteProps {
  movies: MovieDTO[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  onMovieClick?: (movie: MovieDTO) => void;
}

export const MovieListInfinite: React.FC<MovieListInfiniteProps> = ({
  movies,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onMovieClick,
}) => {
  // Intersection observer to trigger loading more
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '400px', // Start loading 400px before reaching bottom
  });

  // Fetch next page when sentinel comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading && movies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary-pink" />
        <span className="ml-3 text-gray-400">Loading movies...</span>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No movies found</p>
        <p className="text-gray-500 text-sm mt-2">
          Try changing your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Movie Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {movies.map((movie, index) => (
          <MovieCard
            key={`${movie.id}-${index}`}
            movie={movie}
            onClick={() => onMovieClick?.(movie)}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary-pink" />
          <span className="ml-3 text-gray-400">Loading more...</span>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasNextPage && !isFetchingNextPage && (
        <div ref={ref} className="h-20" />
      )}

      {/* End of results */}
      {!hasNextPage && movies.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          You've reached the end of the list
        </div>
      )}
    </div>
  );
};
```

#### Task 2.3: Update Home Page with Infinite Scroll

**File:** `frontend/src/pages/Home.tsx`

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { MovieListInfinite } from '../components/movies/MovieListInfinite';
import { useMoviesInfinite } from '../hooks/api/useMovies';
import { MovieDTO } from '@/api/types';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const {
    movies,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useMoviesInfinite({
    sort: 'popularity',
  });

  const handleMovieClick = (movie: MovieDTO) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />

      <div className="pt-24 px-4 max-w-7xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Discover Movies</h1>
          <p className="text-gray-400 mt-2">
            {movies.length} movies loaded
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
            <p className="font-semibold">Error loading movies</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        <MovieListInfinite
          movies={movies}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
          onMovieClick={handleMovieClick}
        />
      </div>
    </div>
  );
};

export default Home;
```

### Afternoon Session (3-4 hours)

#### Task 2.4: Add Prefetching for Better Performance

**File:** `frontend/src/hooks/api/useMovies.ts`

Add prefetching logic:

```typescript
// Add to existing useMovies.ts

export const useMoviePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchMovieDetails = async (movieId: number) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.movies.detail(movieId),
      queryFn: () => movieService.getMovieById(movieId),
      staleTime: QUERY_CACHE_TIMES.MOVIE_DETAILS,
    });
  };

  const prefetchNextPage = async (params: MovieQueryParams) => {
    const currentData = queryClient.getQueryData<InfiniteData<PaginatedResponse<MovieDTO>>>(
      queryKeys.movies.list(params)
    );

    if (!currentData) return;

    const lastPage = currentData.pages[currentData.pages.length - 1];
    const nextPage = lastPage.pagination.currentPage + 1;

    if (nextPage <= lastPage.pagination.totalPages) {
      await queryClient.prefetchInfiniteQuery({
        queryKey: queryKeys.movies.list(params),
        queryFn: ({ pageParam = nextPage }) =>
          movieService.getMovies({ ...params, page: pageParam as number, limit: 20 }),
        initialPageParam: nextPage,
        staleTime: QUERY_CACHE_TIMES.MOVIES,
      });
    }
  };

  return {
    prefetchMovieDetails,
    prefetchNextPage,
  };
};
```

#### Task 2.5: Add Hover Prefetch to MovieCard

**File:** `frontend/src/components/movies/MovieCard.tsx`

```typescript
import { useMoviePrefetch } from '@/hooks/api/useMovies';

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onClick,
}) => {
  const { prefetchMovieDetails } = useMoviePrefetch();

  const handleMouseEnter = () => {
    // Prefetch movie details on hover
    prefetchMovieDetails(movie.id);
  };

  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* ... rest of the component ... */}
    </motion.div>
  );
};
```

#### Task 2.6: Test Infinite Scroll

**Testing Steps:**

1. **Basic Functionality:**
   - [ ] Load homepage
   - [ ] Verify first 20 movies load
   - [ ] Scroll to bottom
   - [ ] Verify next 20 movies load automatically
   - [ ] Continue scrolling - should keep loading until end

2. **Performance:**
   - [ ] Open DevTools > Network tab
   - [ ] Hover over a movie card
   - [ ] Verify prefetch request is made
   - [ ] Click on the movie
   - [ ] Verify details load instantly (from cache)

3. **Edge Cases:**
   - [ ] Rapidly scroll to bottom
   - [ ] Verify no duplicate API calls
   - [ ] Slow down network (DevTools > Network > Throttling)
   - [ ] Verify loading spinner shows
   - [ ] Verify smooth loading experience

---

## Day 3: Category Filtering & Optimization

### Morning Session (3-4 hours)

#### Task 3.1: Create Category Filter Component

**File:** `frontend/src/components/movies/CategoryFilter.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/api';
import { Loader2 } from 'lucide-react';

interface CategoryFilterProps {
  selectedSlug: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedSlug,
  onSelectCategory,
}) => {
  const { categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        <span className="text-gray-400 text-sm">Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {/* "All" button */}
      <CategoryChip
        label="All Movies"
        isActive={selectedSlug === null}
        onClick={() => onSelectCategory(null)}
      />

      {/* Category chips */}
      {categories.map(category => (
        <CategoryChip
          key={category.id}
          label={category.name}
          isActive={selectedSlug === category.slug}
          onClick={() => onSelectCategory(category.slug)}
        />
      ))}
    </div>
  );
};

interface CategoryChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  isActive,
  onClick,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
        transition-all duration-200
        ${
          isActive
            ? 'bg-gradient-primary text-white shadow-lg shadow-primary-pink/30'
            : 'bg-dark-card text-gray-400 hover:text-white hover:bg-gray-800'
        }
      `}
    >
      {label}
    </motion.button>
  );
};
```

#### Task 3.2: Add Category Filter to Home Page

**File:** `frontend/src/pages/Home.tsx`

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { MovieListInfinite } from '../components/movies/MovieListInfinite';
import { CategoryFilter } from '../components/movies/CategoryFilter';
import { useMoviesInfinite } from '../hooks/api/useMovies';
import { MovieDTO } from '@/api/types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    movies,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useMoviesInfinite({
    category: selectedCategory || undefined,
    sort: 'popularity',
  });

  const handleMovieClick = (movie: MovieDTO) => {
    navigate(`/movie/${movie.id}`);
  };

  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategory(slug);
    // Scroll to top when changing category
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />

      <div className="pt-24 px-4 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Discover Movies</h1>
          <p className="text-gray-400 mt-2">
            {movies.length} movies {selectedCategory && `in ${selectedCategory}`}
          </p>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          selectedSlug={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
            <p className="font-semibold">Error loading movies</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {/* Movie List */}
        <MovieListInfinite
          movies={movies}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
          onMovieClick={handleMovieClick}
        />
      </div>
    </div>
  );
};

export default Home;
```

### Afternoon Session (3-4 hours)

#### Task 3.3: Add Search Functionality

**File:** `frontend/src/components/movies/SearchBar.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search movies...',
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 500);

  // Trigger search when debounced value changes
  React.useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-gray-400" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-12 py-3 rounded-xl
            bg-dark-card text-white
            border border-gray-800 focus:border-primary-pink
            outline-none transition-colors
            placeholder-gray-500
          "
        />

        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-4 w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
```

#### Task 3.4: Integrate Search into Home Page

**File:** `frontend/src/pages/Home.tsx`

```typescript
// Add search state
const [searchQuery, setSearchQuery] = useState('');

// Update useMoviesInfinite params
const {
  movies,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  error,
} = useMoviesInfinite({
  category: selectedCategory || undefined,
  search: searchQuery || undefined,
  sort: 'popularity',
});

// Add SearchBar component
<div className="pt-24 px-4 max-w-7xl mx-auto pb-12">
  {/* Header */}
  <div className="mb-6">
    <h1 className="text-3xl font-bold text-white">Discover Movies</h1>
  </div>

  {/* Search Bar */}
  <div className="mb-6">
    <SearchBar onSearch={setSearchQuery} />
  </div>

  {/* Category Filter */}
  <CategoryFilter
    selectedSlug={selectedCategory}
    onSelectCategory={handleCategoryChange}
  />

  {/* ... rest of the component ... */}
</div>
```

#### Task 3.5: Add Skeleton Loaders

**File:** `frontend/src/components/movies/MovieCardSkeleton.tsx`

```typescript
export const MovieCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-2xl bg-gray-800" />
      <div className="mt-3 h-4 bg-gray-800 rounded w-3/4" />
      <div className="mt-2 h-3 bg-gray-800 rounded w-1/2" />
    </div>
  );
};

export const MovieGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
};
```

Update `MovieListInfinite.tsx` to use skeleton:

```typescript
if (isLoading && movies.length === 0) {
  return <MovieGridSkeleton />;
}
```

---

## Day 4: Polish & Testing

### Morning Session (3-4 hours)

#### Task 4.1: Add Empty States

**File:** `frontend/src/components/movies/EmptyState.tsx`

```typescript
import { Film, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  type: 'no-results' | 'no-movies';
  searchQuery?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery,
  onReset,
}) => {
  if (type === 'no-results') {
    return (
      <div className="text-center py-16">
        <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No movies found
        </h3>
        <p className="text-gray-400 mb-6">
          {searchQuery
            ? `No results for "${searchQuery}"`
            : 'Try different filters or search terms'}
        </p>
        {onReset && (
          <Button onClick={onReset} variant="secondary">
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">
        No movies available
      </h3>
      <p className="text-gray-400">
        Check back later for new content
      </p>
    </div>
  );
};
```

#### Task 4.2: Add Error Retry Logic

**File:** `frontend/src/components/movies/ErrorState.tsx`

```typescript
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="bg-red-500/10 border border-red-500 rounded-xl p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-red-500 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-400 mb-6">
        {error.message || 'Failed to load movies'}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="secondary"
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};
```

### Afternoon Session (3-4 hours)

#### Task 4.3: Performance Optimization

Add React.memo to prevent unnecessary re-renders:

**File:** `frontend/src/components/movies/MovieCard.tsx`

```typescript
export const MovieCard = React.memo<MovieCardProps>(({
  movie,
  onClick,
}) => {
  // ... component logic ...
}, (prevProps, nextProps) => {
  // Only re-render if movie ID changes
  return prevProps.movie.id === nextProps.movie.id;
});
```

#### Task 4.4: Add Analytics Tracking

**File:** `frontend/src/hooks/useAnalytics.ts`

```typescript
export const useAnalytics = () => {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // TODO: Integrate with analytics service (e.g., Mixpanel, Amplitude)
    console.log('[Analytics]', eventName, properties);
  };

  return { trackEvent };
};
```

Use in Home page:

```typescript
const { trackEvent } = useAnalytics();

const handleCategoryChange = (slug: string | null) => {
  setSelectedCategory(slug);
  trackEvent('category_selected', { category: slug || 'all' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleMovieClick = (movie: MovieDTO) => {
  trackEvent('movie_clicked', {
    movieId: movie.id,
    title: movie.title,
    source: 'discovery',
  });
  navigate(`/movie/${movie.id}`);
};
```

#### Task 4.5: Final Testing

**Complete Testing Checklist:**

**Functionality:**
- [ ] Movies load on initial page load
- [ ] Infinite scroll loads next page automatically
- [ ] Category filter changes results
- [ ] Search updates results (debounced)
- [ ] Clicking movie navigates to details
- [ ] Clear search button works
- [ ] Clear filters button works
- [ ] Hover prefetch works (check Network tab)

**Performance:**
- [ ] No duplicate API requests
- [ ] Skeleton loaders show while loading
- [ ] Smooth scrolling experience
- [ ] No layout shift when loading images
- [ ] React DevTools: No unnecessary re-renders

**Edge Cases:**
- [ ] Handle empty search results
- [ ] Handle category with no movies
- [ ] Handle API error gracefully
- [ ] Handle slow network (throttle in DevTools)
- [ ] Handle offline scenario
- [ ] Handle rapid filter changes
- [ ] Handle rapid scrolling

**Responsive Design:**
- [ ] Works on mobile (320px)
- [ ] Works on tablet (768px)
- [ ] Works on desktop (1920px)
- [ ] Horizontal scroll on category chips works
- [ ] Grid adapts to screen size

**Accessibility:**
- [ ] Can navigate with keyboard
- [ ] Focus states visible
- [ ] Images have alt text
- [ ] Semantic HTML used

---

## Common Issues & Solutions

### Issue 1: Duplicate API Calls

**Symptom:** Multiple requests to `/api/movies` in Network tab

**Solution:**
```typescript
// Ensure React.StrictMode is disabled in production
// In main.tsx
root.render(
  import.meta.env.DEV ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
);
```

### Issue 2: Infinite Scroll Not Triggering

**Symptom:** Page doesn't load more movies when scrolling

**Solution:**
Check that:
1. `hasNextPage` is truthy
2. `inView` is triggering (add console.log)
3. No errors in console
4. Backend returns correct pagination data

```typescript
// Debug logging
useEffect(() => {
  console.log('InView:', inView);
  console.log('Has Next Page:', hasNextPage);
  console.log('Is Fetching:', isFetchingNextPage);
}, [inView, hasNextPage, isFetchingNextPage]);
```

### Issue 3: Images Not Loading

**Symptom:** Broken image icons or 404 errors

**Solution:**
```typescript
// Add error fallback
const [imageError, setImageError] = useState(false);

<img
  src={imageError ? '/placeholder-poster.jpg' : movie.poster}
  onError={() => setImageError(true)}
  alt={movie.title}
/>
```

### Issue 4: Search Too Slow

**Symptom:** Input lag when typing

**Solution:**
Increase debounce delay:
```typescript
const debouncedQuery = useDebouncedValue(query, 800); // Increase from 500ms
```

---

## Next Steps

After completing Phase 4:

1. **Test with real users** - Get feedback on performance and UX
2. **Monitor API usage** - Check rate limits and caching effectiveness
3. **Optimize bundle size** - Lazy load components
4. **Proceed to Phase 4A** - Ratings integration

---

## Resources

- [React Query Infinite Queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Framer Motion](https://www.framer.com/motion/)
- [Backend API Documentation](../backend/README.md)

---

**Phase 4 Status:** Ready for Implementation
**Last Updated:** 2025-11-17
