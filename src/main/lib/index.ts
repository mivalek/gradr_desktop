import { NEW_GLOBAL_CONFIG, NEW_PROJECT_CONFIG, PROJECT_CONFIG_FILE } from '@shared/constants'
import {
  TGetAllRubrics,
  TLoadRubric,
  TOpenFile,
  TOpenFolder,
  TRubricStore,
  TSaveFile,
  TSaveProjectConfig,
  TSaveRubric
} from '@shared/types'
import { rubricStyle } from '@shared/lib'
import { app, dialog, shell } from 'electron'
import {
  WatchListener,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync
} from 'fs'
import { JSDOM } from 'jsdom'
import { join } from 'path'
import { hideSync, revealSync } from 'hidefile'

import katexCssPath from '../resources/katexcss?asset'
import gradrCssPath from '../resources/gradrcss?asset'
import gradrJsPath from '../resources/gradr.js?asset'

export function getGlobalConfig() {
  const configFilePath = join(app.getPath('userData'), 'config')
  let out
  if (existsSync(configFilePath)) {
    out = JSON.parse(readFileSync(configFilePath, 'utf-8'))
  } else {
    out = NEW_GLOBAL_CONFIG
    writeFileSync(configFilePath, JSON.stringify(out), 'utf8')
  }
  return out
}
function pickFile(file: string) {
  const orig = join(global.currentPath, file)
  const marked = join(global.currentPath, 'marked', file)
  return existsSync(marked) ? marked : orig
}
export const openFolder: TOpenFolder = async () => {
  const response = await dialog.showOpenDialog(global.mainWin, { properties: ['openDirectory'] })
  let outFiles: string[] = []
  let path: string | undefined
  if (response.canceled) {
    console.log('no file selected')
  } else {
    path = response.filePaths[0]
    outFiles = getFilesFromFolder(path)
  }
  return { dir: path, files: outFiles, config: global.projectConfig }
}
export const getFilesFromFolder = (path: string) => {
  global.currentPath = path
  global.globalConfig.openedProject = path
  loadProjectConfig()
  return readdirSync(path).filter((f) => f.endsWith('html'))
}

export const watchFolderContentChange: WatchListener<string> = (eventType, fileName) => {
  if (!['change', 'rename'].includes(eventType)) return
  if (!fileName?.endsWith('.html')) return
  const newFiles = readdirSync(global.currentPath).filter((f) => f.endsWith('html'))
  global.mainWin.webContents.send('folder-changed', newFiles)
}
export const openFile: TOpenFile = async (file) => {
  if (!file.length) return { content: '', gradrData: '' }
  try {
    const fileString = readFileSync(pickFile(file), 'utf8')
    global.currentFile = { name: file, content: fileString }
    global.projectConfig.openedFile = file
    const dom = new JSDOM(fileString, { virtualConsole: global.virtualConsole })
    const document = dom.window.document
    document
      .querySelectorAll(
        'main.content script, .main-container script, .gradr-data script, .gradr-container, #no-mobile'
      )
      .forEach((e) => e.remove())
    const content = document.querySelector('main.content, .main-container')
    const gradrData = document.querySelector('.gradr-data')?.innerHTML || ''
    if (!content) return { content: 'Unknown format', gradrData: gradrData }
    return { content: content.outerHTML, gradrData: gradrData }
  } catch (error) {
    return { content: 'Error reading file', gradrData: '' }
  }
}

export const saveFile: TSaveFile = async (...args) => {
  const [newContent, gradrData, renderedComments, renderedGrades] = args
  try {
    const newPath = join(global.currentPath, 'marked')
    const dom = new JSDOM(global.currentFile.content, { virtualConsole: global.virtualConsole })
    const document = dom.window.document
    document.querySelectorAll('.gradr-data, #gradr-comments').forEach((e) => e.remove())
    const fileContent = document.querySelector('main.content, .main-container')!
    fileContent.innerHTML = newContent
    // replace rendered maths with markdown
    fileContent
      .querySelectorAll('.math.display')
      .forEach(
        (e) =>
          (e.innerHTML = '\\[' + e.querySelector('.katex-mathml annotation')?.innerHTML + '\\]')
      )
    fileContent.insertAdjacentHTML('beforeend', renderedGrades)
    const tooltipContainer = document.createElement('DIV')
    tooltipContainer.classList.add('gradr-tooltip-container')
    global.projectConfig.rubric.criteria.forEach((crit) => {
      const tooltip = document.createElement('DIV')
      tooltip.classList.add('gradr-crit-tooltip')
      tooltip.dataset.criterion = crit.label
      tooltip.innerHTML = crit.description
      tooltipContainer.append(tooltip)
    })
    document.body.insertAdjacentHTML(
      'beforeend',
      `${renderedComments}<div class="gradr-data">${gradrData}</div><div id="no-mobile">Please view this document on a larger screen<br>(tablet, laptop, desktop)</div>`
    )
    document.body.insertAdjacentElement('beforeend', tooltipContainer)
    if (!existsSync(join(newPath, global.currentFile.name))) {
      const katexCSS = readFileSync(katexCssPath, 'utf8')
      document.head.insertAdjacentHTML('beforeend', `<style>${katexCSS}</style>`)
      const styleSheet = readFileSync(gradrCssPath, 'utf8')
      const colourStyles = rubricStyle(global.projectConfig.rubric)
      const script = readFileSync(gradrJsPath, 'utf8')
      document.body.insertAdjacentHTML('beforeend', `<script>${script}</script>`)
      const lastStyleTag = [...document.querySelectorAll('style')].at(-1)!
      lastStyleTag.insertAdjacentHTML('afterend', `<style>${colourStyles}${styleSheet}</style>`)
    }
    const outString = dom.serialize()
    if (!existsSync(newPath)) {
      mkdirSync(newPath)
    }
    console.log('writing to', join(newPath, global.currentFile.name))
    writeFileSync(join(newPath, global.currentFile.name), outString, { encoding: 'utf8' })
    return 'ok'
  } catch (error) {
    console.log(error)
    return 'Error saving file'
  }
}

export const saveRubric: TSaveRubric = (...args) => {
  const [rubric] = args
  try {
    const rubricDir = join(app.getPath('userData'), 'rubrics')
    if (!existsSync(rubricDir)) mkdirSync(rubricDir, { recursive: true })
    const fileName = join(rubricDir, rubric.name.toLowerCase().replaceAll(/\W+/g, '_'))
    writeFileSync(fileName, JSON.stringify(rubric), { encoding: 'utf8' })
    console.log('Rubric written to ', fileName)
    global.projectConfig.rubric = rubric
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export const getAllRubrics: TGetAllRubrics = async () => {
  const rubricDir = join(app.getPath('userData'), 'rubrics')
  try {
    const rubrics = readdirSync(rubricDir)
    const out: {
      fileName: string
      displayName: string
    }[] = []
    rubrics.forEach((r) => {
      const rubricData = JSON.parse(readFileSync(join(rubricDir, r), 'utf8'))
      out.push({ fileName: r, displayName: rubricData.name })
    })
    return out
  } catch (error) {
    console.log(error)
    return []
  }
}
export const loadRubric: TLoadRubric = async (...args) => {
  const [rubric] = args
  const rubricFileName = join(app.getPath('userData'), 'rubrics', rubric)
  try {
    const rubricString = readFileSync(rubricFileName, 'utf8')
    const rubricData = JSON.parse(rubricString) as TRubricStore
    global.projectConfig.rubric = rubricData
    return rubricData
  } catch (error) {
    return { name: '', criteria: [] }
  }
}
const loadProjectConfig = () => {
  global.projectConfigPath = join(global.currentPath, '.' + PROJECT_CONFIG_FILE)
  global.projectConfig = { ...NEW_PROJECT_CONFIG }
  if (existsSync(global.projectConfigPath)) {
    global.projectConfigPath = revealSync(global.projectConfigPath)
    const configFile = readFileSync(global.projectConfigPath, 'utf8')
    global.projectConfig = JSON.parse(configFile)
    global.projectConfigPath = hideSync(global.projectConfigPath)
  } else {
    const path = join(global.currentPath, PROJECT_CONFIG_FILE)
    writeFileSync(path, JSON.stringify(global.projectConfig), {
      encoding: 'utf8'
    })
    hideSync(path)
  }
}

export const writeToProjectConfigFile = (config: string) => {
  try {
    global.projectConfigPath = revealSync(global.projectConfigPath)
    writeFileSync(global.projectConfigPath, config, { encoding: 'utf8' })
    global.projectConfigPath = hideSync(global.projectConfigPath)
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
export const saveProjectConfig: TSaveProjectConfig = (...args) => {
  const [config] = args
  global.projectConfig = config
  global.projectConfig.openedFile = global.currentFile?.name || ''
  const configString = JSON.stringify(config)
  return writeToProjectConfigFile(configString)
}

export const closeProject = () => {
  global.globalConfig.openedProject = ''
  delete global.currentFile
  delete global.currentPath
  if (global.projectConfig.rubric.name === '') {
    unlinkSync(global.projectConfigPath)
  }
}

export const saveGlobalConfig = () => {
  const configFilePath = join(app.getPath('userData'), 'config')
  try {
    writeFileSync(configFilePath, JSON.stringify(global.globalConfig), 'utf8')
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export const exportGrades = () => {
  try {
    let outCSV = 'sep=,\nid,'
    const criteria = global.projectConfig.rubric.criteria
    outCSV +=
      criteria
        .map((c) => c.name)
        .join(',')
        .replaceAll(' ', '_')
        .toLowerCase() + ',final_grade\n'
    const emptyRow =
      Array(criteria.length + 1)
        .fill(',')
        .join('') + ',\n'
    const files = readdirSync(global.currentPath).filter((f) => f.endsWith('html'))
    files.forEach((f) => {
      const id = f.replace(/\.html$/, '')
      const filePath = join(global.currentPath, 'marked', f)
      if (!global.projectConfig.graded.includes(f)) {
        outCSV += id + emptyRow
        return
      }
      const fileString = readFileSync(filePath, 'utf8')
      const dom = new JSDOM(fileString, { virtualConsole: global.virtualConsole })
      const document = dom.window.document
      const data = JSON.parse(document.querySelector('.gradr-data')!.innerHTML)
      const rubricGrades = criteria.map((c) => data.marks[c.name])
      const total = document.querySelector('#gradr-overall-grade')!.innerHTML
      outCSV += `${id},${rubricGrades.join(',')},${total}\n`
    })
    const outPath = join(global.currentPath, 'all_grades.csv')
    writeFileSync(outPath, outCSV, 'utf8')
    shell.showItemInFolder(outPath)
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
