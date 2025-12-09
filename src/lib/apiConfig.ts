/**
 * API URL Configuration
 * Automatically detects the correct API endpoint based on environment
 */

export function getApiUrl(): string {
  // Check if VITE_API_URL is explicitly set (highest priority)
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    console.log(`✓ Using VITE_API_URL: ${envApiUrl}`);
    return envApiUrl;
  }

  // Check if accessing via DevTunnel (contains "devtunnels" in hostname)
  if (window.location.hostname.includes('devtunnels')) {
    const apiUrl = `${window.location.protocol}//${window.location.hostname}/api`;
    console.log(`✓ DevTunnel detected, using: ${apiUrl}`);
    return apiUrl;
  }

  // In development, detect if running on mobile via port forwarding
  if (import.meta.env.DEV) {
    // Check if current host is localhost or 127.0.0.1 (desktop development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }

    // If accessed via IP address (port forwarding on phone)
    // Use the same IP with port 5000
    return `http://${window.location.hostname}:5000/api`;
  }

  // Production fallback
  return `${window.location.protocol}//${window.location.host}/api`;
}

/**
 * Log API configuration for debugging
 */
export function debugApiConfig(): void {
  if (import.meta.env.DEV) {
    console.log('🔍 API Configuration Debug:');
    console.log(`  Current Host: ${window.location.hostname}`);
    console.log(`  Current Port: ${window.location.port}`);
    console.log(`  API URL: ${getApiUrl()}`);
    console.log(`  Environment: ${import.meta.env.DEV ? 'Development' : 'Production'}`);
  }
}
