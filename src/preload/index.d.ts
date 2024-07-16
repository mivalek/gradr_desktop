import { ElectronAPI } from '@electron-toolkit/preload'
import {
  TGetAllRubrics,
  TLoadRubric,
  TOpenFile,
  TOpenFolder,
  TOpenWindow,
  TSaveFile,
  TSaveProjectConfig,
  TSaveRubric
} from '@shared/types'

declare global {
  interface Window {
    // electron: ElectronAPI
    api: {
      openFolder: TOpenFolder
      openFile: TOpenFile
      saveFile: TSaveFile
      openWindow: TOpenWindow
      saveRubric: TSaveRubric
      loadRubric: TLoadRubric
      requestRubricList: TGetAllRubrics
      saveProjectConfig: TSaveProjectConfig
      closeProject: () => void
      onReceiveConfig: (callback: any) => Electron.IpcRenderer
      onRestoreProject: (callback: any) => Electron.IpcRenderer
      onFolderContentChanged: (callback: any) => Electron.IpcRenderer
      exportGrades: () => Promise<boolean>
    }
    // katex: { renderMathInelement: (HTMLElement) => void }
  }
}
