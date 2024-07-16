import { Component, onCleanup, onMount, Show, useContext } from 'solid-js'
import { Context, IntroScreen, ReaderPanel } from '@/components'

export const MainPanel: Component = () => {
  const { selectedFile, handleSave } = useContext(Context)!

  const handleClose = async () => {
    await handleSave()
  }
  onMount(() => {
    window.addEventListener('beforeunload', handleClose)
  })
  onCleanup(() => {
    window.removeEventListener('beforeunload', handleClose)
  })
  return (
    <Show when={selectedFile()} fallback={<IntroScreen />}>
      <div class="h-full grid min-h-0" style={{ 'grid-template-rows': '35px 1fr' }}>
        <div class="bg-slate-700/40 p-1 text-center font-semibold z-50">
          {selectedFile()?.replace(/\.html$/, '')}
        </div>
        <ReaderPanel />
      </div>
    </Show>
  )
}
