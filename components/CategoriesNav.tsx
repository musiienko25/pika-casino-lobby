/**
 * Categories Navigation Component
 * Displays a horizontal scrollable menu of game categories
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories, setSelectedCategory } from '@/store/slices/categoriesSlice';
import {
  selectCategoriesWithSelection,
  selectCategoriesLoading,
  selectCategoriesError,
} from '@/store/selectors';
import { INITIAL_LOADER_MIN_TIME } from '@/constants';
import styles from './CategoriesNav.module.scss';

export default function CategoriesNav() {
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
    if (items.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, items.length]);

  const handleCategoryClick = useCallback((category: typeof items[0]) => {
    dispatch(setSelectedCategory(category));
  }, [dispatch]);

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
      <div className={styles.categoriesList}>
        {items.map((category) => (
          <button
            key={category.id}
            className={`${styles.categoryButton} ${
              selectedCategory?.id === category.id ? styles.active : ''
            }`}
            onClick={() => handleCategoryClick(category)}
            aria-pressed={selectedCategory?.id === category.id}
            aria-label={`Filter games by ${category.name} category`}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

