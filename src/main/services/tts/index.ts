// 👇 1. 引入 getSecureStore
import store, { getSecureStore } from '../../utils/store'
import { synthesizeWithVolcano } from './volcanoTts'
import { synthesizeWithEdge } from './edgeTts'
import { getCachedAudio, setCachedAudio } from './ttsCache'

export interface TTSResult {
  success: boolean
  audioBase64?: string
}

/** 并发去重：同一 key 正在合成时复用同一个 Promise */
const pending = new Map<string, Promise<TTSResult>>()

/**
 * 生成语音的统一入口。
 * 流程：查缓存 -> 并发去重 -> 火山（有凭证时）-> 降级 Edge -> 写缓存（仅火山成功）
 */
// 根据当前语音配置选择 TTS 引擎，并统一返回语音生成结果。
export async function generateVoice(text: string): Promise<TTSResult> {
  const appId = store.get('volcAppId') as string
  // 👇 2. 修改这里：使用解密方法读取
  const token = getSecureStore('volcAccessToken')
  const voiceType =
    (store.get('volcVoiceType') as string) || 'zh_female_vv_uranus_bigtts'

  // 音色参与 key，避免换音色后串音
  const cacheKey = `${voiceType}|${text}`

  // 1. 查缓存
  const cached = getCachedAudio(cacheKey)
  if (cached) {
    console.log('【TTS】缓存命中')
    return { success: true, audioBase64: cached }
  }

  // 2. 并发去重
  if (pending.has(cacheKey)) {
    return pending.get(cacheKey)!
  }

  const task = (async (): Promise<TTSResult> => {
    // 3. 火山（有凭证才尝试）
    if (appId && token) {
      const base64 = await synthesizeWithVolcano(text, { appId, token, voiceType })
      if (base64) {
        setCachedAudio(cacheKey, base64)
        return { success: true, audioBase64: base64 }
      }
      console.warn('【TTS】火山失败，降级 Edge')
    } else {
      console.warn('【TTS】未配置火山凭证，使用 Edge')
    }

    // 4. Edge 兜底（不写缓存，避免火山恢复后仍播 Edge）
    const edgeBase64 = await synthesizeWithEdge(text)
    if (edgeBase64) {
      return { success: true, audioBase64: edgeBase64 }
    }

    return { success: false }
  })().finally(() => {
    pending.delete(cacheKey)
  })

  pending.set(cacheKey, task)
  return task
}
