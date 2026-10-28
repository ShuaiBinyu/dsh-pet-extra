<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import type { PetAnimationConfig } from '../types/pet'

defineProps<{
  animation: PetAnimationConfig
}>()

const emit = defineEmits<{
  ended: [],
  duration: [seconds: number]
}>()

// 控制动画时长
const videoRef = ref<HTMLVideoElement>()

function onLoadedMetadata() {
  const d = videoRef.value?.duration ?? 0
  emit('duration', d > 0 && isFinite(d) ? d : 1)
  // 元数据就绪后量一次留白（此时 videoWidth/videoHeight 可用）
  reportPadding()
}

/**
 * 计算 object-fit: contain 后，人物画面在窗口内的四边留白，
 * 并上报给主进程，供 pet-drag 按人物区域钳制窗口位置。
 */
function reportPadding() {
  const v = videoRef.value
  if (!v) return
  if (!v.videoWidth || !v.videoHeight) return

  const elW = v.clientWidth
  const elH = v.clientHeight
  if (!elW || !elH) return

  const vRatio = v.videoWidth / v.videoHeight
  const elRatio = elW / elH

  let drawW: number
  let drawH: number
  let offsetX: number
  let offsetY: number

  if (vRatio > elRatio) {
    // 视频更宽：左右贴边，上下留黑边
    drawW = elW
    drawH = elW / vRatio
    offsetX = 0
    offsetY = (elH - drawH) / 2
  } else {
    // 视频更高：上下贴边，左右留黑边
    drawH = elH
    drawW = elH * vRatio
    offsetX = (elW - drawW) / 2
    offsetY = 0
  }

  const vRect = v.getBoundingClientRect()

  // 人物画面相对窗口的四边留白
  window.api.petSetPadding({
    left: vRect.left + offsetX,
    top: vRect.top + offsetY,
    right: window.innerWidth - (vRect.left + offsetX + drawW),
    bottom: window.innerHeight - (vRect.top + offsetY + drawH),
  })
}

onMounted(() => {
  // 等布局稳定后上报一次（防止首帧尺寸未定）
  setTimeout(reportPadding, 200)
  window.addEventListener('resize', reportPadding)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', reportPadding)
})
</script>

<template>
  <video
    ref="videoRef"
    :key="animation.id"
    :src="animation.src"
    autoplay
    muted
    playsinline
    @loadedmetadata="onLoadedMetadata"
    @ended="emit('ended')"
  />
</template>

<style scoped>
video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
</style>