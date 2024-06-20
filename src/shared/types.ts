export type TComment = { id: string; content: string }
export type TMetadata = { comments: TComment[]; grade: {} | { [key: string]: number } }
export type TMathsWindow = Window &
  typeof globalThis & { renderMathInElement: (HTMLDivElement, options?: any) => void }
export type TSaveFile = (contentInnerHTML: string, metadataOuterHTML: string) => Promise<string>
export type TOpenFolder = () => Promise<{ dir: string | undefined; files: string[] }>
export type TOpenFile = (file: string) => Promise<{ content: string; metadata: string | undefined }>
export type TOpenWindow = (path: string) => void
