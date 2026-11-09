<script setup lang="ts">
import type { CSSProperties } from 'vue'

defineProps<{
  style: CSSProperties
}>()

defineEmits<{
  mousedown: [event: MouseEvent]
  click: [event: MouseEvent]
  dblclick: [event: MouseEvent]
  contextmenu: [event: MouseEvent]
}>()
</script>

<template>
  <div
    class="pet-hit-area"
    :style="style"
    @mousedown="$emit('mousedown', $event)"
    @click="$emit('click', $event)"
    @dblclick="$emit('dblclick', $event)"
    @contextmenu="$emit('contextmenu', $event)"
  />
</template>

<style scoped>
.pet-hit-area {
  position: absolute;
  pointer-events: auto;
}
</style>
