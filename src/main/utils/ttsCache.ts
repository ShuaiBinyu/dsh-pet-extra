import fs from 'fs'
import path from 'path'
import { app } from 'electron'

interface CacheEntry {
  audioBase64: string
  createdAt: number
  lastAccessAt: number // 👈 新增：记录最后一次使用的时间
}

interface CacheData {
  version: number
  entries: Record<string, CacheEntry>
}

const CACHE_VERSION = 2 // 👈 版本升级，因为数据结构加了 lastAccessAt
const MAX_ENTRIES = 200 // 最大条数
const MAX_SIZE_MB = 50  // 👈 最大总容量 (50MB)
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const CACHE_FILE = path.join(app.getPath('userData'), 'tts-cache.json')

let cache: CacheData = { version: CACHE_VERSION, entries: {} }
let loaded = false

function hashText(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0') + '_' + text.length
}

function load(): void {
  if (loaded) return
  loaded = true
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf-8')
      const parsed = JSON.parse(raw) as CacheData
      if (parsed.version === CACHE_VERSION && parsed.entries) {
        cache = parsed
      }
    }
  } catch (e) {
    console.warn('【TTS 缓存】读取失败，使用空缓存', e)
    cache = { version: CACHE_VERSION, entries: {} }
  }
}

function save(): void {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf-8')
  } catch (e) {
    console.warn('【TTS 缓存】写入失败', e)
  }
}

/** 查询缓存 */
export function getCachedAudio(text: string): string | null {
  load()
  const key = hashText(text)
  const entry = cache.entries[key]
  if (!entry) return null

  // 👈 命中缓存时，更新最后使用时间（LRU 标记）
  entry.lastAccessAt = Date.now()
  // 注意：这里为了性能，不立刻 save() 磁盘，下次写入时会一起保存，或者可以在后台防抖保存

  return entry.audioBase64
}

/** 计算当前缓存占用的字节数 */
function calculateCurrentSize(): number {
  let bytes = 0
  for (const k in cache.entries) {
    // base64 长度 * 0.75 约等于实际字节数，这里粗略计算即可
    bytes += cache.entries[k].audioBase64.length
  }
  return bytes
}

/** 写入缓存 */
export function setCachedAudio(text: string, audioBase64: string): void {
  load()
  const key = hashText(text)
  const now = Date.now()

  cache.entries[key] = {
    audioBase64,
    createdAt: now,
    lastAccessAt: now
  }

  // 👈 核心机制：清理策略
  let keys = Object.keys(cache.entries)

  // 1. 先清理条数超限
  if (keys.length > MAX_ENTRIES) {
    keys.sort((a, b) => cache.entries[a].lastAccessAt - cache.entries[b].lastAccessAt)
    const toDelete = keys.slice(0, keys.length - MAX_ENTRIES)
    toDelete.forEach((k) => delete cache.entries[k])
    keys = Object.keys(cache.entries) // 重新获取
  }

  // 2. 再清理容量超限
  let currentSize = calculateCurrentSize()
  if (currentSize > MAX_SIZE_BYTES) {
    // 按最后访问时间从旧到新排序
    keys.sort((a, b) => cache.entries[a].lastAccessAt - cache.entries[b].lastAccessAt)

    for (const k of keys) {
      if (currentSize <= MAX_SIZE_BYTES) break // 降到安全线以下就停止

      // 减去被删除项的大小
      currentSize -= cache.entries[k].audioBase64.length
      delete cache.entries[k]
    }
  }

  save()
}

/** 调试：清空缓存 */
export function clearCache(): void {
  cache = { version: CACHE_VERSION, entries: {} }
  save()
}

/** 调试：缓存统计 */
export function cacheStats(): { count: number; sizeBytes: number } {
  load()
  const count = Object.keys(cache.entries).length
  const bytes = calculateCurrentSize()
  // 👇 直接返回原始字节数，让前端去决定显示 KB 还是 MB
  return { count, sizeBytes: bytes }
}
