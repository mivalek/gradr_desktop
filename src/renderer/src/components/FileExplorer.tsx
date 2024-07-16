import { type Component, For, useContext, Show } from 'solid-js'
import {
  CloseProjectButton,
  CommentIcon,
  Context,
  ExportGradesButton,
  MarkedIcon,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components'

export const FileExplorer: Component = () => {
  const {
    currentDir,
    currentFiles,
    selectedFile,
    setSelectedFile,
    fileStatusStore,
    isRubric,
    handleSave
  } = useContext(Context)!

  return (
    <Show when={isRubric()}>
      <div
        id="file-explorer"
        class=" bg-background/60 w-full min-h-0 grid pb-2 gap-2 "
        style={{
          'grid-template-rows': 'auto 1fr'
        }}
      >
        <div class="text-center font-semibold px-1 py-0 relative flex items-center justify-center">
          <ExportGradesButton class="opacity-60 hover:bg-transparent hover:opacity-100" />
          <div class="w-full">{currentDir()?.replace(/^.*[//\\]/, '')}</div>
          <CloseProjectButton class="opacity-60 hover:bg-transparent hover:opacity-100" />
        </div>
        {/* <div class="scrollable-container pr-1 min-h-0 h-full"> */}
        <ul id="file-list" class="overflow-auto text-slate-200 text-sm mr-0.5">
          <For each={currentFiles()}>
            {(file) => (
              <li
                class={
                  'flex justify-between pl-3 pr-1 pb-0.5 cursor-pointer gap-1 ' +
                  (file === selectedFile()
                    ? ' bg-slate-300/50 font-semibold '
                    : ' hover:bg-slate-300/30 ')
                }
              >
                <button
                  class="w-full text-left text-ellipsis text-nowrap overflow-hidden"
                  onClick={async () => {
                    await handleSave()
                    setSelectedFile(file)
                  }}
                >
                  {file.replace(/\.html$/, '')}
                </button>
                <div class="flex items-center gap-1 text-white">
                  <Tooltip>
                    <TooltipTrigger>
                      <div class={fileStatusStore.commented.includes(file) ? '' : ' opacity-30 '}>
                        <CommentIcon size={14} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent class="shadow-sm shadow-slate-500">
                      <p class="p-0">
                        {fileStatusStore.commented.includes(file)
                          ? 'Comments attached'
                          : 'No comments yet'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <div class={fileStatusStore.graded.includes(file) ? '' : ' opacity-30 '}>
                        <MarkedIcon size={14} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent class="shadow-sm shadow-slate-500">
                      <p class="p-0">
                        {fileStatusStore.graded.includes(file) ? 'Graded' : 'Not graded'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </li>
            )}
          </For>
        </ul>
        {/* </div> */}
      </div>
    </Show>
  )
}
