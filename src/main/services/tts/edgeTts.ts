import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

/**
 * 使用微软 Edge TTS（晓伊）合成语音，作为火山失败时的兜底。
 * @returns 成功返回 base64 音频字符串；失败返回 null。
 */
// 调用 Edge TTS 服务，将文本转换为音频并返回 base64 数据。
export async function synthesizeWithEdge(text: string): Promise<string | null> {
  try {
    const tts = new MsEdgeTTS()
    await tts.setMetadata(
      'zh-CN-XiaoyiNeural',
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
    )

    const { audioStream } = tts.toStream(text)
    const chunks: Buffer[] = []

    return await new Promise<string | null>((resolve) => {
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk))
      audioStream.on('end', () => {
        const buffer = Buffer.concat(chunks)
        console.log('【TTS】Edge TTS (晓伊) 生成成功！')
        resolve(buffer.length > 0 ? buffer.toString('base64') : null)
      })
      audioStream.on('error', (err: Error) => {
        console.error('【TTS】Edge TTS 流读取错误:', err)
        resolve(null)
      })
    })
  } catch (err) {
    console.error('【TTS】Edge TTS 生成异常:', err)
    return null
  }
}
