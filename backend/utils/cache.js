/**
 * Minimal in-memory TTL cache.
 *
 * Good enough for a single-instance deployment (Railway/Render free tier runs
 * one process). If this app ever needed multiple instances behind a load
 * balancer, this would need to move to Redis — noting that here so it's a
 * deliberate, explainable tradeoff rather than an oversight.
 */
class TTLCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * @param {string} key
   * @param {number} ttlMs - how long the value stays valid, in milliseconds
   * @param {Function} fetchFn - async function that produces the value on a miss
   */
  async getOrSet(key, ttlMs, fetchFn) {
    const cached = this.store.get(key);
    const now = Date.now();

    if (cached && now - cached.setAt < ttlMs) {
      return cached.value;
    }

    const value = await fetchFn();
    this.store.set(key, { value, setAt: now });
    return value;
  }

  clear() {
    this.store.clear();
  }
}

module.exports = new TTLCache(); // singleton — shared across the whole app
