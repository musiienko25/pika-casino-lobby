/**
 * Main Games Lobby Page
 * Server-side rendered page that displays categories, search, and games list
 */

import { fetchConfig } from '@/services/api';
import LobbyContent from '@/components/LobbyContent';
import styles from './page.module.scss';

export default async function Home() {
  // Server-side fetch of categories for initial render (SSR)
  let initialCategories = [];
  try {
    initialCategories = await fetchConfig();
  } catch (error) {
    console.error('Failed to fetch initial categories:', error);
    // Continue with empty categories - client will retry
  }

  return (
    <div className={styles.lobby}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pika Casino Games Lobby</h1>
        <p className={styles.subtitle}>
          Discover and play your favorite casino games
        </p>
      </header>

      <main className={styles.main}>
        <LobbyContent initialCategories={initialCategories} />
      </main>
    </div>
  );
}
