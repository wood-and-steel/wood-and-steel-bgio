/**
 * Storage Adapters
 * 
 * Exports storage adapter classes and factory functions.
 * This module provides a unified interface for game storage operations.
 */

import { StorageAdapter } from './storageAdapter';
import { LocalStorageAdapter } from './localStorageAdapter';
import { SupabaseAdapter } from './supabaseAdapter';
import { STORAGE_TYPE, SUPABASE_URL, SUPABASE_ANON_KEY, validateStorageConfig } from '../../config/storage';

export { StorageAdapter } from './storageAdapter';
export { LocalStorageAdapter } from './localStorageAdapter';
export { SupabaseAdapter } from './supabaseAdapter';

/**
 * Create and return the appropriate storage adapter based on configuration
 * @returns {StorageAdapter} The configured storage adapter instance
 */
export function createStorageAdapter() {
  const config = validateStorageConfig();
  if (!config.valid) {
    console.warn(`[createStorageAdapter] Invalid storage config: ${config.error}. Falling back to localStorage.`);
    return new LocalStorageAdapter();
  }

  switch (STORAGE_TYPE) {
    case 'supabase':
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('[createStorageAdapter] Supabase URL or key missing. Falling back to localStorage.');
        return new LocalStorageAdapter();
      }
      return new SupabaseAdapter(SUPABASE_URL, SUPABASE_ANON_KEY);
    case 'localStorage':
    default:
      return new LocalStorageAdapter();
  }
}

/**
 * Default storage adapter instance
 * This is initialized once and reused throughout the application
 */
let defaultAdapter = null;

/**
 * Get or create the default storage adapter instance
 * @returns {StorageAdapter} The default storage adapter
 */
export function getStorageAdapter() {
  if (!defaultAdapter) {
    defaultAdapter = createStorageAdapter();
  }
  return defaultAdapter;
}

/**
 * Set a custom storage adapter instance (useful for testing)
 * @param {StorageAdapter} adapter - The storage adapter to use
 */
export function setStorageAdapter(adapter) {
  defaultAdapter = adapter;
}
