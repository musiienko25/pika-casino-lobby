/**
 * Lobby Content Component
 * Client component that receives initial server data and populates Redux store
 */

'use client';

import { useEffect, Suspense, lazy } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCategories } from '@/store/slices/categoriesSlice';
import type { Category } from '@/types';
import { analytics } from '@/utils/analytics';
import CategoriesNav from './CategoriesNav'; // Keep CategoriesNav non-lazy since it's critical for SSR
import SearchBar from './SearchBar'; // Keep SearchBar non-lazy to avoid layout shift
import SkeletonLoader from './SkeletonLoader';
import styles from './LobbyContent.module.scss';

// Lazy load components that are not critical for initial render
const GamesList = lazy(() => import('./GamesList'));

interface LobbyContentProps {
  initialCategories: Category[];
}

export default function LobbyContent({ initialCategories }: LobbyContentProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Pre-populate categories from server-side data
    if (initialCategories.length > 0) {
      dispatch(setCategories(initialCategories));
    }

    // Track page view
    if (analytics) {
      analytics.trackPageView('/');
    }
  }, [dispatch, initialCategories]);

  return (
    <>
      {/* CategoriesNav and SearchBar are not lazy-loaded to avoid hydration mismatch and layout shift */}
      <CategoriesNav />
      <SearchBar />
      <Suspense fallback={<div className={styles.loadingPlaceholder}><SkeletonLoader count={10} /></div>}>
        <GamesList />
      </Suspense>
    </>
  );
}

