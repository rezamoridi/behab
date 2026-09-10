// src/services/cache/queryCache.js
class QueryCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  remove(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    return this.get(key) !== null;
  }

  async getOrFetch(key, fetchFn, ttl = this.defaultTTL) {
    const cached = this.get(key);
    if (cached) return cached;

    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }
}

export const queryCache = new QueryCache();

export const farmCache = {
  data: null,
  timestamp: null,
  cacheDuration: 5 * 60 * 1000,

  get() {
    if (!this.data || !this.timestamp) return null;
    const now = Date.now();
    if (now - this.timestamp > this.cacheDuration) {
      this.clear();
      return null;
    }
    return this.data;
  },

  set(data) {
    this.data = data;
    this.timestamp = Date.now();
  },

  clear() {
    this.data = null;
    this.timestamp = null;
  },

  isValid() {
    return this.get() !== null;
  },
};