import { Component, For, Show, createEffect, onCleanup, onMount, useContext } from 'solid-js'
import { Comment, Context } from '@/components'
import { TRubricCriterion } from '@shared/types'

import { positionComments } from '@renderer/utils/libs'
import { SolidMarkdown } from 'solid-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

type CommentProps = {
  rubric: TRubricCriterion[]
}

export const CommentsPanel: Component<CommentProps> = (props) => {
  const { currentId, markFileAsDone, resource, commentStore, setCommentStore } =
    useContext(Context)!

  const basicTypes = [
    {
      name: 'Comment',
      label: 'cmnt',
      colour: '245, 241, 0'
    },
    {
      name: 'Good',
      label: 'good',
      colour: '33, 184, 13'
    },
    {
      name: 'Attention',
      label: 'attn',
      colour: '255, 119, 0'
    },
    {
      name: 'Problem',
      label: 'prob',
      colour: '212, 11, 11'
    }
  ]

  createEffect(() => {
    if (resource.state !== 'ready') return
    const desanitisedComments = resource().comments.map((c) => {
      const newContent = c.content.replaceAll(/\n&gt;/g, '\n>') // desanitise block quote
      return { ...c, content: newContent }
    })
    setCommentStore('comments', desanitisedComments)
    // nesting avoids multiple renders
    createEffect(() => {
      const commentsCount = commentStore.comments.length
      setCommentStore('commentCount', commentsCount)
      setCommentStore('hasComments', commentsCount !== 0)
      markFileAsDone('commented', commentStore.hasComments)
      // nesting avoids multiple renders
      createEffect(() => {
        if (currentId() && !commentStore.comments.find((c) => c.id === currentId())) {
          const hl = document.querySelector(`.gradr-hl[data-id='${currentId()}']`)
          if (!hl) return
          setCommentStore('comments', (currentComments) => [
            ...currentComments,
            {
              id: currentId()!,
              content: '',
              type: 'cmnt'
            }
          ])
        }
      })
    })
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
              isOnlyComment={
                commentStore.commentCount === 1 && !commentStore.comments[0].content.length
              }
              comment={com}
              currentId={currentId()}
              setCommentStore={setCommentStore}
              rubric={props.rubric}
              basicTypes={basicTypes}
            />
          )}
        </For>
      </div>
      <div id="gradr-comments-export" class="hidden">
        <div id="gradr-comments">
          <For each={commentStore.comments}>
            {(com) => (
              <div class={`gradr-comment gradr-crit-${com.type}`} data-id={com.id}>
                <Show when={com.type !== 'cmnt'}>
                  <div class="gradr-comment-header">
                    {basicTypes.concat(props.rubric).find((c) => c.label === com.type)?.name}
                  </div>
                  <Show when={!['good', 'attn', 'prob'].includes(com.type)}>
                    <button data-crit={com.type}>?</button>
                  </Show>
                </Show>
                <SolidMarkdown
                  children={com.content}
                  remarkPlugins={[remarkMath]}
                  // @ts-ignore: no types for rehypeKatex
                  rehypePlugins={[rehypeKatex]}
                />
              </div>
            )}
          </For>
        </div>
      </div>
    </>
  )
}
