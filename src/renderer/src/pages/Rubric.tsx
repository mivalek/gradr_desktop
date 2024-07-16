import {
  AddButton,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  TextField,
  TextFieldRoot
} from '@renderer/components'
import { RubricCriterion } from '@renderer/components/RubricCriterion'
import { TRubricStore } from '@shared/types'
import { Component, For, createEffect, createSignal } from 'solid-js'
import { createStore, unwrap } from 'solid-js/store'
import { RUBRIC_COLOURS } from '@shared/constants'

const [rubricStore, setRubricStore] = createStore<TRubricStore>({
  name: '',
  criteria: [
    { index: 0, name: '', label: '', colour: RUBRIC_COLOURS[0], description: '', weight: 0 }
  ]
})

export const Rubric: Component = () => {
  const [rubricName, setRubricName] = createSignal(rubricStore.name)
  const [errorDialogOpen, setErrorDialogOpen] = createSignal(false)
  const [errorMessage, setErrorMessage] = createSignal('')
  let scrollableDivRef!: HTMLDivElement
  const availableColours = () => {
    const usedColours = rubricStore.criteria.map((c) => c.colour)
    return RUBRIC_COLOURS.filter((colour) => !usedColours.includes(colour))
  }
  function handleAdd() {
    const idx = rubricStore.criteria.length
    setRubricStore('criteria', (prevCrits) => [
      ...prevCrits,
      {
        index: idx,
        label: '',
        name: '',
        colour: availableColours()[0],
        description: '',
        weight: 0
      }
    ])
  }
  const handleRubricSubmit = async () => {
    if (!rubricName().length) {
      setErrorMessage('Your rubric needs a name')
      return
    }
    const rubric = unwrap(rubricStore)
    const names = rubric.criteria.map((crit) => crit.name)
    if (names.some((n) => n === '')) {
      setErrorMessage('Give every criterion a name')
      return
    }
    const uniqueNames = new Set(names)
    if (uniqueNames.size !== names.length) {
      setErrorMessage('Criterion names must be unique')
      return
    }
    if (rubric.criteria.map((crit) => crit.description).some((desc) => desc === '')) {
      setErrorMessage('Provide a description for each criterion')
      return
    }
    const weights = rubric.criteria.map((crit) => crit.weight)
    const areWeights = weights.some((w) => w !== 0)
    if (areWeights && weights.some((w) => w === 0)) {
      setErrorMessage('All weights must either be set or blank')
      return
    }
    if (areWeights && weights.reduce((sum, w) => sum + w, 0) !== 100) {
      setErrorMessage('Weights must add up to 100%')
      return
    }
    rubric.name = rubricName()
    for (let i = 0; i < rubric.criteria.length; i++) {
      rubric.criteria[i].label = `c${i + 1}`
      delete rubric.criteria[i].index
    }
    const res = window.api.saveRubric(rubric)
    if (!res) {
      setErrorMessage('Something went wrong. Try again.')
    }
    setErrorMessage('')
    window.close()
  }

  createEffect(() => {
    if (!rubricStore.criteria.length) return
    scrollableDivRef.scrollTop = scrollableDivRef.scrollHeight
    const critNameInputs = scrollableDivRef.querySelectorAll('.crit-name')
    ;(critNameInputs[critNameInputs.length - 1] as HTMLTextAreaElement).focus()
  })
  return (
    <>
      <div id="titleBarContainer" class="absolute top-0 w-full">
        <div id="titleBar" class="draggable h-[30px] bg-transparent"></div>
      </div>
      <div
        id="rubric-editor"
        class="h-screen w-full bg-background/40 p-6 text-slate-50 grid items-start whitespace-nowrap"
        style={{ 'grid-template-rows': 'auto 1fr auto' }}
      >
        <div class="flex items-center gap-3 pt-4 pb-8 w-fit m-auto">
          <div>Rubric name</div>
          <TextFieldRoot class="w-full max-w-xs " value={rubricName()} onChange={setRubricName}>
            <TextField
              placeholder="e.g., module/course name"
              class="border-background bg-slate-700/60"
            />
          </TextFieldRoot>
        </div>
        <div>
          <div
            class="min-w-0 grid gap-x-2 gap-y-4 max-h-[calc(100vh_-_225px)] overflow-hidden w-fit m-auto"
            style={{ 'grid-template-columns': 'repeat(6, auto)' }}
          >
            <div class="grid grid-cols-subgrid col-span-5 justify-center text-center">
              <div></div>
              <div>Label</div>
              <div>Criterion name</div>
              <div>Description</div>
              <div class="text-left">Weight</div>
            </div>
            <div
              ref={scrollableDivRef}
              class="grid grid-cols-subgrid col-span-6 min-h-0 gap-y-3 max-h-[calc(100vh_-_265px)] overflow-scroll"
            >
              <For each={rubricStore.criteria}>
                {(crit, i) => (
                  <RubricCriterion
                    criterion={crit}
                    criterionIndex={i()}
                    setRubricStore={setRubricStore}
                    allowRemove={i() > 0 || rubricStore.criteria.length > 1}
                    availableColours={availableColours()}
                  />
                )}
              </For>
            </div>
          </div>
          <div class="flex justify-center">
            <AddButton
              disabled={availableColours().length === 0}
              class={
                'opacity-70 hover:opacity-100 hover:bg-transparent' +
                (availableColours().length ? '' : ' invisible')
              }
              onclick={handleAdd}
            />
          </div>
        </div>
        <div class="flex justify-around">
          <AlertDialog open={errorDialogOpen()} onOpenChange={setErrorDialogOpen}>
            <AlertDialogTrigger>
              <Button onClick={handleRubricSubmit}>Apply</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Error</AlertDialogTitle>
                <AlertDialogDescription>{errorMessage()}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button onClick={() => setErrorDialogOpen(false)}>OK</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={() => window.close()}>Cancel</Button>
        </div>
      </div>
    </>
  )
}
