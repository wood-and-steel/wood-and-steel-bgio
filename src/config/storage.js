/**
 * Storage Configuration
 * 
 * Configuration for storage adapters. Determines which storage backend to use
 * based on environment variables.
 * 
 * @deprecated VITE_STORAGE_TYPE environment variable is deprecated.
 * Storage type selection is now managed by StorageProvider context.
 * The tab bar in the lobby screen allows users to switch between Local and Cloud storage.
 * 
 * This file is kept for backward compatibility and for reading Supabase configuration.
 * 
 * Environment Variables:
 * - VITE_STORAGE_TYPE: 'localStorage' (default) or 'supabase' (DEPRECATED - use StorageProvider)
 * - VITE_SUPABASE_URL: Supabase project URL (required for cloud storage)
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous key (required for cloud storage)
 */

export const STORAGE_TYPE = import.meta.env.VITE_STORAGE_TYPE || 'localStorage';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Check if Supabase configuration is available
 * @returns {boolean} True if both URL and key are provided
 */
export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Validate storage configuration
 * @returns {{valid: boolean, error?: string}}
 */
export function validateStorageConfig() {
  if (STORAGE_TYPE === 'supabase') {
    if (!SUPABASE_URL) {
      return {
        valid: false,
        error: 'VITE_SUPABASE_URL is required when using supabase storage'
      };
    }
    if (!SUPABASE_ANON_KEY) {
      return {
        valid: false,
        error: 'VITE_SUPABASE_ANON_KEY is required when using supabase storage'
      };
    }
  }
  
  return { valid: true };
}
