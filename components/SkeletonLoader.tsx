/**
 * Skeleton Loader Component
 * Shows animated placeholder while content is loading
 */

import styles from './SkeletonLoader.module.scss';

interface SkeletonLoaderProps {
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ count = 1, className }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${styles.skeleton} ${className || ''}`}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLineShort}></div>
          </div>
        </div>
      ))}
    </>
  );
}

