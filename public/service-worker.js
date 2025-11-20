/**
 * Service Worker
 * Empty service worker to prevent 404 errors
 */

self.addEventListener('install', () => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Take control of all pages immediately
  self.clients.claim();
});

