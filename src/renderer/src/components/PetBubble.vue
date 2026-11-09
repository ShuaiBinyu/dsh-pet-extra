<script setup lang="ts">
import type { CSSProperties } from 'vue'

defineProps<{
  text: string
  className: string
  style: CSSProperties
}>()
</script>

<template>
  <div class="bubble" :class="className" :style="style">
    {{ text }}
  </div>
</template>

<style scoped>
.bubble {
  position: absolute;
  padding: 8px 13px;
  font-size: 17px;
  max-width: 180px;
  white-space: normal;
  word-break: break-word;
  pointer-events: none;
  z-index: 99;
  animation: fadeIn 0.3s ease;
}

.bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -8px;
  transform: translateX(-50%);
  border-width: 8px 8px 0;
  border-style: solid;
}

.bubble-normal { background: #ffffff; color: #333333; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); }
.bubble-normal::after { border-color: #fff transparent transparent; }
.bubble-yellow { background: #fff8d9; color: #5c4826; border-radius: 12px; box-shadow: 0 2px 8px rgba(180, 140, 60, 0.2); }
.bubble-yellow::after { border-color: #fff8d9 transparent transparent; }
.bubble-blue { background: #e8f4ff; color: #244e75; border-radius: 12px; box-shadow: 0 2px 8px rgba(60, 130, 200, 0.2); }
.bubble-blue::after { border-color: #e8f4ff transparent transparent; }
.bubble-cloud { background: #fefefe; color: #444444; border-radius: 20px; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12); border: 1px solid #eee; }
.bubble-cloud::after { border-color: #fefefe transparent transparent; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
