import { Component } from 'solid-js'

export const TitleBar: Component = () => {
  return (
    <div id="titleBarContainer" class="absolute top-0 w-full">
      <div id="titleBar" class="draggable h-[30.5px] bg-background/40">
        {/* <span class="draggable">Example PWA</span> */}
        {/* <input class="nonDraggable" type="text" placeholder="Search"></input> */}
      </div>
    </div>
  )
}
