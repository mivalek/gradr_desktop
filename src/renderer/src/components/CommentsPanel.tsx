import { Component, For, Setter, createEffect, onCleanup, onMount } from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'
import { Comment } from '@/components'
import { TComment } from '@shared/types'
import { SolidMarkdown } from 'solid-markdown'

import '../assets/CommentsPanel.css'
import { positionComments } from '@renderer/utils/libs'

type CommentProps = {
  id: string | undefined
  setId: Setter<string | undefined>
  commentStore: {
    commentCount: number
    comments: TComment[]
  }
  setCommentStore: SetStoreFunction<{
    commentCount: number
    comments: TComment[]
  }>
}
export const CommentsPanel: Component<CommentProps> = (props) => {
  const { commentStore, setCommentStore } = props
  createEffect(() => {
    if (!props.id) return
    if (!commentStore.comments.find((c) => c.id === props.id)) {
      const hl = document.querySelector(`.gradr-hl[data-id='${props.id}']`)
      if (!hl) return
      setCommentStore('comments', (currentComments) => [
        ...currentComments,
        {
          id: props.id!,
          content: ''
        }
      ])
    }
  })

  onMount(() => {
    window.addEventListener('resize', positionComments)
  })

  onCleanup(() => {
    window.removeEventListener('resize', positionComments)
  })

  return (
    <>
      <div id="comments-container" class="relative">
        <For each={commentStore.comments}>
          {(com) => (
            <Comment
              comment={com}
              currentId={props.id}
              setCommentStore={setCommentStore}
              setId={props.setId}
            />
          )}
        </For>
      </div>
      <div class="gradr-comments-export">
        <For each={commentStore.comments}>
          {(com) => (
            <div class="gradr-comment" data-id={com.id}>
              <SolidMarkdown children={com.content} />
            </div>
          )}
        </For>
        <div class="gradr-metadata hidden">
          {JSON.stringify({ comments: commentStore.comments, grades: {} })}
        </div>
      </div>
    </>
  )
}
