import { Component, JSX } from 'solid-js'
import { Button } from './button'

type ButtonProps = {
  class?: string
  onclick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> | undefined
}

export const RemoveButton: Component<ButtonProps> = (props) => {
  return (
    <Button onclick={props.onclick} variant="ghost" size="icon" class={props.class}>
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
        class="lucide lucide-circle-minus"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
      </svg>
    </Button>
  )
}
