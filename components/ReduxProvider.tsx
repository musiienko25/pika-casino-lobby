/**
 * Redux Provider component for Next.js App Router
 * This component wraps the app with Redux store provider
 * Creates a new store instance for client-side rendering
 */

'use client';

import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from '@/store/store';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  // Create store instance only once per client
  const store = useMemo<AppStore>(() => makeStore(), []);

  return <Provider store={store}>{children}</Provider>;
}

