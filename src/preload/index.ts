import { contextBridge, ipcRenderer } from 'electron'
import {
  TGetAllRubrics,
  TLoadRubric,
  TOpenFile,
  TOpenWindow,
  TRubricStore,
  TSaveFile,
  TSaveProjectConfig,
  TSaveRubric
} from '@shared/types'
// import renderMathInElement from 'katex/dist/contrib/auto-render'

// Custom APIs for renderer
const api = {
  openFolder: async (): Promise<{ dir: string | undefined; files: string[]; config: any }> =>
    ipcRenderer.invoke('open-folder'),
  openFile: async (...args: Parameters<TOpenFile>): Promise<string> =>
    ipcRenderer.invoke('open-file', ...args),
  saveFile: async (...args: Parameters<TSaveFile>): Promise<string> =>
    ipcRenderer.invoke('save-file', ...args),
  openWindow: (...args: Parameters<TOpenWindow>): void => ipcRenderer.send('open-window', ...args),
  saveRubric: (...args: Parameters<TSaveRubric>): Promise<boolean> =>
    ipcRenderer.invoke('save-rubric', ...args),
  loadRubric: (...args: Parameters<TLoadRubric>): Promise<TRubricStore> =>
    ipcRenderer.invoke('load-rubric', ...args),
  requestRubricList: (...args: Parameters<TGetAllRubrics>): Promise<string[]> =>
    ipcRenderer.invoke('request-rubric-list', ...args),
  onReceiveConfig: (callback) => ipcRenderer.on('update-config', (_, value) => callback(value)),
  onRestoreProject: (callback) => ipcRenderer.on('restore-project', (_, value) => callback(value)),
  onFolderContentChanged: (callback: any) =>
    ipcRenderer.on('folder-changed', (_, value) => callback(value)),
  saveProjectConfig: async (...args: Parameters<TSaveProjectConfig>): Promise<boolean> =>
    ipcRenderer.invoke('save-config', ...args),
  closeProject: () => ipcRenderer.send('close-project'),
  exportGrades: async (): Promise<boolean> => ipcRenderer.invoke('export-grades')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    // contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    // contextBridge.exposeInMainWorld('katex', { renderMathInElement })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  // window.electron = electronAPI
  // @ts-ignore (define in dts)
  // window.api = api
}
