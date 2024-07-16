import {
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext
} from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'
import {
  CloseButton,
  TextArea,
  TextFieldRoot,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  Context,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components'
import { positionComments, removeHighlight, toggleActiveComment } from '@renderer/utils/libs'
import { TComment, TRubricCriterion } from '@shared/types'
import { SolidMarkdown } from 'solid-markdown'
import '../assets/Comment.css'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

declare module 'solid-js' {
  namespace JSX {
    interface CustomEvents {
      // on:Name
      click: PointerEvent
      keydown: KeyboardEvent
    }
  }
}

type CommentProps = {
  isOnlyComment: boolean
  comment: TComment
  currentId: string | undefined
  setCommentStore: SetStoreFunction<{
    commentCount: number
    comments: TComment[]
  }>
  rubric: TRubricCriterion[]
  basicTypes: { name: string; label: string; colour: string }[]
}

export const Comment: Component<CommentProps> = (props) => {
  const { comment, setCommentStore, rubric } = props
  const { setCurrentId } = useContext(Context)!
  const [content, setContent] = createSignal(comment.content)
  const [commentType, setCommentType] = createSignal(comment.type)
  const [isHovered, setIsHovered] = createSignal(false)
  const [suggestionMenu, setSuggestionMenu] = createSignal(false)

  let commentRef!: HTMLDivElement

  const isActive = () => props.currentId === comment.id
  const placeholderText = () =>
    props.isOnlyComment
      ? `Comments **support** _markdown_ and $maths$.

Use two new lines to insert new paragraph.
      
Type @ at the beginning of a comment for comment type dropdown menu.
      
You can also type the label of comment category (good, attn, prob) or rubric criterion (c1, c2, ...) at the beginning to set comment type.`
      : ''
  const autoResize = () => !(props.isOnlyComment && !content().length)
  const criterion = () => props.basicTypes.concat(rubric).find((c) => c.label === commentType())
  createEffect(() => {
    if (props.currentId !== comment.id) return
    const textArea = commentRef.querySelector('textarea')!
    textArea.focus()
    textArea.addEventListener('blur', (e) => {
      const relatedTarget = e.relatedTarget
      if (suggestionMenu()) return
      if (relatedTarget && (relatedTarget as HTMLElement).dataset.id === comment.id) {
        textArea.focus()
        return
      }
      finaliseComment()
    })
  })
  createEffect(() =>
    setCommentStore('comments', (com) => com.id === comment.id, 'type', commentType())
  )
  const setCommentAndHighlightType = (type: string) => {
    setCommentType(type)
    document.querySelectorAll(`.gradr-hl[data-id='${comment.id}']`).forEach((highlight) => {
      const hl = highlight as HTMLElement
      hl.className = `gradr-hl gradr-crit-${type}`
    })
    positionComments()
  }
  const validateComment = (content: string) => {
    for (let c of props.basicTypes.concat(rubric)) {
      if (content.startsWith(`${c.label}`)) {
        const regex = new RegExp(`^${c.label}`)
        content = content.replace(regex, '')
        setCommentAndHighlightType(c.label)
        break
      }
    }
    setSuggestionMenu(content.startsWith('@'))
    setContent(content)
  }
  const removeComment = async () => {
    await setCurrentId()
    removeHighlight(comment.id)
    setCommentStore('comments', (com) => com.filter((c) => c.id !== comment.id))
  }

  const finaliseComment = () => {
    const thisContent = content().trim()
    if (!thisContent.length) {
      removeComment()
      return
    }
    setCurrentId()
    setContent(thisContent)
    setCommentStore('comments', (com) => com.id === comment.id, {
      content: thisContent,
      type: commentType()
    })
    positionComments()
  }
  const handleCriterionSelect = (crit?: string) => {
    if (crit) setCommentAndHighlightType(crit)
    setContent((prev) => prev.replace(/^@/, ''))
  }
  const handleMenuClose = (close: boolean) => {
    focusOnTextArea()
    setSuggestionMenu(close)
  }
  const focusOnTextArea = () => {
    const textArea = commentRef.querySelector('textarea')!
    textArea.focus()
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
        'gradr-comment absolute w-full bg-white shadow-sm border-[3px] rounded-[5px] rounded-tl-none  border-transparent ' +
        (isHovered() ? ' z-[1000] ' : '') +
        (isActive() ? ' bg-slate-200 z-[1000] ' : '') +
        'gradr-crit-' +
        commentType()
      }
      data-id={comment.id}
      onClick={() => {
        setCurrentId(comment.id)
      }}
      onpointerenter={() => {
        setIsHovered(true)
        toggleActiveComment(comment.id)
        positionComments()
      }}
      onpointerleave={() => {
        setIsHovered(false)
        toggleActiveComment(comment.id, true)
        positionComments()
      }}
      on:keydown={(e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          e.preventDefault()
          setCurrentId(comment.id)
        }
      }}
    >
      <div class="relative">
        <Show when={commentType() !== 'cmnt'}>
          <div
            class={
              ' text-white text-xs font-semibold ' +
              (criterion() ? ` p-1 gradr-comment-header ` : '')
            }
          >
            {criterion()?.name}
          </div>
        </Show>
        <div class="p-1">
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
            <TextFieldRoot value={content()} onChange={validateComment} class="w-full max-w-xs">
              <TextArea
                autoResize={autoResize()}
                class={
                  'resize-none rounded-none border-none bg-white focus-visible:ring-0 shadow-none ' +
                  (autoResize() ? '' : ' min-h-[440px] ')
                }
                placeholder={placeholderText()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) finaliseComment()
                  if (e.key === 'Delete') removeComment()
                }}
              />
            </TextFieldRoot>
            <DropdownMenu open={suggestionMenu()} onOpenChange={handleMenuClose} modal={false}>
              <DropdownMenuTrigger
                aria-hidden
                class="absolute top-8 left-3 invisible"
              ></DropdownMenuTrigger>
              <DropdownMenuContent
                class="z-[2000] p-0 rounded-none focus-visible:ring-0"
                onPointerDownOutside={() => handleCriterionSelect()}
                onEscapeKeyDown={() => handleCriterionSelect()}
              >
                <For each={props.basicTypes.filter((t) => t.label !== 'cmnt').concat(rubric)}>
                  {(crit) => (
                    <DropdownMenuItem
                      class="text-sm p-1 rounded-none bg-slate-50 text-background"
                      onSelect={() => handleCriterionSelect(crit.label)}
                    >
                      {crit.name}
                    </DropdownMenuItem>
                  )}
                </For>
              </DropdownMenuContent>
            </DropdownMenu>
          </Show>
          <CloseButton
            onclick={removeComment}
            size={20}
            class="gradr-delete-comment absolute top-0 right-0"
            fill="red"
          />
        </div>
        <Show when={isActive() || isHovered()}>
          <div class="flex justify-between gap-2 p-1">
            <div class="flex gap-1">
              <For each={props.basicTypes.filter((t) => t.label !== 'cmnt')}>
                {(type) => (
                  <Tooltip>
                    <TooltipTrigger>
                      <button
                        data-id={comment.id} // needed to return focus to textarea  when clicked (line 89 above)
                        on:click={(e) => {
                          e.stopPropagation()
                          setCommentAndHighlightType(
                            commentType() === type.label ? 'cmnt' : type.label
                          )
                        }}
                        class="h-4 w-4 rounded-full"
                        style={{ 'background-color': `rgb(${type.colour})` }}
                      ></button>
                    </TooltipTrigger>
                    <TooltipContent class="shadow-sm shadow-slate-500 z-[1000]">
                      <p class="p-0">{type.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </For>
            </div>
            <div class="flex gap-1">
              <For each={rubric}>
                {(crit) => (
                  <Tooltip>
                    <TooltipTrigger>
                      <button
                        data-id={comment.id} // needed to return focus to textarea  when clicked (line 89 above)
                        on:click={(e) => {
                          e.stopPropagation()
                          setCommentAndHighlightType(
                            commentType() === crit.label ? 'cmnt' : crit.label
                          )
                        }}
                        class="h-4 w-4 rounded-full"
                        style={{ 'background-color': `rgb(${crit.colour})` }}
                      ></button>
                    </TooltipTrigger>
                    <TooltipContent class="shadow-sm shadow-slate-500 z-[1000]">
                      <p class="p-0">{crit.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}
