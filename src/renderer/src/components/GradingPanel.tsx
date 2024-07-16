import { Component, Show, createEffect, createSignal, useContext } from 'solid-js'
import {
  Button,
  Context,
  GradingArea,
  MarkedIcon,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components'
import { positionComments } from '@renderer/utils/libs'

export const GradingPanel: Component = () => {
  const [showGradingArea, setShowGradingArea] = createSignal(false)
  const { selectedFile, fileStatusStore } = useContext(Context)!
  createEffect(() => {
    showGradingArea()
    positionComments()
  })
  createEffect(() => {
    if (!selectedFile()) return
    if (fileStatusStore.commented.concat(fileStatusStore.graded).includes(selectedFile()!))
      setShowGradingArea(true)
  })
  return (
    <Show when={selectedFile()}>
      <div
        class="grid w-fit bg-background/60 place-items-end min-h-0"
        style={{ 'grid-template-rows': '38px 1fr' }}
      >
        <Tooltip>
          <TooltipTrigger>
            <Button
              onClick={() => setShowGradingArea((prev) => !prev)}
              size="icon"
              variant="ghost"
              class={
                'hover:bg-transparent hover:opacity-100 ' +
                (showGradingArea() ? ' opacity-60 ' : ' opacity-30 ')
              }
            >
              <MarkedIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent class="shadow-sm shadow-slate-500">
            <p class="p-0">{showGradingArea() ? 'Hide' : 'Show'} grading panel</p>
          </TooltipContent>
        </Tooltip>
        <GradingArea show={showGradingArea()} />
      </div>
    </Show>
  )
}
