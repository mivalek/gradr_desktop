import { Component, createSignal, useContext } from 'solid-js'
import { Button, Context, Tooltip, TooltipContent, TooltipTrigger } from '@/components'

type ButtonProps = {
  class?: string
}

export const ExportGradesButton: Component<ButtonProps> = (props) => {
  const { handleSave, fileStatusStore } = useContext(Context)!
  const [disabled, setDisabled] = createSignal(false)
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          disabled={fileStatusStore.graded.length === 0 || disabled()}
          onclick={async () => {
            setDisabled(true)
            await handleSave()
            await window.api.exportGrades()
            setDisabled(false)
          }}
          variant="ghost"
          size="icon"
          class={props.class}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-download"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
        </Button>
      </TooltipTrigger>
      <TooltipContent class="shadow-sm shadow-slate-500">
        <p class="p-0">Export grades</p>
      </TooltipContent>
    </Tooltip>
  )
}
