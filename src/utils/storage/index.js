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
 * Cached storage adapter instances by storage type
 * This ensures only one adapter instance per storage type is created
 */
const adapterCache = new Map();

/**
 * Get or create a storage adapter instance for the given storage type
 * Adapters are cached and reused to prevent multiple instances of the same type
 * @param {string} [storageType] - Storage type ('local' or 'cloud'). If not provided, reads from env variable.
 * @returns {StorageAdapter} The storage adapter instance
 */
export function getStorageAdapter(storageType = null) {
  // Determine the storage type to use
  const typeToUse = storageType || STORAGE_TYPE;
  
  // Normalize storage type values
  const normalizedType = typeToUse === 'supabase' || typeToUse === 'cloud' ? 'cloud' : 'local';
  
  // Return cached adapter if it exists
  if (adapterCache.has(normalizedType)) {
    return adapterCache.get(normalizedType);
  }
  
  // Create and cache new adapter
  const adapter = createStorageAdapter(normalizedType);
  adapterCache.set(normalizedType, adapter);
  return adapter;
}

/**
 * Set a custom storage adapter instance for a specific storage type (useful for testing)
 * @param {string} storageType - Storage type ('local' or 'cloud')
 * @param {StorageAdapter} adapter - The storage adapter to use
 */
export function setStorageAdapter(storageType, adapter) {
  const normalizedType = storageType === 'supabase' || storageType === 'cloud' ? 'cloud' : 'local';
  adapterCache.set(normalizedType, adapter);
}
