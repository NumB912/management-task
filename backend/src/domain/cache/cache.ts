export interface ICache {
  get<T>(key: string): Promise<T | null>;
  /** Results follow key order; missing keys return null at their position. */
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
