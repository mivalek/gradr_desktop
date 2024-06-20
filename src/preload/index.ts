import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { TOpenFile, TSaveFile } from '@shared/types'

// Custom APIs for renderer
const api = {
  openFolder: async (): Promise<{ dir: string | undefined; files: string[] }> =>
    electronAPI.ipcRenderer.invoke('open-folder'),
  openFile: async (...args: Parameters<TOpenFile>): Promise<string> =>
    electronAPI.ipcRenderer.invoke('open-file', ...args),
  saveFile: async (...args: Parameters<TSaveFile>): Promise<string> =>
    electronAPI.ipcRenderer.invoke('save-file', ...args)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    // contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  // window.electron = electronAPI
  // @ts-ignore (define in dts)
  // window.api = api
}
