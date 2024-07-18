import { Component, For, Show, createEffect, createSignal } from 'solid-js'
import { TextField, TextFieldRoot } from './ui/textfield'
import { TextArea } from './ui/textarea'
import { TRubricCriterion, TRubricStore } from '@shared/types'
import { SetStoreFunction } from 'solid-js/store'
import { RemoveButton } from './ui/RemoveButton'
import '../assets/RubricCriterion.css'

type TRubricCriterionProps = {
  criterion: TRubricCriterion
  criterionIndex: number
  setRubricStore: SetStoreFunction<TRubricStore>
  allowRemove: boolean
  availableColours: string[]
}

export const RubricCriterion: Component<TRubricCriterionProps> = (props) => {
  const [name, setName] = createSignal('')
  const [weight, setWeight] = createSignal('')
  const [description, setDescription] = createSignal('')

  createEffect(() => {
    setName(props.criterion.name)
    setWeight(props.criterion.weight.toString())
    setDescription(props.criterion.description)
  })
  function handleRemove() {
    props.setRubricStore('criteria', (crit) => crit.filter((_, i) => i !== props.criterion.index))
  }

  function setCriterionProperty(prop: keyof TRubricCriterion, value: string) {
    props.setRubricStore('criteria', [props.criterion.index as number], prop, value)
  }

  function validateWeight(input) {
    if (!input.length) {
      setWeight('0')
      return
    }
    if (input.includes('.')) return
    const inputNumeric = Number(input)
    if (!inputNumeric) return
    if (inputNumeric > 100) return
    setWeight(input)
  }
  return (
    <div class="grid grid-cols-subgrid col-span-6 py-px">
      <div class="colour-picker h-9 w-[120px] flex items-center justify-end justify-self-end relative">
        <For each={props.availableColours}>
          {(colour, i) => {
            return (
              <button
                onClick={() => setCriterionProperty('colour', props.availableColours[i()])}
                class="colour w-4 h-4 rounded-full absolute right-0 transition-all delay-100 "
                style={{
                  'background-color': `rgb(${colour}`,
                  'z-index': 10 - i()
                }}
              />
            )
          }}
        </For>
        <div
          class="w-4 h-4 rounded-full z-20"
          style={{ 'background-color': `rgb(${props.criterion.colour})` }}
        />
      </div>
      <div class="p-1 text-center">c{props.criterionIndex + 1}</div>
      <TextFieldRoot
        class="w-full max-w-[150px]"
        value={name()}
        onChange={setName}
        onFocusOut={() => setCriterionProperty('name', name())}
      >
        <TextField class="crit-name border-background bg-slate-700/60" />
      </TextFieldRoot>
      <TextFieldRoot
        value={description()}
        onChange={setDescription}
        onFocusOut={() => setCriterionProperty('description', description())}
      >
        <TextArea autoResize class="resize-none w-80 min-h-9 border-background bg-slate-700/60 " />
      </TextFieldRoot>
      <div>
        <div class="flex flex-nowrap items-center gap-1">
          <TextFieldRoot
            class="w-[42px]"
            value={weight() === '0' ? '' : weight()}
            onChange={validateWeight}
            onFocusOut={() =>
              props.setRubricStore(
                'criteria',
                [props.criterion.index as number],
                'weight',
                Number(weight())
              )
            }
          >
            <TextField class="border-background bg-slate-700/60" placeholder="-" />
          </TextFieldRoot>
          <span>%</span>
        </div>
      </div>
      <Show when={props.allowRemove} fallback={<div class="h-9 w-9" />}>
        <RemoveButton
          onclick={handleRemove}
          class="remove-criterion opacity-60 hover:text-red-500 hover:bg-transparent"
        />
      </Show>
    </div>
  )
}
