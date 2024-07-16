import { Component, useContext } from 'solid-js'
import { Button, Context, Tooltip, TooltipContent, TooltipTrigger } from '@/components'

type ButtonProps = {
  class?: string
}

export const CloseProjectButton: Component<ButtonProps> = (props) => {
  const { closeProject, handleSave } = useContext(Context)!
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          onclick={async () => {
            await handleSave()
            closeProject()
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
            class="lucide lucide-square-x"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </Button>
      </TooltipTrigger>
      <TooltipContent class="shadow-sm shadow-slate-500">
        <p class="p-0">Close project</p>
      </TooltipContent>
    </Tooltip>
  )
}
