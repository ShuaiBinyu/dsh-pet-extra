import Store from 'electron-store'
import { safeStorage } from 'electron'

// 定义聊天消息的严格类型
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// 定义存储的配置数据结构（所有字段都是 string，除了 chat_history）
export interface ConfigSchema {
  deepseekApiKey: string
  deepseekApiUrl: string
  deepseekModel: string
  chat_history: ChatMessage[]
  volcAppId: string
  volcAccessToken: string
  volcVoiceType: string
}

// 允许进行加密操作的字符串字段（限制 Key 的范围，防止误传 chat_history）
export type SecureStringKey = 'deepseekApiKey' | 'volcAccessToken'

// 实例化并导出 store
const store = new Store<ConfigSchema>({
  name: 'pet-config',
  defaults: {
    deepseekApiKey: '',
    deepseekApiUrl: 'https://api.deepseek.com',
    deepseekModel: 'deepseek-chat',
    chat_history: [],
    volcAppId: '',
    volcAccessToken: '',
    volcVoiceType: 'zh_female_vv_uranus_bigtts'
  }
})

// ========== 加密存取方法 ==========

/** 加密写入敏感信息 */
// 使用 Electron safeStorage 加密保存敏感配置，无法加密时保留明文兼容行为。
export function setSecureStore(key: SecureStringKey, value: string): void {
  if (!value) {
    // delete 方法支持泛型，不需要 as any
    store.delete(key)
    return
  }

  try {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(value)
      // 这里的 value 是 string，ConfigSchema 里对应的 key 也是 string，完全合法，不需要 any
      store.set(key, `SEC:${encrypted.toString('base64')}`)
    } else {
      store.set(key, value)
    }
  } catch (e) {
    console.error(`【Store】加密 ${key} 失败`, e)
    store.set(key, value)
  }
}

/** 解密读取敏感信息 */
// 读取敏感配置并解密；同时兼容历史明文配置。
export function getSecureStore(key: SecureStringKey): string {
  // get 方法有完整的类型推导，这里 raw 被推导为 string
  const raw = store.get(key)
  if (!raw) return ''

  // 如果带有 SEC: 前缀，说明是密文，进行解密
  if (raw.startsWith('SEC:')) {
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const base64Data = raw.replace('SEC:', '')
        const buffer = Buffer.from(base64Data, 'base64')
        return safeStorage.decryptString(buffer)
      }
    } catch (e) {
      console.error(`【Store】解密 ${key} 失败`, e)
      return ''
    }
  }

  // 如果没有前缀，说明是旧版的明文（兼容老数据）
  return raw
}

export default store
