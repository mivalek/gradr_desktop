import { TOpenFile, TOpenFolder, TSaveFile } from '@shared/types'
import { dialog } from 'electron'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import { JSDOM } from 'jsdom'
import path, { join } from 'path'

const resourcesPath =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'production'
    ? process.resourcesPath // Live Mode
    : './src/assets/' // Dev Mode

function pickFile(file: string) {
  const orig = join(global.currentPath, file)
  const marked = join(global.currentPath, 'marked', file)
  return existsSync(marked) ? marked : orig
}
export const openFolder: TOpenFolder = async () => {
  const response = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  let outFiles: string[] = []
  let path: string | undefined
  if (response.canceled) {
    console.log('no file selected')
  } else {
    path = response.filePaths[0]
    outFiles = readdirSync(path).filter((f) => f.endsWith('html'))
    global.currentPath = path
    console.log(outFiles)
  }
  return { dir: path, files: outFiles }
}

export const openFile: TOpenFile = async (file) => {
  let metadata: string | undefined = undefined
  if (!file.length) return { content: '', metadata }
  try {
    const fileString = readFileSync(pickFile(file), 'utf8')
    global.currentFile = { name: file, content: fileString }
    const dom = new JSDOM(fileString)
    const document = dom.window.document
    document
      .querySelectorAll('main.content script, .main-container script, .gradr-metadata script')
      .forEach((e) => e.remove())
    const content = document.querySelector('main.content, .main-container')
    metadata = document.querySelector('.gradr-metadata')?.innerHTML
    if (!content) return { content: 'Unknown format', metadata }
    return { content: content.outerHTML, metadata }
  } catch (error) {
    return { content: 'Error reading file', metadata }
  }
}

export const saveFile: TSaveFile = async (...args) => {
  const [newContent, metadata] = args
  try {
    const dom = new JSDOM(global.currentFile.content)
    const document = dom.window.document
    document.querySelector('.gradr-comments-export')?.remove()
    const fileContent = document.querySelector('main.content, .main-container')!
    const styleSheet = readFileSync(path.join(resourcesPath, 'gradr.css'), 'utf8')
    const script = readFileSync(path.join(resourcesPath, 'gradr.js'), 'utf8')
    fileContent.innerHTML = newContent
    // replace rendered maths with markdown
    fileContent
      .querySelectorAll('.math.display')
      .forEach(
        (e) =>
          (e.innerHTML = '\\[' + e.querySelector('.katex-mathml annotation')?.innerHTML + '\\]')
      )
    fileContent.insertAdjacentHTML('afterend', metadata)
    document.body.insertAdjacentHTML('beforeend', `<script>${script}</script>`)
    const lastStyleTag = [...document.querySelectorAll('style')].at(-1)!
    lastStyleTag.insertAdjacentHTML('afterend', `<style>${styleSheet}</style>`)
    const outString = dom.serialize()
    const newPath = path.join(global.currentPath, 'marked')
    if (!existsSync(newPath)) mkdirSync(newPath)
    writeFileSync(path.join(newPath, global.currentFile.name), outString, { encoding: 'utf8' })

    return 'ok'
  } catch (error) {
    console.log(error)
    return 'Error saving file'
  }
}
