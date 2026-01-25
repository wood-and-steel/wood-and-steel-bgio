/**
 * Storage Configuration
 * 
 * Configuration for storage adapters. Determines which storage backend to use
 * based on environment variables.
 * 
 * Environment Variables:
 * - VITE_STORAGE_TYPE: 'localStorage' (default) or 'supabase'
 * - VITE_SUPABASE_URL: Supabase project URL (required if using supabase)
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous key (required if using supabase)
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
 * @returns {{valid: boolean, error?: string}
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
