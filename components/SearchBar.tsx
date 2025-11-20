/**
 * Search Bar Component
 * Allows users to search for games by name
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearchQuery } from '@/store/slices/gamesSlice';
import { selectSearchQuery } from '@/store/selectors';
import { useDebounce } from '@/hooks/useDebounce';
import { SEARCH_DEBOUNCE_MS } from '@/constants';
import styles from './SearchBar.module.scss';

export default function SearchBar() {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(selectSearchQuery);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  
  // Use debounce hook
  const debouncedQuery = useDebounce(localQuery, SEARCH_DEBOUNCE_MS);

  // Update Redux store when debounced value changes
  useEffect(() => {
    if (debouncedQuery !== searchQuery) {
      dispatch(setSearchQuery(debouncedQuery));
    }
  }, [debouncedQuery, searchQuery, dispatch]);

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
          type="text"
          id="search-games-input"
          name="search-games"
          className={styles.searchInput}
          placeholder="Search games..."
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

