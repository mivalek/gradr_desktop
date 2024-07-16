import { Component, Show, useContext } from 'solid-js'
import { Document, CommentsPanel, Context, LoadingSpinner } from '@/components'
import { rubricStyle } from '@shared/lib'
export const ReaderPanel: Component = () => {
  const { configStore, isFileLoaded } = useContext(Context)!

  return (
    <div class="scrollable-container min-h-0 bg-slate-500/40 relative h-full pr-0.5">
      <div
        id="main-panel"
        class="overflow-auto grid text-black h-full pr-1"
        style={{
          'grid-template-columns': 'minmax(250px, 3fr) minmax(180px, 1fr)'
        }}
      >
        <style>{rubricStyle(configStore.rubric)}</style>
        <Show when={isFileLoaded()} fallback={<LoadingSpinner />}>
          <Document />
          <CommentsPanel rubric={configStore.rubric.criteria} />
        </Show>
      </div>
    </div>
  )
}
