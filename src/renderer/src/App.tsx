import { Show, createSignal, type Component } from 'solid-js'
import { Button, FileExplorer, Reader } from '@/components'
import { CommentsPanel } from './components/CommentsPanel'
import { TComment } from '@shared/types'
import { createStore } from 'solid-js/store'

const [currentDir, setCurrentDir] = createSignal<string>()
const [currentFiles, setCurrentFiles] = createSignal<string[]>([])
const [selectedFile, setSelectedFile] = createSignal<string>()
const [currentId, setCurrentId] = createSignal<string>()

const handleSelectFolder = async (): Promise<void> => {
  const { dir, files } = await window.api.openFolder()
  if (!dir) {
    console.log('selection cancelled')
    return
  }
  // setCommentStore('comments', [])
  console.log(files)
  setCurrentDir(dir)
  setCurrentFiles(files)
  setSelectedFile()
  setCurrentId()
}

const handleSave = async (): Promise<void> => {
  const content = document.querySelector('main.content, .main-container')!.innerHTML
  const metadata = document.querySelector('.gradr-comments-export')!.outerHTML
  const resp = await window.api.saveFile(content, metadata)
  console.log(resp)
}

const [commentStore, setCommentStore] = createStore<{
  commentCount: number
  comments: TComment[]
}>({
  commentCount: 0,
  comments: []
})

const App: Component = () => {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  return (
    <>
      <div id="titleBarContainer" class="absolute top-0 w-full">
        <div id="titleBar" class="draggable h-[30px] bg-slate-950">
          {/* <span class="draggable">Example PWA</span> */}
          {/* <input class="nonDraggable" type="text" placeholder="Search"></input> */}
        </div>
      </div>
      <div
        id="app-container"
        class="grid h-[calc(100vh_-_30px)] mt-[30px] relative overflow-clip"
        style={{
          'grid-template-columns': '200px minmax(400px, 1fr)'
        }}
      >
        <FileExplorer dir={currentDir()} files={currentFiles()} selectFile={setSelectedFile} />
        <div class="h-full grid min-h-0" style={{ 'grid-template-rows': '40px 1fr 40px' }}>
          <Show when={selectedFile()}>
            <div class="bg-background p-2 shadow-sm shadow-black text-center font-semibold">
              {selectedFile()?.replace(/\.html$/, '')}
            </div>
            <div
              id="main-panel"
              class="relative bg-slate-700 overflow-auto text-black grid"
              style={{
                'grid-template-columns': 'minmax(250px, 3fr) minmax(150px, 1fr)'
              }}
            >
              <Reader
                fileName={selectedFile}
                path={currentDir}
                setCurrentId={setCurrentId}
                setCommentStore={setCommentStore}
              />
              <CommentsPanel
                id={currentId()}
                setId={setCurrentId}
                commentStore={commentStore}
                setCommentStore={setCommentStore}
              />
            </div>
          </Show>
          <div class="flex justify-between">
            <Button onClick={handleSelectFolder}>Select folder</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
