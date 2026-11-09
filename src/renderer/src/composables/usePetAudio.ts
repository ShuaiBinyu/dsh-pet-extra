import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

interface PetAudioOptions {
  isUserIdle: Readonly<Ref<boolean>>
  showBubble: Ref<boolean>
  popBubble: (text: string) => void
  onNeedBubble: Ref<((text: string) => void) | null>
}

// 管理 TTS 请求、音频播放、用户活跃时的打断和音频解锁。
export function usePetAudio(options: PetAudioOptions): void {
  const { isUserIdle, showBubble, popBubble, onNeedBubble } = options
  let currentAudio: HTMLAudioElement | null = null

  // 请求语音、播放音频，并在成功或失败后显示对应气泡。
  async function sayAndBubble(text: string): Promise<void> {
    if (!text) return

    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }

    try {
      const res = await window.petApi.generateVoice(text)

      if (res.success && res.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${res.audioBase64}`)
        currentAudio = audio

        audio.play().catch((error) => {
          console.warn('播放被拦截（需要先点一下屏幕）:', error)
        })

        audio.onended = () => {
          if (currentAudio === audio) currentAudio = null
        }

        popBubble(text)
      } else {
        popBubble(text)
      }
    } catch (error) {
      console.error('语音请求失败', error)
      popBubble(text)
    }
  }

  // 停止并释放当前正在播放的音频。
  function stopAudio(): void {
    if (!currentAudio) return

    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }

  watch(isUserIdle, (idle) => {
    if (idle) return

    stopAudio()
    showBubble.value = false
  })

  onMounted(() => {
    onNeedBubble.value = sayAndBubble

    const unlockAudio = (): void => {
      const audio = new Audio()
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
      audio.play().catch(() => {})
      document.removeEventListener('click', unlockAudio)
    }

    document.addEventListener('click', unlockAudio)
  })

  onBeforeUnmount(() => {
    stopAudio()
    onNeedBubble.value = null
  })

}
