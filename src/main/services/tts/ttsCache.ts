import fs from 'fs'
import path from 'path'
import { app } from 'electron'

interface CacheEntry {
  audioBase64: string
  createdAt: number
  lastAccessAt: number
}

interface CacheData {
  version: number
  entries: Record<string, CacheEntry>
}

const CACHE_VERSION = 1
const MAX_ENTRIES = 500
const CACHE_FILE = path.join(app.getPath('userData'), 'tts-cache.json')

let cache: CacheData = { version: CACHE_VERSION, entries: {} }
let loaded = false

/** 简单 hash（FNV-1a 32bit），把长文本压成短 key；拼上长度降低碰撞概率 */
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

/** 命中返回 base64，否则 null */
export function getCachedAudio(key: string): string | null {
  load()
  const hashed = hashText(key)
  const entry = cache.entries[hashed]
  if (!entry) return null
  entry.lastAccessAt = Date.now()
  return entry.audioBase64
}

/** 写入缓存（仅成功结果调用） */
export function setCachedAudio(key: string, audioBase64: string): void {
  load()
  const hashed = hashText(key)
  const now = Date.now()
  cache.entries[hashed] = {
    audioBase64,
    createdAt: now,
    lastAccessAt: now
  }

  // 超出上限，按 lastAccessAt 淘汰最久未用的
  const keys = Object.keys(cache.entries)
  if (keys.length > MAX_ENTRIES) {
    keys
      .sort((a, b) => cache.entries[a].lastAccessAt - cache.entries[b].lastAccessAt)
      .slice(0, keys.length - MAX_ENTRIES)
      .forEach((k) => delete cache.entries[k])
  }

  save()
}

/** 清空缓存（换音色/调试用） */
export function clearCache(): void {
  cache = { version: CACHE_VERSION, entries: {} }
  save()
}

/** 缓存统计（调试/设置页展示用） */
export function cacheStats(): { count: number; sizeBytes: number } {
  load()
  const count = Object.keys(cache.entries).length
  let bytes = 0
  for (const k in cache.entries) bytes += cache.entries[k].audioBase64.length
  return { count, sizeBytes: bytes }
}
