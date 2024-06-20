import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { openFile, openFolder, saveFile } from './lib'
import { TOpenFile, TOpenWindow, TSaveFile } from '@shared/types'

function createWindow(modal: boolean, parent?: BrowserWindow, path?: string): BrowserWindow {
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
          color: '#020617',
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
    parent
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
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'] + (path ? '/' + path : ''))
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html' + (path ? '/' + path : '')))
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
  ipcMain.handle('open-folder', openFolder)
  ipcMain.handle('open-file', (_, ...args: Parameters<TOpenFile>) => openFile(...args))
  ipcMain.handle('save-file', (_, ...args: Parameters<TSaveFile>) => saveFile(...args))

  ipcMain.on('open-window', (_, ...args: Parameters<TOpenWindow>) => {
    const newWindow = createWindow(true, mainWin, ...args)
    newWindow
  })

  let mainWin = createWindow(false)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) mainWin = createWindow(false)
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
