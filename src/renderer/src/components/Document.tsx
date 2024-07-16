import { highlightSelection, toggleActiveComment } from '@renderer/utils/libs'
import { Component, createEffect, useContext } from 'solid-js'

import '../assets/Document.css'
import { Context } from '@/components'
import { TMathsWindow } from '@shared/types'

export const Document: Component = () => {
  const { setCurrentId, resource } = useContext(Context)!

  let contentElement!: HTMLDivElement
  createEffect(() => {
    const contentText = resource()?.content
    if (contentText) {
      contentElement!.innerHTML = contentText
      contentElement.querySelectorAll('.gradr-hl').forEach((hl) => {
        const id = (hl as HTMLElement).dataset.id!
        hl.addEventListener('click', (e) => handleHighlightClick(e as MouseEvent, id))
        hl.addEventListener('pointerover', () => {
          toggleActiveComment(id)
        })
        hl.addEventListener('pointerout', () => {
          toggleActiveComment(id, true)
        })
      })
      contentElement
        .querySelectorAll("a[href*='http']")
        .forEach((a) => a.setAttribute('tabindex', '-1'))
      ;(window as TMathsWindow).renderMathInElement(contentElement)
    }
  })

  const handlePointerUp = (
    e: PointerEvent & {
      currentTarget: HTMLDivElement
      target: Element
    }
  ) => {
    const userSelection = window.getSelection()
    const selectionRange = userSelection?.getRangeAt(0)
    const uuid = window.crypto.randomUUID()
    const DocumentPanel = document.getElementById('main-panel')!
    const scrollTop = DocumentPanel?.scrollTop
    if (!selectionRange?.toString()) {
      if (e.target.tagName !== 'IMG') {
        setCurrentId()
        return
      }
      const img = e.target as HTMLImageElement
      if (img.parentElement?.classList.contains('gradr-hl')) return
      const wrapper = document.createElement('div')
      wrapper.classList.add('gradr-hl', 'gradr-crit-cmnt')
      wrapper.dataset.id = uuid
      img.insertAdjacentElement('beforebegin', wrapper)
      wrapper.appendChild(img)
      wrapper.addEventListener('click', (e) => handleHighlightClick(e, uuid))
      wrapper.addEventListener('pointerover', () => {
        toggleActiveComment(uuid)
      })
      wrapper.addEventListener('pointerout', () => {
        toggleActiveComment(uuid, true)
      })
    } else {
      highlightSelection(selectionRange, uuid, setCurrentId)
      userSelection?.removeAllRanges()
    }
    setCurrentId(uuid)
    DocumentPanel.scroll(0, scrollTop)
  }

  function handleHighlightClick(e: MouseEvent, id: string) {
    e.stopPropagation()
    setCurrentId(id)
  }

  return (
    <div id="document">
      <div
        ref={contentElement}
        id="file-container"
        class="h-fit p-2 m-2 bg-white shadow-md shadow-background select-text"
        onPointerUp={handlePointerUp}
      ></div>
    </div>
  )
}
