import { Component, For, Show, createSignal } from 'solid-js'
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
  const { criterion, setRubricStore } = props
  const [name, setName] = createSignal(criterion.name)
  const [weight, setWeight] = createSignal(criterion.weight.toString())
  const [description, sedivescription] = createSignal(criterion.description)

  function handleRemove() {
    setRubricStore('criteria', (crit) => crit.filter((_, i) => i !== criterion.index))
  }

  function setCriterionProperty(prop: keyof TRubricCriterion, value: string) {
    setRubricStore('criteria', [criterion.index as number], prop, value)
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
              ></button>
            )
          }}
        </For>
        <div
          class="w-4 h-4 rounded-full z-20"
          style={{ 'background-color': `rgb(${criterion.colour})` }}
        ></div>
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
        onChange={sedivescription}
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
              setRubricStore('criteria', [criterion.index as number], 'weight', Number(weight()))
            }
          >
            <TextField class="border-background bg-slate-700/60" placeholder="-" />
          </TextFieldRoot>
          <span>%</span>
        </div>
      </div>
      <Show when={props.allowRemove} fallback={<div class="h-9 w-9"></div>}>
        <RemoveButton
          onclick={handleRemove}
          class="remove-criterion opacity-60 hover:text-red-500 hover:bg-transparent"
        />
      </Show>
    </div>
  )
}
