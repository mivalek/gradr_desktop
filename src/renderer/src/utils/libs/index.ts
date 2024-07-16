import { Setter } from 'solid-js'

export function removeHighlight(id: string) {
  const searchTerm = `.gradr-hl[data-id='${id}']`
  const hlNodes = document.querySelectorAll(searchTerm)
  for (let el of hlNodes) {
    el?.replaceWith(...el.childNodes)
  }
}

// adapted from https://stackoverflow.com/questions/304837/javascript-user-selection-highlighting

export function highlightSelection(range: Range, uuid: string, setId: Setter<string | undefined>) {
  const safeRanges = getSafeRanges(range)
  for (let i = 0; i < safeRanges.length; i++) {
    highlightRange(safeRanges[i], uuid, setId)
  }
}

function highlightRange(range, id: string, setId: Setter<string | undefined>) {
  const newNode = document.createElement('span')
  newNode.classList.add('gradr-hl', 'gradr-crit-cmnt')
  newNode.dataset.id = id
  newNode.addEventListener('click', (e) => {
    e.stopPropagation()
    setId(id)
  })
  newNode.addEventListener('pointerover', () => {
    toggleActiveComment(id)
  })
  newNode.addEventListener('pointerout', () => {
    toggleActiveComment(id, true)
  })
  range.surroundContents(newNode)
}

function getSafeRanges(dangerous) {
  const a = dangerous.commonAncestorContainer
  // Starts -- Work inward from the start, selecting the largest safe range
  const s = new Array(0),
    rs = new Array(0)
  if (dangerous.startContainer != a) {
    for (let i = dangerous.startContainer; i != a; i = i.parentNode) {
      s.push(i)
    }
  }
  if (s.length > 0) {
    for (let i = 0; i < s.length; i++) {
      const xs = document.createRange()
      if (i) {
        xs.setStartAfter(s[i - 1])
        xs.setEndAfter(s[i].lastChild)
      } else {
        xs.setStart(s[i], dangerous.startOffset)
        xs.setEndAfter(s[i].nodeType == Node.TEXT_NODE ? s[i] : s[i].lastChild)
      }
      rs.push(xs)
    }
  }

  // Ends -- basically the same code reversed
  const e = new Array(0),
    re = new Array(0)
  if (dangerous.endContainer != a) {
    for (let i = dangerous.endContainer; i != a; i = i.parentNode) {
      e.push(i)
    }
  }
  if (e.length > 0) {
    for (let i = 0; i < e.length; i++) {
      const xe = document.createRange()
      if (i) {
        xe.setStartBefore(e[i].firstChild)
        xe.setEndBefore(e[i - 1])
      } else {
        xe.setStartBefore(e[i].nodeType == Node.TEXT_NODE ? e[i] : e[i].firstChild)
        xe.setEnd(e[i], dangerous.endOffset)
      }
      re.unshift(xe)
    }
  }

  // Middle -- the uncaptured middle
  let xm: Range
  if (s.length > 0 && e.length > 0) {
    xm = document.createRange()
    xm.setStartAfter(s[s.length - 1])
    xm.setEndBefore(e[e.length - 1])
  } else {
    return [dangerous]
  }

  // Concat
  rs.push(xm)
  const response = rs.concat(re)

  // Send to Console
  return response
}

export function positionComments() {
  const hls = document.querySelectorAll('.gradr-hl') as NodeListOf<HTMLElement>
  const ids = [...new Set([...hls].map((hl) => hl.dataset.id))]
  ids.forEach((id, i) => {
    const hl = document.querySelector(`.gradr-hl[data-id='${id}']`) as HTMLElement
    const comment = document.querySelector(
      `#comments-container .gradr-comment[data-id='${id}']`
    ) as HTMLDivElement | null
    if (!comment) return
    const scrollTop = document.getElementById('main-panel')!.scrollTop
    const defaultTop = hl.getBoundingClientRect().top + scrollTop - 60
    if (i === 0) {
      comment.style.top = defaultTop + 'px'
      return
    }
    const prevComment = document.querySelector(
      `#comments-container .gradr-comment[data-id='${ids[i - 1]}']`
    ) as HTMLDivElement | null
    if (!prevComment) return
    const minTop = prevComment.offsetTop + prevComment.offsetHeight + 5
    comment.style.top = Math.max(defaultTop, minTop) + 'px'
  })
}

export const toggleActiveComment = (id: string, deactivate: boolean = false) => {
  const hls = document.querySelectorAll(`.gradr-hl[data-id='${id}']`)
  const comment = document.querySelector(
    `#comments-container .gradr-comment[data-id='${id}']`
  ) as HTMLDivElement | null
  if (deactivate) {
    hls.forEach((hl) => hl.classList.remove('hovered'))
    comment?.classList.remove('hovered')
  } else {
    hls.forEach((hl) => hl.classList.add('hovered'))
    comment?.classList.add('hovered')
  }
}

const setCursorEditable = (editableElem: HTMLDivElement, position: number) => {
  const range = document.createRange()
  const sel = window.getSelection()!
  range.setStart(editableElem.childNodes[0], position)
  range.collapse(true)

  sel.removeAllRanges()
  sel.addRange(range)
  editableElem.focus()
}

export const moveCaretToEnd = (element: HTMLDivElement) => {
  const contentLength = element.innerText.length
  setCursorEditable(element, contentLength)
}
