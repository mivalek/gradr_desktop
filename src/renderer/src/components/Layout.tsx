import { Component, JSXElement } from 'solid-js'
import { TitleBar } from '@/components'

export const Layout: Component<{ children: JSXElement }> = (props) => {
  return (
    <>
      <TitleBar />
      <div
        id="app-container"
        class="grid h-[calc(100vh_-_30.5px)] mt-[30.5px] relative overflow-clip"
        style={{
          'grid-template-columns': 'minmax(auto, 200px) minmax(auto, 1fr) auto'
        }}
      >
        {props.children}
      </div>
    </>
  )
}
