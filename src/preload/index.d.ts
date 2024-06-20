import { ElectronAPI } from '@electron-toolkit/preload'
import { TOpenFile, TOpenFolder, TOpenWindow, TSaveFile } from '@shared/types'

declare global {
  interface Window {
    // electron: ElectronAPI
    api: {
      openFolder: TOpenFolder
      openFile: TOpenFile
      saveFile: TSaveFile
      openWindow: TOpenWindow
    }
  }
}
