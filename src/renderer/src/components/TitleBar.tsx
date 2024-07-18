import { Component } from 'solid-js'
// import icon from '../../../../resources/icon.png?asset'

export const TitleBar: Component = () => {
  return (
    <div id="titleBarContainer" class="absolute top-0 w-full">
      <div id="titleBar" class="draggable h-[30.5px] bg-background/40">
        {/* <img src={icon} class="max-h-full px-2 py-1.5" /> */}
        {/* <input class="nonDraggable" type="text" placeholder="Search"></input> */}
      </div>
    </div>
  )
}
