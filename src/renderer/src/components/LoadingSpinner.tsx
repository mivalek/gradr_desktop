import { Component } from 'solid-js'
import '../assets/loader.css'
export const LoadingSpinner: Component = () => {
  return (
    <div class="flex h-full items-center justify-center col-span-2">
      <span class="loader"></span>
    </div>
  )
}
