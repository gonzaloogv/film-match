/**
 * Search Page
 *
 * Movie discovery and search page with filtering, sorting, and pagination
 * Displays search results based on applied filters
 * Persists filter state in URL query parameters
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sliders } from 'lucide-react';
import Navbar from '../components/Navbar';
import { SearchBar } from '../presentation/components/Search/SearchBar';
import { SearchFiltersModal } from '../presentation/components/Search/SearchFiltersModal';
import { SearchResults } from '../presentation/components/Search/SearchResults';
import { Pagination } from '../presentation/components/Search/Pagination';
import { useFiltersContext } from '../context/filters/useFiltersContext';
import { useMovies } from '@/hooks/api/useMovies';
import { MovieMapper } from '@/api/mappers';
import type { Movie } from '@core';
import type { DecadeOption, TrendOption, SortOption } from '../context/filters/FiltersContext';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const {
    criteria,
    updateSearch,
    updateGenres,
    updateMinRating,
    setDecade,
    setTrend,
    setSortBy,
    setCurrentPage,
    pagination,
    decade,
    trend,
    sortBy,
  } = useFiltersContext();

  const isInitializedRef = useRef(false);

  // Build API query params
  const apiParams = useMemo(() => ({
    search: criteria.search || undefined,
    minRating: criteria.minRating > 0 ? criteria.minRating * 2 : undefined, // Convert 0-5 to 0-10
    page: pagination.currentPage,
    limit: pagination.itemsPerPage,
    sortBy: sortBy === 'title' ? 'title' : sortBy === 'rating' ? 'vote_average' : 'release_date',
    sortOrder: 'desc' as const,
  }), [criteria.search, criteria.minRating, pagination.currentPage, pagination.itemsPerPage, sortBy]);

  // Fetch movies from API
  const { moviesData, isLoadingMovies } = useMovies(apiParams);

  // Client-side filtering for features not supported by API
  const filteredMovies = useMemo(() => {
    let results: Movie[] = moviesData?.data?.map(dto => MovieMapper.toDomain(dto)) || [];

    // Apply decade filter
    if (decade !== 'all') {
      const decadeRanges: { [key: string]: [number, number] } = {
        '70s': [1970, 1979],
        '80s': [1980, 1989],
        '90s': [1990, 1999],
        '00s': [2000, 2009],
        '10s': [2010, 2019],
        '20s': [2020, 2029],
      };

      const [minYear, maxYear] = decadeRanges[decade] || [1970, new Date().getFullYear()];
      results = results.filter((movie) => movie.year >= minYear && movie.year <= maxYear);
    }

    // Apply trend filter (based on movie rating and year)
    if (trend !== 'all') {
      const currentYear = new Date().getFullYear();
      if (trend === 'trending') {
        // Trending: newer movies with high ratings
        results = results.filter((movie) => movie.rating >= 3.5 && movie.year >= currentYear - 3);
      } else if (trend === 'recent') {
        // Recent: movies from last 5 years
        results = results.filter((movie) => movie.year >= currentYear - 5);
      } else if (trend === 'oldest') {
        // Oldest: movies before 2000
        results = results.filter((movie) => movie.year < 2000);
      }
    }

    // Apply sorting (API already sorts, but we may need client-side after filtering)
    switch (sortBy) {
      case 'title':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'date':
        results.sort((a, b) => b.year - a.year);
        break;
    }

    return results;
  }, [moviesData, decade, trend, sortBy]);

  const totalResults = filteredMovies.length;
  const totalPages = Math.ceil(totalResults / pagination.itemsPerPage);
  const currentPage = pagination.currentPage;

  // Initialize filters from URL on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const query = searchParams.get('query');
    const decadeParam = searchParams.get('decade') as DecadeOption;
    const genres = searchParams.getAll('genres');
    const rating = searchParams.get('rating');
    const trendParam = searchParams.get('trend') as TrendOption;
    const sortParam = searchParams.get('sort') as SortOption;
    const page = searchParams.get('page');

    if (query) updateSearch(query);
    if (decadeParam) setDecade(decadeParam);
    if (genres.length > 0) updateGenres(genres);
    if (rating) updateMinRating(parseFloat(rating));
    if (trendParam) setTrend(trendParam);
    if (sortParam) setSortBy(sortParam);
    if (page) setCurrentPage(parseInt(page, 10));
  }, []); // Only run on mount

  // Update URL when filters change
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const newParams = new URLSearchParams();

    if (criteria.search) newParams.set('query', criteria.search);
    if (decade !== 'all') newParams.set('decade', decade);
    if (criteria.genres.length > 0) {
      criteria.genres.forEach((g) => newParams.append('genres', g));
    }
    if (criteria.minRating > 0) newParams.set('rating', criteria.minRating.toString());
    if (trend !== 'all') newParams.set('trend', trend);
    if (sortBy !== 'title') newParams.set('sort', sortBy);
    if (currentPage > 1) newParams.set('page', currentPage.toString());

    setSearchParams(newParams);
  }, [criteria.search, criteria.genres, criteria.minRating, decade, trend, sortBy, currentPage, setSearchParams]);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />

      {/* Main Content */}
      <div className="pt-24 pb-12 px-3 xs:px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header with Search and Filters Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 xs:mb-12"
        >
          <h1 className="text-3xl xs:text-4xl font-bold text-white mb-4 xs:mb-6">
            Buscar Películas
          </h1>

          {/* Search Bar with Filters Button */}
          <div className="flex gap-3 xs:gap-4">
            <div className="flex-1">
              <SearchBar placeholder="Buscar por título, director, actor..." />
            </div>
            <button
              onClick={() => setFiltersModalOpen(true)}
              className="px-4 xs:px-6 py-2.5 xs:py-3 bg-dark-card border border-gray-700 rounded-lg xs:rounded-xl hover:border-primary-pink transition-all flex items-center gap-2 xs:gap-3 text-xs xs:text-sm sm:text-base font-medium text-white hover:text-primary-pink whitespace-nowrap"
            >
              <Sliders className="w-4 xs:w-5 h-4 xs:h-5 flex-shrink-0" />
              <span className="hidden xs:inline">Filtros</span>
            </button>
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isLoadingMovies ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink"></div>
            </div>
          ) : (
            <>
              <SearchResults movies={filteredMovies} totalResults={totalResults} />

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalResults={totalResults}
                  itemsPerPage={pagination.itemsPerPage}
                />
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Filters Modal */}
      <SearchFiltersModal isOpen={filtersModalOpen} onClose={() => setFiltersModalOpen(false)} />
    </div>
  );
};

export default Search;
