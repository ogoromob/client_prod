import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Cache } from '../cache';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache<string>(1000); // 1 second TTL
  });

  it('stores and retrieves values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns null for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('respects TTL', async () => {
    cache.set('key1', 'value1', 100); // 100ms TTL
    expect(cache.get('key1')).toBe('value1');
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(cache.get('key1')).toBeNull();
  });

  it('deletes entries', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    
    cache.delete('key1');
    expect(cache.has('key1')).toBe(false);
  });

  it('clears all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    expect(cache.size()).toBe(2);
    
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it('cleans up expired entries', async () => {
    cache.set('key1', 'value1', 100);
    cache.set('key2', 'value2', 1000);
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const cleaned = cache.cleanup();
    expect(cleaned).toBe(1);
    expect(cache.size()).toBe(1);
    expect(cache.has('key2')).toBe(true);
  });

  it('getOrSet retrieves cached value', async () => {
    const factory = vi.fn().mockResolvedValue('computed');
    
    cache.set('key1', 'cached');
    const value = await cache.getOrSet('key1', factory);
    
    expect(value).toBe('cached');
    expect(factory).not.toHaveBeenCalled();
  });

  it('getOrSet computes and caches new value', async () => {
    const factory = vi.fn().mockResolvedValue('computed');
    
    const value = await cache.getOrSet('key1', factory);
    
    expect(value).toBe('computed');
    expect(factory).toHaveBeenCalledTimes(1);
    expect(cache.get('key1')).toBe('computed');
  });
});
