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
export * from './migration';

/**
 * Create and return the appropriate storage adapter based on configuration
 * @param {string} [storageType] - Optional storage type ('local' or 'cloud'). If not provided, reads from env variable.
 * @returns {StorageAdapter} The configured storage adapter instance
 */
export function createStorageAdapter(storageType = null) {
  // If storageType is provided, use it (for StorageProvider)
  const typeToUse = storageType || STORAGE_TYPE;
  
  // Normalize storage type values
  const normalizedType = typeToUse === 'supabase' || typeToUse === 'cloud' ? 'cloud' : 'local';
  
  if (normalizedType === 'cloud') {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('[createStorageAdapter] Supabase URL or key missing. Falling back to localStorage.');
      return new LocalStorageAdapter();
    }
    return new SupabaseAdapter(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  
  // Default to localStorage
  return new LocalStorageAdapter();
}

/**
 * Default storage adapter instance
 * This is initialized once and reused throughout the application
 */
let defaultAdapter = null;

/**
 * Get or create the default storage adapter instance
 * @param {string} [storageType] - Optional storage type ('local' or 'cloud'). If not provided, reads from env variable.
 * @returns {StorageAdapter} The default storage adapter
 */
export function getStorageAdapter(storageType = null) {
  // If storageType is provided, create a new adapter for that type
  // Otherwise, use the default cached adapter (for backward compatibility)
  if (storageType) {
    return createStorageAdapter(storageType);
  }
  
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
