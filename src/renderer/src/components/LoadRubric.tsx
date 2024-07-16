import { Component, For, Show, createResource, createSignal, useContext } from 'solid-js'

import {
  Button,
  Context,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components'

export const LoadRubric: Component = () => {
  const { setConfigStore } = useContext(Context)!
  const [rubricList] = createResource(window.api.requestRubricList)
  const [selectedRubric, setSelectedRubric] = createSignal<string>()
  const [open, setOpen] = createSignal(false)

  const handleImport = async () => {
    if (!selectedRubric()) return
    const rubric = await window.api.loadRubric(selectedRubric()!)
    if (!rubric.name.length) {
      console.log('error') // TODO
      return
    }
    setConfigStore('rubric', rubric)
    setOpen(false)
  }
  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Load rubric</Button>
      </DialogTrigger>
      <DialogContent class="max-w-[min(400px,_90vw)] bg-background ">
        <Show
          when={rubricList()}
          fallback={
            <>
              <DialogHeader>Load rubric</DialogHeader>
              <div>You haven't created any rubrics yet.</div>
            </>
          }
        >
          <DialogHeader>
            <DialogTitle>Load rubric</DialogTitle>
            <DialogDescription>
              Choose a marking rubric from ones you've previously used
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <ul class="border border-slate-600 rounded-sm overflow-clip">
              <For each={rubricList()}>
                {(rubric) => (
                  <li
                    class={
                      'px-2 py-1 flex ' +
                      (selectedRubric() === rubric.fileName
                        ? ' bg-slate-600 '
                        : ' hover:bg-slate-800 ')
                    }
                  >
                    <button
                      class="w-full "
                      onClick={() =>
                        setSelectedRubric(
                          selectedRubric() === rubric.fileName ? undefined : rubric.fileName
                        )
                      }
                    >
                      {rubric.displayName}
                    </button>
                  </li>
                )}
              </For>
            </ul>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleImport}>
              Load
            </Button>
          </DialogFooter>
        </Show>
      </DialogContent>
    </Dialog>
  )
}
