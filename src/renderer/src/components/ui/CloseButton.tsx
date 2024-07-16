import { Component, JSX } from 'solid-js'

type ButtonProps = {
  size: number
  class: string
  fill: string
  onclick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> | undefined
  label?: string
}
export const CloseButton: Component<ButtonProps> = (props) => {
  return (
    <button class={props.class} onclick={props.onclick} aria-label={props.label || 'close'}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size}
        height={props.size}
        viewBox="0 0 24 24"
        fill={props.fill}
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-circle-x"
      >
        <circle cx="12" cy="12" r="10" stroke="none" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    </button>
  )
}
