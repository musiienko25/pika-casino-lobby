/**
 * Search Bar Component
 * Allows users to search for games by name
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearchQuery } from '@/store/slices/gamesSlice';
import { selectSearchQuery } from '@/store/selectors';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { analytics } from '@/utils/analytics';
import { SEARCH_DEBOUNCE_MS } from '@/constants';
import styles from './SearchBar.module.scss';

export default function SearchBar() {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(selectSearchQuery);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use debounce hook
  const debouncedQuery = useDebounce(localQuery, SEARCH_DEBOUNCE_MS);

  // Update Redux store when debounced value changes
  useEffect(() => {
    if (debouncedQuery !== searchQuery) {
      dispatch(setSearchQuery(debouncedQuery));
      
      // Track search event
      if (analytics && debouncedQuery) {
        analytics.trackSearch(debouncedQuery);
      }
    }
  }, [debouncedQuery, searchQuery, dispatch]);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      handler: () => {
        inputRef.current?.focus();
      },
      description: 'Focus search input',
    },
    {
      key: 'k',
      metaKey: true, // Cmd+K on Mac
      handler: () => {
        inputRef.current?.focus();
      },
      description: 'Focus search input',
    },
  ]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    dispatch(setSearchQuery(''));
  }, [dispatch]);

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchInputWrapper}>
        <input
          ref={inputRef}
          type="text"
          id="search-games-input"
          name="search-games"
          className={styles.searchInput}
          placeholder="Search games... (Ctrl+K or Cmd+K)"
          value={localQuery}
          onChange={handleChange}
          aria-label="Search games"
          autoComplete="off"
        />
        {localQuery && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

