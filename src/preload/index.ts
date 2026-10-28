
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  petDrag: (deltaX: number, deltaY: number): void => {
    ipcRenderer.send('pet-drag', deltaX, deltaY)
  },
  // 上报人物在窗口内的四边留白，供主进程按“人物区域”钳制窗口位置
  petSetPadding: (padding: {
    left: number
    top: number
    right: number
    bottom: number
  }): void => {
    ipcRenderer.send('pet-set-padding', padding)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
