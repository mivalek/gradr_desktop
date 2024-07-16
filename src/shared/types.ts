export type TComment = { id: string; content: string; type: string }
export type TGradrData = {
  comments: TComment[]
  marks: {} | { [key: string]: number }
  generalComments: string
  // rubric: TRubricStore
}
export type TResource = {
  content: string
} & TGradrData
export type TMathsWindow = Window &
  typeof globalThis & { renderMathInElement: (HTMLDivElement, options?: any) => void }
export type TSaveFile = (
  contentInnerHTML: string,
  gradrData: string,
  renderedComments: string,
  renderedGrades: string
) => Promise<string>
export type TOpenFolder = () => Promise<{ dir: string | undefined; files: string[]; config: any }>
export type TOpenFile = (file: string) => Promise<{ content: string; gradrData: string }>
export type TSaveRubric = (rubric: TRubricStore) => boolean
export type TGetAllRubrics = () => Promise<{ fileName: string; displayName: string }[]>
export type TLoadRubric = (rubric: string) => Promise<TRubricStore>
export type TSaveProjectConfig = (config: TConfig & TFileStatus) => boolean
export type TOpenWindow = (path: string) => void
export type TRubricCriterion = {
  index?: number
  name: string
  label: string
  colour: string
  description: string
  weight: number
}
export type TGrades = { [key: string]: number | null }
export type TGradeStore = {
  isGraded: boolean
  grades: TGrades
  generalComments: string
}
export type TCommentStore = {
  hasComments: boolean
  commentCount: number
  comments: TComment[]
}
export type TRubricStore = {
  name: string
  criteria: TRubricCriterion[]
}
export type TConfig = { rubric: TRubricStore }
export type TFileStatus = { commented: string[]; graded: string[] }
export type TProjectConfig = TConfig & TFileStatus
