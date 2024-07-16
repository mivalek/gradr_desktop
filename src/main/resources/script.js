addEventListener('DOMContentLoaded', () => {
  function gpos() {
    const hls = document.querySelectorAll('.gradr-hl')
    const ids = [...new Set([...hls].map((hl) => hl.dataset.id))]
    ids.forEach((id, i) => {
      const hl = document.querySelector(`.gradr-hl[data-id='${id}']`)
      const comment = document.querySelector(`.gradr-comment[data-id='${id}']`)
      if (!comment) return
      const scrollTop = document.querySelector('html').scrollTop
      const defaultTop = hl.getBoundingClientRect().top + scrollTop
      if (i === 0) {
        comment.style.top = defaultTop + 'px'
        return
      }
      const prevComment = document.querySelector(`.gradr-comment[data-id='${ids[i - 1]}']`)
      if (!prevComment) return
      const minTop = prevComment.offsetTop + prevComment.offsetHeight + 5
      comment.style.top = Math.max(defaultTop, minTop) + 'px'
    })
  }
  function gtog(id, deactivate = false) {
    const hls = document.querySelectorAll(`.gradr-hl[data-id='${id}']`)
    const comment = document.querySelector(`.gradr-comment[data-id='${id}']`)
    if (deactivate) {
      hls.forEach((hl) => hl.classList.remove('hovered'))
      comment?.classList.remove('hovered')
    } else {
      hls.forEach((hl) => hl.classList.add('hovered'))
      comment?.classList.add('hovered')
    }
  }
  document.querySelectorAll('.gradr-comment button, .gradr-grade a').forEach((button) => {
    button.addEventListener('pointerenter', (e) => {
      const scrollTop = document.querySelector('html').scrollTop
      const thisButton = e.target
      const crit = thisButton.dataset.crit
      const infoTop = thisButton.getBoundingClientRect().top
      const contentNode = document.querySelector(`.gradr-crit-tooltip[data-criterion="${crit}"]`)
      const ttip = contentNode.cloneNode(true)
      ttip.classList.add('active')
      document.body.appendChild(ttip)
      const ttipHeight = ttip.getBoundingClientRect().height
      ttip.style.top =
        (infoTop > ttipHeight + 5 ? infoTop - ttipHeight - 5 : infoTop + 20) + scrollTop + 'px'
    })
    button.addEventListener('pointerleave', () => {
      document.querySelector('.gradr-crit-tooltip.active').remove()
    })
  })
  document.querySelectorAll('.gradr-hl, .gradr-comment').forEach((e) => {
    const id = e.dataset.id
    e.addEventListener('pointerenter', () => gtog(id))
    e.addEventListener('pointerleave', () => gtog(id, true))
  })
  gpos()
  window.onresize = gpos
})
