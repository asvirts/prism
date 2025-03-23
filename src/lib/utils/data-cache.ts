export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items to store
}

export class DataCache<T> {
  private cache: Map<string, { data: T; timestamp: number }>
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.cache = new Map()
    this.options = {
      ttl: options.ttl ?? 5 * 60 * 1000, // Default: 5 minutes
      maxSize: options.maxSize ?? 100 // Default: 100 items
    }
  }

  set(key: string, data: T): void {
    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.options.maxSize) {
      const oldestKey = this.findOldestEntry()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.options.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private findOldestEntry(): string | null {
    let oldestTimestamp = Infinity
    let oldestKey: string | null = null

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    })

    return oldestKey
  }
}

// Create a data processing utility to optimize large datasets
export function optimizeDataset<T extends Record<string, any>>(
  data: T[],
  options: {
    maxRows?: number
    samplingStrategy?: "first" | "last" | "random" | "evenly"
    fields?: string[] // Only include these fields
  } = {}
): T[] {
  if (!data.length) return []

  const { maxRows = 10000, samplingStrategy = "evenly", fields } = options

  // If data is already smaller than max, just filter fields if needed
  if (data.length <= maxRows) {
    if (!fields) return data
    return data.map((item) => {
      const filtered: Partial<T> = {}
      fields.forEach((field) => {
        if (field in item) {
          filtered[field as keyof T] = item[field]
        }
      })
      return filtered as T
    })
  }

  // Sample the data based on strategy
  let sampledData: T[]

  switch (samplingStrategy) {
    case "first":
      sampledData = data.slice(0, maxRows)
      break
    case "last":
      sampledData = data.slice(-maxRows)
      break
    case "random":
      sampledData = []
      const dataClone = [...data]
      for (let i = 0; i < maxRows && dataClone.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * dataClone.length)
        sampledData.push(dataClone[randomIndex])
        dataClone.splice(randomIndex, 1)
      }
      break
    case "evenly":
    default:
      sampledData = []
      const step = data.length / maxRows
      for (let i = 0; i < maxRows; i++) {
        const index = Math.floor(i * step)
        if (index < data.length) {
          sampledData.push(data[index])
        }
      }
      break
  }

  // Filter fields if needed
  if (!fields) return sampledData

  return sampledData.map((item) => {
    const filtered: Partial<T> = {}
    fields.forEach((field) => {
      if (field in item) {
        filtered[field as keyof T] = item[field]
      }
    })
    return filtered as T
  })
}
