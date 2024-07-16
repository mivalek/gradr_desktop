import { type Component } from 'solid-js'
import { FileExplorer, Layout, MainPanel, GradingPanel, ContextProvider } from '@/components'

// import '../../public/katex/dist/katex.min.js'
// import '../../public/katex/dist/contrib/auto-render.min.js'
// import '../../public/katex/dist/katex.min.css'

// import css from '/katex/dist/katex.min.css?url'
export const Home: Component = () => {
  return (
    <Layout>
      {/* <div>{css}</div> */}
      <ContextProvider>
        <FileExplorer />
        <MainPanel />
        <GradingPanel />
      </ContextProvider>
    </Layout>
  )
}
