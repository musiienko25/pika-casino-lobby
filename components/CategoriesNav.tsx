/**
 * Categories Navigation Component
 * Displays a horizontal scrollable menu of game categories
 */

'use client';

import { useEffect, useState, useCallback, useRef, memo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories, setSelectedCategory } from '@/store/slices/categoriesSlice';
import {
  selectCategoriesWithSelection,
  selectCategoriesLoading,
  selectCategoriesError,
} from '@/store/selectors';
import { analytics } from '@/utils/analytics';
import { INITIAL_LOADER_MIN_TIME } from '@/constants';
import styles from './CategoriesNav.module.scss';

function CategoriesNav() {
  const dispatch = useAppDispatch();
  
  // Use memoized selectors
  const { categories: items, selectedCategory, hasCategories } = useAppSelector(
    selectCategoriesWithSelection
  );
  const loading = useAppSelector(selectCategoriesLoading);
  const error = useAppSelector(selectCategoriesError);
  
  // Show loader for at least 1 second to prevent flickering
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoader(false);
    }, INITIAL_LOADER_MIN_TIME);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Fetch categories on mount only if not already loaded
    // This ensures we don't fetch if categories were pre-populated from SSR
    if (items.length === 0 && !loading) {
      dispatch(fetchCategories());
    }
  }, [dispatch, items.length, loading]);

  const handleCategoryClick = useCallback((category: typeof items[0]) => {
    dispatch(setSelectedCategory(category));
    
    // Track category selection
    if (analytics) {
      analytics.trackCategorySelect(category.id, category.name);
    }
  }, [dispatch]);

  // Keyboard navigation
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Set focused index when category is selected
  useEffect(() => {
    if (selectedCategory) {
      const index = items.findIndex((cat) => cat.id === selectedCategory.id);
      if (index !== -1) {
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
          setFocusedIndex(index);
        }, 0);
      }
    }
  }, [selectedCategory, items]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const direction = e.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + items.length) % items.length;
      setFocusedIndex(nextIndex);
      buttonRefs.current[nextIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusedIndex(0);
      buttonRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = items.length - 1;
      setFocusedIndex(lastIndex);
      buttonRefs.current[lastIndex]?.focus();
    }
  }, [items.length]);

  // Show loader if loading or during first second
  if ((loading || showInitialLoader) && !hasCategories) {
    return (
      <nav className={styles.categoriesNav}>
        <div className={styles.loading}>Loading categories...</div>
      </nav>
    );
  }

  if (error && !hasCategories) {
    return (
      <nav className={styles.categoriesNav}>
        <div className={styles.error}>Error: {error}</div>
      </nav>
    );
  }

  if (!hasCategories) {
    return (
      <nav className={styles.categoriesNav}>
        <div className={styles.empty}>No categories available</div>
      </nav>
    );
  }

  return (
    <nav className={styles.categoriesNav} role="navigation" aria-label="Game categories">
      <div className={styles.categoriesList} role="tablist">
        {items.map((category, index) => (
          <button
            key={category.id}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            className={`${styles.categoryButton} ${
              selectedCategory?.id === category.id ? styles.active : ''
            }`}
            onClick={() => handleCategoryClick(category)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            aria-selected={selectedCategory?.id === category.id}
            aria-label={`Filter games by ${category.name} category`}
            role="tab"
            tabIndex={focusedIndex === index ? 0 : -1}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default memo(CategoriesNav);

