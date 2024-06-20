import { Component, Setter, Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'
import { CloseButton, TextArea, TextFieldRoot } from '@/components'
import { positionComments, removeHighlight } from '@renderer/utils/libs'
import { TComment } from '@shared/types'
import { SolidMarkdown } from 'solid-markdown'
import '../assets/Comment.css'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

type CommentProps = {
  comment: TComment
  currentId: string | undefined
  setId: Setter<string | undefined>
  setCommentStore: SetStoreFunction<{
    commentCount: number
    comments: TComment[]
  }>
}

export const Comment: Component<CommentProps> = (props) => {
  const { comment, setId, setCommentStore } = props
  const [content, setContent] = createSignal(comment.content)
  const isActive = () => props.currentId === comment.id
  let commentRef!: HTMLDivElement
  createEffect(() => {
    if (props.currentId !== comment.id) return
    const textArea = commentRef.querySelector('textarea')!
    textArea.focus()
    textArea.addEventListener('blur', (e) => {
      const relatedTarget = e.relatedTarget
      if (relatedTarget && (relatedTarget as HTMLElement).dataset.id === comment.id) {
        textArea.focus()
        return
      }
      finaliseComment()
    })
  })

  const removeComment = async () => {
    await setId()
    removeHighlight(comment.id)
    setCommentStore('comments', (com) => com.filter((c) => c.id !== comment.id))
  }

  const finaliseComment = () => {
    const thisContent = content()
    if (!thisContent.length) {
      removeComment()
      return
    }
    setId()
    setCommentStore('comments', (com) => com.id === comment.id, 'content', thisContent)
    positionComments()
  }

  onMount(() => {
    positionComments()
  })
  onCleanup(() => {
    positionComments()
  })
  return (
    <div
      ref={commentRef}
      tabindex="0"
      class={
        'gradr-comment absolute w-full bg-slate-100 shadow-sm p-1 border rounded-[3px] ' +
        (isActive() ? 'z-[1000] border-black ' : 'border-transparent')
      }
      data-id={comment.id}
      onClick={() => {
        setId(comment.id)
      }}
    >
      <div class="relative">
        <div id="currentTrgt"></div>
        <Show
          when={isActive()}
          fallback={
            <SolidMarkdown
              remarkPlugins={[remarkMath]}
              // @ts-ignore:
              rehypePlugins={[rehypeKatex]}
              class="gradr-rendered-markdown p-0.5"
              children={content()}
            />
          }
        >
          <TextFieldRoot value={content()} onChange={setContent} class="w-full max-w-xs">
            <TextArea
              autoResize
              class="resize-none rounded-none border-none bg-white focus-visible:ring-0"
            />
          </TextFieldRoot>
        </Show>
        <CloseButton
          onclick={removeComment}
          size={20}
          class="gradr-delete-comment absolute top-0 right-0"
          fill="red"
        />
      </div>
    </div>
  )
}
