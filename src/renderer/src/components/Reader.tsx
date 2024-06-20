import { highlightSelection } from '@renderer/utils/libs'
import { Accessor, Component, Setter, createEffect, createResource } from 'solid-js'

import '../assets/Reader.css'
import { TComment, TMathsWindow, TMetadata } from '@shared/types'
import { SetStoreFunction } from 'solid-js/store'

type ReaderProps = {
  fileName: Accessor<string | undefined>
  path: Accessor<string | undefined>
  setCurrentId: Setter<string | undefined>
  setCommentStore: SetStoreFunction<{
    commentCount: number
    comments: TComment[]
  }>
}

export const Reader: Component<ReaderProps> = (props) => {
  const { fileName, setCurrentId, setCommentStore } = props
  const [resource] = createResource(fileName, async (file) => {
    if (!fileName()) return { content: '', parsedMetadata: { comments: [], grade: {} } }
    const { content, metadata } = await window.api.openFile(file)
    const parsedMetadata: TMetadata = metadata ? JSON.parse(metadata) : { comments: [], grade: {} }
    return { content, parsedMetadata }
  })
  let contentElement!: HTMLDivElement
  createEffect(async () => {
    if (!resource()) return
    const contentText = resource()!.content
    if (contentText) {
      contentElement!.innerHTML = contentText
      contentElement.querySelectorAll('.gradr-hl').forEach((hl) => {
        const id = (hl as HTMLElement).dataset.id!
        hl.addEventListener('click', (e) => handleHighlightClick(e as MouseEvent, id))
      })
      ;(window as TMathsWindow).renderMathInElement(contentElement)
      setCommentStore('comments', resource()!.parsedMetadata.comments)
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
    if (!selectionRange?.toString()) {
      if (e.target.tagName !== 'IMG') {
        setCurrentId()
        return
      }
      const img = e.target as HTMLImageElement
      if (img.parentElement?.classList.contains('gradr-hl')) return
      const wrapper = document.createElement('div')
      wrapper.classList.add('gradr-hl')
      wrapper.dataset.id = uuid
      img.insertAdjacentElement('beforebegin', wrapper)
      wrapper.appendChild(img)
      wrapper.addEventListener('click', (e) => handleHighlightClick(e, uuid))
      // img.replaceWith(`<div class="gradr-hl" data-id="${uuid}">${img.outerHTML}</div>`)
      // e.target.classList.add('gradr-hl')
      // e.target.setAttribute('data-id', uuid)
    } else {
      highlightSelection(selectionRange, uuid, setCurrentId)
      userSelection?.removeAllRanges()
    }
    setCurrentId(uuid)
  }

  function handleHighlightClick(e: MouseEvent, id: string) {
    e.stopPropagation()
    setCurrentId(id)
  }

  return (
    <div id="reader">
      <div
        ref={contentElement}
        id="file-container"
        class="h-fit p-2 m-2 bg-white shadow-md shadow-background select-text"
        onPointerUp={handlePointerUp}
      ></div>
    </div>
  )
}
