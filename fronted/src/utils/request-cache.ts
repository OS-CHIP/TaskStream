/**
 * 简单的请求缓存机制
 * 用于防止短时间内重复请求相同的数据
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  promise?: Promise<T>
}

class RequestCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5分钟缓存时间

  /**
   * 获取缓存的数据或执行请求
   * @param key 缓存键
   * @param fetcher 数据获取函数
   * @param ttl 缓存时间（毫秒），默认5分钟
   * @returns 缓存的数据或新请求的数据
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const now = Date.now()
    const entry = this.cache.get(key)

    // 如果缓存存在且未过期，返回缓存数据
    if (entry && (now - entry.timestamp) < ttl) {
      return entry.data as T
    }

    // 如果正在请求中，返回正在进行的Promise
    if (entry?.promise) {
      return entry.promise as Promise<T>
    }

    // 创建新的请求
    const promise = fetcher()
    
    // 临时存储Promise，防止重复请求
    this.cache.set(key, {
      data: null,
      timestamp: now,
      promise
    })

    try {
      const data = await promise
      // 请求成功，更新缓存
      this.cache.set(key, {
        data,
        timestamp: now
      })
      return data
    } catch (error) {
      // 请求失败，移除缓存
      this.cache.delete(key)
      throw error
    }
  }

  /**
   * 清除指定键的缓存
   * @param key 缓存键
   */
  clear(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清除所有缓存
   */
  clearAll(): void {
    this.cache.clear()
  }

  /**
   * 清除过期的缓存
   */
  clearExpired(ttl: number = this.defaultTTL): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// 导出单例实例
export const requestCache = new RequestCache()

// 导出类型
export type { CacheEntry }
export { RequestCache }