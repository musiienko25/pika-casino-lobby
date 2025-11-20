/**
 * Categories Navigation Component
 * Displays a horizontal scrollable menu of game categories
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories, setSelectedCategory } from '@/store/slices/categoriesSlice';
import { INITIAL_LOADER_MIN_TIME } from '@/constants';
import styles from './CategoriesNav.module.scss';

export default function CategoriesNav() {
  const dispatch = useAppDispatch();
  const { items, selectedCategory, loading, error } = useAppSelector(
    (state) => state.categories
  );
  
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
  if ((loading || showInitialLoader) && items.length === 0) {
    return (
      <nav className={styles.categoriesNav}>
        <div className={styles.loading}>Loading categories...</div>
      </nav>
    );
  }

  if (error && items.length === 0) {
    return (
      <nav className={styles.categoriesNav}>
        <div className={styles.error}>Error: {error}</div>
      </nav>
    );
  }

  if (items.length === 0) {
    return (
      <nav className={styles.categoriesNav}>
        <div className={styles.empty}>No categories available</div>
      </nav>
    );
  }

  return (
    <nav className={styles.categoriesNav} role="navigation" aria-label="Game categories">
      <div className={styles.categoriesList} role="list">
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
            role="listitem"
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

