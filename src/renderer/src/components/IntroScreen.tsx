import { Component, createSignal, Show, useContext } from 'solid-js'
import { Button, Context, LoadRubric } from '@/components'

export const IntroScreen: Component = () => {
  const { currentDir, selectedFile, isRubric, setupProject, currentFiles } = useContext(Context)!
  const [disabled, setDisabled] = createSignal(false)
  window.api.onRestoreProject((projectDetails) => {
    const { dir, files, config } = projectDetails
    console.log('restored: ', projectDetails)
    setupProject(dir, files, config)
  })

  const handleSelectFolder = async (): Promise<void> => {
    const { dir, files, config } = await window.api.openFolder()
    if (!dir) {
      console.log('selection cancelled')
      return
    }
    setupProject(dir, files, config)
  }

  const isDirSelected = (): number | '' | undefined => currentDir() && currentDir()!.length
  return (
    <div
      class={
        'flex items-center justify-center bg-background/40 ' +
        (isRubric() ? ' col-span-2 ' : ' col-span-3 ')
      }
    >
      <Show when={!isDirSelected()}>
        <div>
          <h2>
            Welcome to <code>gradR</code>!
          </h2>
          <p>
            Start by opening a project. This is just a folder where you keep the HTML files that you
            want to grade.
          </p>
          <Button
            disabled={disabled()}
            onClick={() => {
              setDisabled(true)
              handleSelectFolder()
              setTimeout(() => setDisabled(false), 500)
            }}
          >
            Select folder
          </Button>
        </div>
      </Show>
      <Show when={isDirSelected() && !isRubric()}>
        <div class="flex flex-col gap-20 h-full pt-20">
          <div class="flex flex-col items-center">
            <h2>Selected folder:</h2>
            <p>
              <code>{currentDir()}</code>
            </p>
            <Button
              size="sm"
              onClick={() => {
                setDisabled(true)
                window.api.closeProject()
                handleSelectFolder()
                setTimeout(() => setDisabled(false), 500)
              }}
            >
              Change
            </Button>
          </div>
          <div class="flex flex-col items-center">
            <p>Before you can start grading, you need a rubric. You can</p>
            <div class="flex gap-2 items-center">
              <LoadRubric />
              <div>or</div>
              <Button
                disabled={disabled()}
                onClick={() => {
                  setDisabled(true)
                  window.api.openWindow('rubric')
                  setTimeout(() => setDisabled(false), 500)
                }}
              >
                Create new rubric
              </Button>
            </div>
          </div>
        </div>
      </Show>
      <Show when={isDirSelected() && isRubric() && !selectedFile()}>
        <div class="flex flex-col gap-2 items-center">
          <Show
            when={currentFiles().length !== 0}
            fallback={
              <>
                <h2>Project folder is set up but...</h2>
                <p>
                  There are no HTML files in the folder to grade. Copy them over to start grading.
                </p>
              </>
            }
          >
            <h2>You're all set!</h2>
            <p>Now simply pick a file to start grading</p>
          </Show>
        </div>
      </Show>
    </div>
  )
}
