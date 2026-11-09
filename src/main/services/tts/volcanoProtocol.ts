/**
 * 火山引擎 v3 双向流式 TTS 协议封包/解析
 *
 * 本文件为纯函数模块，不依赖 electron / ws / store，方便单测与复用。
 *
 * header（4 字节）：
 *   byte0 = 0x11  -> 协议版本 v1(高4位) + Header Size=1*4=4字节(低4位)
 *   byte1 = 0x14  -> Full Client Request(高4位=0x1) + flags=0x4 表示携带 event 号(低4位)
 *   byte2 = 0x10  -> 序列化 JSON(高4位=0x1) + 压缩 none(低4位=0x0)
 *   byte3 = 0x00  -> 保留
 *
 * 包结构：
 *   StartConnection(1) / FinishConnection(2)：
 *     [header 4B][event 4B][payload_size 4B][payload]
 *   StartSession(100) / TaskRequest(200) / FinishSession(102)：
 *     [header 4B][event 4B][session_id_len 4B][session_id][payload_size 4B][payload]
 *   AudioOnlyServer(0xB) 响应：
 *     [header 4B][event 4B][session_id_len 4B][session_id][payload_size 4B][payload]
 *   Error(0xF) 响应：
 *     [header 4B][event 4B][payload_size 4B][payload]
 */

const HEADER = Buffer.from([0x11, 0x14, 0x10, 0x00])

/** 协议事件类型 */
export const EventType = {
  StartConnection: 1,
  FinishConnection: 2,
  ConnectionStarted: 50,
  ConnectionFinished: 51,
  StartSession: 100,
  FinishSession: 102,
  SessionStarted: 150,
  SessionFinished: 152,
  TaskRequest: 200
} as const

/** 消息类型（header byte1 高 4 位） */
export const MsgType = {
  FullClientRequest: 0x1,
  FullServerResponse: 0x9,
  AudioOnlyServer: 0xb,
  Error: 0xf
} as const

/** 在 body 前追加 4 字节大端 size */
// 为协议 body 添加大端字节长度前缀。
function withSize(body: Buffer): Buffer {
  const sizeBuf = Buffer.alloc(4)
  sizeBuf.writeUInt32BE(body.length, 0)
  return Buffer.concat([sizeBuf, body])
}

/** 在 body 前追加 4 字节大端 event 号 */
// 为协议 body 添加大端事件编号前缀。
function withEvent(event: number, body: Buffer): Buffer {
  const eventBuf = Buffer.alloc(4)
  eventBuf.writeUInt32BE(event, 0)
  return Buffer.concat([eventBuf, body])
}

/**
 * 构造连接级包（StartConnection / FinishConnection），无 session_id
 */
/** 构造不带 sessionId 的连接级请求数据包。 */
export function buildConnectionPacket(event: number): Buffer {
  const body = Buffer.from(JSON.stringify({}))
  return Buffer.concat([HEADER, withEvent(event, withSize(body))])
}

/**
 * 构造会话级包（StartSession / TaskRequest / FinishSession），带 session_id
 * 注意：body 里也要带 "event" 字段（与服务端约定一致）
 */
/** 构造带 sessionId 和 JSON 负载的会话级请求数据包。 */
export function buildSessionPacket(event: number, sessionId: string, payload: object): Buffer {
  const sidBytes = Buffer.from(sessionId, 'utf-8')
  const sidLenBuf = Buffer.alloc(4)
  sidLenBuf.writeUInt32BE(sidBytes.length, 0)

  const body = Buffer.from(JSON.stringify(payload))
  const sessionPart = Buffer.concat([sidLenBuf, sidBytes, withSize(body)])
  return Buffer.concat([HEADER, withEvent(event, sessionPart)])
}

export interface ParsedMessage {
  /** 消息类型（header byte1 高 4 位） */
  msgType: number
  /** 事件号 */
  event: number
  /** 载荷（音频包为音频字节，错误包为错误 JSON 文本，其他为对应 JSON） */
  payload: Buffer
}

/**
 * 解析服务端响应包。自动区分错误包 / 音频包 / JSON 包。
 * 解析失败会抛出异常，调用方需 try/catch。
 */
/** 解析火山引擎响应数据包并提取消息类型、事件号和负载。 */
export function parseMessage(data: Buffer): ParsedMessage {
  const msgType = data[1] >> 4
  const event = data.readUInt32BE(4)

  // 错误包：[header][event][size][payload]
  if (msgType === MsgType.Error) {
    const payloadLen = data.readUInt32BE(8)
    return { msgType, event, payload: data.subarray(12, 12 + payloadLen) }
  }

  // 音频包：[header][event][sidLen][sid][size][payload]
  if (msgType === MsgType.AudioOnlyServer) {
    let offset = 8
    const sidLen = data.readUInt32BE(offset)
    offset += 4 + sidLen
    const payloadLen = data.readUInt32BE(offset)
    offset += 4
    return { msgType, event, payload: data.subarray(offset, offset + payloadLen) }
  }

  // 其他 JSON 包（50/51/150/152 等）：本业务不需要其 body 内容
  return { msgType, event, payload: Buffer.alloc(0) }
}
