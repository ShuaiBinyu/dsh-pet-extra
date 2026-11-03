import WebSocket from 'ws'
import {
  buildConnectionPacket,
  buildSessionPacket,
  parseMessage,
  EventType,
  MsgType
} from './volcanoProtocol'

export interface VolcanoOptions {
  appId: string
  token: string
  voiceType: string
}

const URL = 'wss://openspeech.bytedance.com/api/v3/tts/bidirection'
const TIMEOUT_MS = 8000

const uuid = (): string => Math.random().toString(36).substring(2, 15)

/**
 * 使用火山引擎 v3 双向流式接口合成语音。
 * @returns 成功返回 base64 音频字符串；失败（含超时/协议错误/无音频）返回 null。
 */
export function synthesizeWithVolcano(
  text: string,
  opts: VolcanoOptions
): Promise<string | null> {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL, {
      headers: {
        'X-Api-Key': opts.token,
        'X-Api-Resource-Id': 'seed-tts-2.0',
        'X-Api-Connect-Id': uuid(),
        'X-Control-Require-Usage-Tokens-Return': '*'
      }
    } as unknown as WebSocket)

    const audioChunks: Buffer[] = []
    const sessionId = uuid()
    let finished = false

    const timeoutId = setTimeout(() => {
      if (!finished) {
        console.warn('【TTS】火山接口超时')
        finished = true
        try { ws.close() } catch { /* ignore */ }
        resolve(null)
      }
    }, TIMEOUT_MS)

    const cleanup = (): void => {
      clearTimeout(timeoutId)
      try { ws.close() } catch { /* ignore */ }
    }

    const failOnce = (): void => {
      if (finished) return
      finished = true
      cleanup()
      resolve(null)
    }

    ws.on('open', () => {
      console.log('【TTS】WebSocket 已连接，发送 StartConnection...')
      ws.send(buildConnectionPacket(EventType.StartConnection))
    })

    ws.on('message', (data: Buffer) => {
      try {
        const { msgType, event, payload } = parseMessage(data)

        if (msgType === MsgType.Error) {
          console.error('【TTS】火山错误:', payload.toString('utf-8'))
          failOnce()
          return
        }

        if (event === EventType.ConnectionStarted) {
          ws.send(
            buildSessionPacket(EventType.StartSession, sessionId, {
              event: EventType.StartSession,
              req_params: {
                speaker: opts.voiceType,
                audio_params: { format: 'mp3', sample_rate: 24000 }
              }
            })
          )
          return
        }

        if (event === EventType.SessionStarted) {
          ws.send(
            buildSessionPacket(EventType.TaskRequest, sessionId, {
              event: EventType.TaskRequest,
              req_params: {
                text,
                speaker: opts.voiceType,
                audio_params: { format: 'mp3', sample_rate: 24000 }
              }
            })
          )
          ws.send(
            buildSessionPacket(EventType.FinishSession, sessionId, {
              event: EventType.FinishSession
            })
          )
          return
        }

        if (msgType === MsgType.AudioOnlyServer) {
          if (payload.length > 0) audioChunks.push(payload)
          return
        }

        if (event === EventType.SessionFinished) {
          if (finished) return
          finished = true
          clearTimeout(timeoutId)

          const buf = Buffer.concat(audioChunks)
          if (buf.length > 0) {
            console.log(`【TTS】火山生成成功，${buf.length} 字节`)
            resolve(buf.toString('base64'))
          } else {
            console.warn('【TTS】火山未返回有效音频')
            resolve(null)
          }

          // 优雅关闭连接
          try {
            ws.send(buildConnectionPacket(EventType.FinishConnection))
          } catch { /* ignore */ }
          return
        }

        if (event === EventType.ConnectionFinished) {
          try { ws.close() } catch { /* ignore */ }
          return
        }
      } catch (e) {
        console.error('【TTS】解析 WebSocket 数据失败', e)
      }
    })

    ws.on('error', (err) => {
      console.error('【TTS】WebSocket 报错:', err.message)
      failOnce()
    })

    ws.on('close', () => {
      clearTimeout(timeoutId)
      if (!finished) {
        finished = true
        resolve(null)
      }
    })
  })
}
