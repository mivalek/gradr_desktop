import { TextField, TextFieldRoot, Tooltip, TooltipContent, TooltipTrigger } from '@/components'
import { Component, Show, createEffect, createSignal } from 'solid-js'
import { TGradeStore, TRubricCriterion } from '@shared/types'
import { SetStoreFunction } from 'solid-js/store'

type TGradeInput = {
  crit: TRubricCriterion
  grade: number | null
  setGradeStore: SetStoreFunction<TGradeStore>
}
export const GradeInput: Component<TGradeInput> = (props) => {
  const [input, setInput] = createSignal('')
  createEffect(() => setInput(props.grade?.toString() || ''))
  const validateInput = (value: string) => {
    if (!value.length) {
      setInput(value)
      return
    }
    const inputNum = Number(value)
    if (inputNum > 100 || inputNum < 0 || Number.isNaN(inputNum)) return
    setInput(value)
  }
  return (
    <div class="flex flex-nowrap gap-4 justify-between items-center">
      <Tooltip>
        <TooltipTrigger>
          <div class="whitespace-nowrap text-nowrap">
            {props.crit.name}
            <Show when={props.crit.weight !== 0}>
              <span class="ml-1 opacity-70 font-light text-sm">({props.crit.weight}%)</span>
            </Show>
          </div>
        </TooltipTrigger>
        <TooltipContent class="shadow-sm shadow-slate-500 max-w-sm">
          <p class="p-0">{props.crit.description}</p>
        </TooltipContent>
      </Tooltip>
      <div>
        <TextFieldRoot
          class="w-[37px]"
          value={input()}
          onChange={validateInput}
          onFocusOut={() =>
            props.setGradeStore('grades', (grades) => ({
              ...grades,
              [props.crit.name]: input() === '' ? null : Number(input())
            }))
          }
        >
          <TextField
            placeholder="-"
            class="px-1.5 py-0 h-fit text-base border-none rounded-none bg-slate-200 text-secondary text-end font-semibold"
          />
        </TextFieldRoot>
      </div>
    </div>
  )
}
