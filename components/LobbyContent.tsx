/**
 * Lobby Content Component
 * Client component that receives initial server data and populates Redux store
 */

'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCategories } from '@/store/slices/categoriesSlice';
import type { Category } from '@/types';
import CategoriesNav from './CategoriesNav';
import SearchBar from './SearchBar';
import GamesList from './GamesList';

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
  }, [dispatch, initialCategories]);

  return (
    <>
      <CategoriesNav />
      <SearchBar />
      <GamesList />
    </>
  );
}

