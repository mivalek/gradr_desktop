import { Component, For, Show, createEffect, createSignal, useContext } from 'solid-js'
import { Context, GradeInput, TextFieldRoot, TextArea } from '@/components'
import { SolidMarkdown } from 'solid-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { TGrades } from '@shared/types'

type TGradingAreaProps = { show: boolean }
export const GradingArea: Component<TGradingAreaProps> = (props) => {
  const { configStore, markFileAsDone, resource, gradeStore, setGradeStore, grades } =
    useContext(Context)!
  const [generalComments, setGeneralComments] = createSignal('')
  const [isActive, setIsActive] = createSignal(true)
  const finalGrade = (): number | undefined => calculateFinalGrade(grades())
  let textAreaRef!: HTMLTextAreaElement
  let ghostRef!: HTMLDivElement
  createEffect(() => {
    if (resource.state !== 'ready') return
    const marks = resource()!.marks
    if (Object.values(marks).length === 0) {
      configStore.rubric.criteria.forEach((c) => (marks[c.name] = null))
    }
    const total = calculateFinalGrade(resource()!.marks)
    const generalComments = resource()!.generalComments
    setGradeStore({ grades: marks, generalComments, isGraded: total !== undefined })
    setGeneralComments(generalComments)
    if (generalComments !== '') {
      setIsActive(false)
    }
    // nesting avoids multiple renders
    createEffect(() => markFileAsDone('graded', gradeStore.isGraded))
  })
  createEffect(() => {
    setGradeStore('isGraded', finalGrade() !== undefined)
  })
  createEffect(() => {
    if (!isActive()) return
    ghostRef.style.width = Math.ceil(textAreaRef.getBoundingClientRect().width) + 'px'
    ghostRef.innerHTML = `${generalComments().replaceAll('\n', '<br>')}<br>x`
    textAreaRef.style.maxHeight = ghostRef.clientHeight + 'px'
  })
  const calculateFinalGrade = (grades: TGrades): number | undefined => {
    const gradesArray = Object.values(grades)
    if (!gradesArray.length) return undefined
    const rubricCriteria = configStore.rubric.criteria
    const nCrit = rubricCriteria.length
    if (gradesArray.includes(null) || gradesArray.length < nCrit) return undefined

    let sum = 0
    if (rubricCriteria.every((c) => c.weight === 0)) {
      rubricCriteria.forEach((c) => (sum += grades[c.name]!))
      sum /= nCrit
    } else {
      rubricCriteria.forEach((c) => (sum += grades[c.name]! * (c.weight / 100)))
    }
    return Math.round(sum)
  }

  return (
    <div class={(props.show ? '' : 'hidden ') + ' w-min p-2 flex flex-col h-full min-h-0 gap-2'}>
      <div class="flex flex-col w-full flex-nowrap gap-2">
        <h2 class="text-lg font-semibold pt-0">Marks</h2>
        <For each={configStore.rubric.criteria}>
          {(criterion) => (
            <GradeInput
              crit={criterion}
              grade={grades()![criterion.name]}
              setGradeStore={setGradeStore}
            />
          )}
        </For>
        <div class="flex flex-nowrap self-end">
          {finalGrade() === undefined ? '-' : finalGrade()}/100
        </div>
      </div>
      <h2 class="text-lg font-semibold">General comments</h2>
      <div
        id="rendered-markdown"
        tabindex="0"
        onFocusIn={() => {
          setIsActive(true)
          textAreaRef.focus()
        }}
        class={
          'w-full min-w-56 max-h-full min-h-40 bg-slate-200 rounded-md text-secondary py-[3px] px-0.5 text-sm ' +
          (isActive() ? ' hidden ' : '')
        }
      >
        <SolidMarkdown
          remarkPlugins={[remarkMath]}
          // @ts-ignore: no types for rehypeKatex
          rehypePlugins={[rehypeKatex]}
          class="gradr-rendered-markdown py-0.5 px-[7px] h-full overflow-auto"
          children={generalComments()}
        />
      </div>
      <TextFieldRoot
        value={generalComments()}
        onChange={setGeneralComments}
        class={'grow' + (isActive() ? '' : ' hidden ')}
      >
        <TextArea
          ref={textAreaRef}
          autofocus={true}
          onFocusOut={() => {
            setGradeStore('generalComments', generalComments())
            setIsActive(false)
          }}
          placeholder="You _can_ use **markdown**"
          class="w-full min-w-56 h-full grow bg-slate-200 resize-none min-h-40 text-secondary py-1 px-2 focus:outline-none focus:ring-2 focus:ring-slate-400 "
        />
      </TextFieldRoot>
      <div
        ref={ghostRef}
        aria-hidden="true"
        class="absolute text-sm left-[10000px] h-fit py-0 px-2 "
      />
      <div id="gradr-grades-export" class="hidden">
        <div class="gradr-container">
          <Show when={generalComments() !== ''}>
            <div id="gradr-general-comments">
              <h2>Feedback</h2>
              <SolidMarkdown
                remarkPlugins={[remarkMath]}
                // @ts-ignore: no types for rehypeKatex
                rehypePlugins={[rehypeKatex]}
                class="gradr-rendered-markdown p-0.5"
                children={generalComments()}
              />
            </div>
          </Show>
          <Show when={finalGrade() !== undefined}>
            <div id="gradr-grades-container">
              <div id="gradr-overall-grade" aria-label="your final grade">
                {finalGrade()}
              </div>
              <div id="gradr-partial-grades">
                <For each={configStore.rubric.criteria}>
                  {(criterion) => (
                    <div
                      class="gradr-grade"
                      style={{
                        background: `rgb(${criterion.colour})`,
                        'border-color': `rgb(${criterion.colour})`
                      }}
                    >
                      <div class="gradr-crit-name">
                        {criterion.name}
                        <Show when={criterion.weight !== 0}>
                          <span>({criterion.weight}%)</span>
                        </Show>
                        <a data-crit={criterion.label}>?</a>
                      </div>
                      <div class="gradr-crit-mark">{grades()[criterion.name]}</div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}
