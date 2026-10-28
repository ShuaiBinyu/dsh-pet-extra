
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      petDrag: (deltaX: number, deltaY: number) => void
      petSetPadding: (padding: {
      left: number
      top: number
      right: number
      bottom: number
    }) => void
    }
  }
}
