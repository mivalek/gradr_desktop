import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { VirtualConsole } from 'jsdom'
import {
  closeProject,
  exportGrades,
  getAllRubrics,
  getFilesFromFolder,
  getGlobalConfig,
  loadRubric,
  openFile,
  openFolder,
  saveFile,
  saveGlobalConfig,
  saveProjectConfig,
  saveRubric,
  watchFolderContentChange,
  writeToProjectConfigFile
} from './lib'
import {
  TLoadRubric,
  TOpenFile,
  TOpenWindow,
  TSaveFile,
  TSaveProjectConfig,
  TSaveRubric
} from '@shared/types'
import { existsSync, FSWatcher, unlinkSync, watch } from 'fs'
import { PROJECT_CONFIG_FILE } from '@shared/constants'

let folderWatcher: FSWatcher

function createWindow(
  modal: boolean,
  path: string,
  minWidth = 300,
  minHeight = 200,
  parent?: BrowserWindow
): BrowserWindow {
  // Create a window that fills the screen's available work area.
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  const winWidth = 900,
    winHeight = 670
  // Create the browser window.
  const win = new BrowserWindow({
    x: (width - winWidth) / 2,
    y: (height - winHeight) / 2,
    width: winWidth,
    height: winHeight,
    minWidth: minWidth,
    minHeight: minHeight,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    // center: true,
    title: 'gradR',
    frame: false,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    titleBarStyle: 'hidden',
    titleBarOverlay: modal
      ? false
      : {
          color: '#00000000',
          symbolColor: '#ffffff',
          height: 30
        },
    // trafficLightPosition: { x: 15, y: 10 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    },
    modal,
    parent,
    backgroundMaterial: 'acrylic'
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  // Electron needs hash routing -> # and {hash: ...}
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#' + path)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { hash: path })
  }
  return win
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.handle('open-folder', async () => {
    const { dir, files, config } = await openFolder()
    if (dir) {
      folderWatcher = watch(dir, watchFolderContentChange)
    }
    return { dir, files, config }
  })
  ipcMain.handle('open-file', (_, ...args: Parameters<TOpenFile>) => openFile(...args))
  ipcMain.handle('save-file', (_, ...args: Parameters<TSaveFile>) => saveFile(...args))
  ipcMain.handle('save-rubric', (_, ...args: Parameters<TSaveRubric>) => {
    saveRubric(...args)
    global.mainWin.webContents.send('update-config', global.projectConfig)
  })

  ipcMain.handle('save-config', (_, ...args: Parameters<TSaveProjectConfig>) =>
    saveProjectConfig(...args)
  )
  ipcMain.on('close-project', () => {
    closeProject()
    folderWatcher.close()
  })
  ipcMain.handle('request-rubric-list', getAllRubrics)
  ipcMain.handle('load-rubric', (_, ...args: Parameters<TLoadRubric>) => loadRubric(...args))
  ipcMain.handle('export-grades', exportGrades)

  ipcMain.on('open-window', (_, ...args: Parameters<TOpenWindow>) => {
    const newWindow = createWindow(true, ...args, 760, 470, global.mainWin)
    newWindow
  })

  global.mainWin = createWindow(false, 'home', 875, 670)

  global.globalConfig = getGlobalConfig()
  // disregard JSDOM css parsing error (valid modern css)
  // https://stackoverflow.com/questions/69906136/console-error-error-could-not-parse-css-stylesheet
  global.virtualConsole = new VirtualConsole()
  global.virtualConsole.on('error', () => {
    // No-op to skip console errors.
  })
  global.mainWin.on('ready-to-show', () => {
    const path = global.globalConfig.openedProject
    if (path === '' || !existsSync(join(path, PROJECT_CONFIG_FILE))) return
    const outFiles = getFilesFromFolder(path)
    folderWatcher = watch(path, watchFolderContentChange)
    global.mainWin.webContents.send('restore-project', {
      dir: path,
      files: outFiles,
      config: global.projectConfig
    })
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0)
      global.mainWin = createWindow(false, 'home', 875, 670)
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
app.on('before-quit', () => {
  saveGlobalConfig()
  if (!global.projectConfig) return
  if (global.projectConfig.rubric.name === '') {
    try {
      unlinkSync(global.projectConfigPath)
    } catch (error) {
      console.log(error)
    }
  } else writeToProjectConfigFile(JSON.stringify(global.projectConfig))
})
