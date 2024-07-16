import {
  TComment,
  TCommentStore,
  TConfig,
  TFileStatus,
  TGradeStore,
  TGrades,
  TGradrData,
  TResource
} from '@shared/types'
import {
  Accessor,
  Resource,
  Setter,
  createContext,
  createEffect,
  createResource,
  createSignal
} from 'solid-js'
import { Part, SetStoreFunction, createStore, unwrap } from 'solid-js/store'

type TContext = {
  currentId: Accessor<string | undefined>
  setCurrentId: Setter<string | undefined>
  currentDir: Accessor<string | undefined>
  setCurrentDir: Setter<string | undefined>
  currentFiles: Accessor<string[]>
  setCurrentFiles: Setter<string[]>
  selectedFile: Accessor<string | undefined>
  setSelectedFile: Setter<string | undefined>
  setupProject: (dir: string, files: string[], config: any) => void
  isFileLoaded: Accessor<boolean>
  setIsFileLoaded: Setter<boolean>
  configStore: TConfig
  setConfigStore: SetStoreFunction<TConfig>
  fileStatusStore: TFileStatus
  setFileStatusStore: SetStoreFunction<TFileStatus>
  markFileAsDone: (what: Part<TFileStatus>, hasComments: boolean) => void
  resource: Resource<TResource>
  commentStore: TCommentStore
  setCommentStore: SetStoreFunction<TCommentStore>
  gradeStore: TGradeStore
  setGradeStore: SetStoreFunction<TGradeStore>
  grades: () => TGrades
  handleSave: () => Promise<void>
  closeProject: () => void
  isRubric: () => boolean
}
export const Context = createContext<TContext>()

export const ContextProvider = (props) => {
  const [currentId, setCurrentId] = createSignal<string>()
  const [currentDir, setCurrentDir] = createSignal<string>()
  const [currentFiles, setCurrentFiles] = createSignal<string[]>([])
  const [selectedFile, setSelectedFile] = createSignal<string>()
  const [configStore, setConfigStore] = createStore<TConfig>({
    rubric: { name: '', criteria: [] }
  })

  const setupProject = (
    dir: string,
    files: string[],
    config: TConfig & TFileStatus & { openedFile: string }
  ) => {
    setCurrentDir(dir)
    setCurrentFiles(files)
    setConfigStore('rubric', config.rubric || { name: '', criteria: [] })
    setSelectedFile(config.openedFile ? config.openedFile : undefined)
    const fileStatus = { commented: config.commented || [], graded: config.graded || [] }
    setFileStatusStore(fileStatus)
    setCurrentId()
  }
  const closeProject = () => {
    const saved = window.api.saveProjectConfig({
      ...unwrap(configStore),
      ...unwrap(fileStatusStore)
    })
    if (!saved) {
      console.log('error saving project config')
      return
    }
    window.api.closeProject()
    setCurrentDir()
    setCurrentFiles([])
    setConfigStore({
      rubric: { name: '', criteria: [] }
    })
    setSelectedFile()
    setCurrentId()
    setIsFileLoaded(false)
    setFileStatusStore({
      commented: [],
      graded: []
    })
    setCommentStore({
      hasComments: false,
      commentCount: 0,
      comments: []
    })
    setGradeStore({
      isGraded: false,
      grades: {},
      generalComments: ''
    })
  }
  const [isFileLoaded, setIsFileLoaded] = createSignal(false)
  createEffect(() => {
    selectedFile()
    setIsFileLoaded(false)
  })
  const [fileStatusStore, setFileStatusStore] = createStore<TFileStatus>({
    commented: [],
    graded: []
  })

  const [commentStore, setCommentStore] = createStore<TCommentStore>({
    hasComments: false,
    commentCount: 0,
    comments: []
  })

  const [gradeStore, setGradeStore] = createStore<TGradeStore>({
    isGraded: false,
    grades: {},
    generalComments: ''
  })

  const [loadedData, setLoadedData] = createSignal<{
    comments: TComment[]
    marks:
      | {}
      | {
          [key: string]: number
        }
    generalComments: string
  }>({ comments: [], marks: {}, generalComments: '' })
  const grades = () => gradeStore.grades

  const isRubric = () => Object.values(configStore.rubric.criteria).length !== 0
  const [resource] = createResource(selectedFile, async (file) => {
    const { content, gradrData } = await window.api.openFile(file)
    const parsedGradrData: TGradrData = gradrData.length
      ? JSON.parse(gradrData)
      : { comments: [], marks: {}, generalComments: '' }
    const { comments, marks, generalComments } = parsedGradrData
    setIsFileLoaded(true)
    setLoadedData({
      comments: [...comments],
      marks: { ...marks },
      generalComments: generalComments
    })
    return { content, comments, marks, generalComments }
  })

  window.api.onReceiveConfig((data) => {
    setConfigStore('rubric', data.rubric)
    setFileStatusStore({ commented: data.commented, graded: data.graded })
  })

  window.api.onFolderContentChanged((files) => {
    setCurrentFiles(files)
  })

  const markFileAsDone = (what: Part<TFileStatus>, done: boolean) => {
    const file = selectedFile()!
    if (done) {
      setFileStatusStore(what, (com) => [...com.filter((c) => c !== file), file])
    } else {
      setFileStatusStore(what, (com) => com.filter((c) => c !== file))
    }
  }

  const compareGrades = () => {
    const { marks } = loadedData()
    const origCrit = Object.keys(marks)
    const currentCrit = Object.keys(gradeStore.grades)
    if (origCrit.length !== currentCrit.length) return true
    return (
      origCrit.some((crit) => !currentCrit.includes(crit)) ||
      origCrit.some((crit) => marks[crit] !== gradeStore.grades[crit])
    )
  }
  const compareComments = () => {
    const { comments } = loadedData()
    if (comments.length !== commentStore.comments.length) return true
    if (comments.length === 0) return false
    for (let i = 0; i < comments.length; i++) {
      const orig = comments[i]
      const current = commentStore.comments[i]
      if (orig.type !== current.type || orig.content !== current.content) return true
    }
    return false
  }
  const hasDocChanged = () => {
    const { generalComments } = loadedData()
    const haveGradesChanged = compareGrades()
    const haveGeneralCommentsChanged = generalComments !== gradeStore.generalComments
    const haveCommentsChanged = compareComments()
    return haveGradesChanged || haveGeneralCommentsChanged || haveCommentsChanged
  }
  const handleSave = async (): Promise<void> => {
    if (!selectedFile()) {
      console.log('Nothing to save')
      return
    }
    if (!hasDocChanged()) {
      console.log('No changes made')
      return
    }
    const content = document.querySelector('main.content, .main-container')!.innerHTML
    const renderedComments = document.querySelector('#gradr-comments-export')?.innerHTML || ''
    const renderedGrades = document.querySelector('#gradr-grades-export')?.innerHTML || ''
    const metadata: TGradrData = {
      comments: commentStore.comments,
      generalComments: gradeStore.generalComments,
      marks: gradeStore.grades
    }
    window.api.saveProjectConfig({ ...unwrap(configStore), ...unwrap(fileStatusStore) })
    const resp = await window.api.saveFile(
      content,
      JSON.stringify(metadata),
      renderedComments,
      renderedGrades
    )
    if (resp === 'ok')
      setLoadedData({
        marks: { ...metadata.marks },
        comments: [...metadata.comments],
        generalComments: metadata.generalComments
      })
  }

  return (
    <Context.Provider
      value={{
        currentId,
        setCurrentId,
        currentDir,
        setCurrentDir,
        currentFiles,
        setCurrentFiles,
        selectedFile,
        setSelectedFile,
        configStore,
        setConfigStore,
        fileStatusStore,
        setFileStatusStore,
        markFileAsDone,
        isFileLoaded,
        setIsFileLoaded,
        resource,
        gradeStore,
        setGradeStore,
        commentStore,
        setCommentStore,
        handleSave,
        grades,
        setupProject,
        closeProject,
        isRubric
      }}
    >
      {props.children}
    </Context.Provider>
  )
}
