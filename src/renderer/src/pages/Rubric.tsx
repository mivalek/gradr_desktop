import { Button } from '@renderer/components'
import { Component } from 'solid-js'

export const Rubric: Component = () => {
  return (
    <div class="h-full w-full">
      <Button onClick={() => window.close()}>Cancel</Button>
    </div>
  )
}
