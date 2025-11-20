/**
 * Utility for generating blur placeholder data URLs
 * Creates a tiny 10x10 pixel image with a blur effect
 * Works on both client and server
 */

/**
 * Generates a blur placeholder data URL using SVG (works on server and client)
 * @param width - Width of the placeholder (default: 10)
 * @param height - Height of the placeholder (default: 10)
 * @param color - Background color (default: '#e0e0e0')
 * @returns Base64 encoded data URL
 */
export function generateBlurDataURL(
  width = 10,
  height = 10,
  color = '#e0e0e0'
): string {
  // Use SVG for universal compatibility (works on server and client)
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${color}"/>
  </svg>`;
  
  // Encode to base64
  if (typeof window === 'undefined') {
    // Server-side: use Buffer
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  } else {
    // Client-side: use btoa
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}

/**
 * Predefined blur placeholder for game thumbnails
 * Light gray background matching the design
 * This is a base64-encoded SVG that works on both server and client
 */
export const GAME_THUMBNAIL_BLUR = generateBlurDataURL(10, 10, '#e0e0e0');

