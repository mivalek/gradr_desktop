import { type Component, For, Setter } from 'solid-js'

type FileExplorerProps = {
  dir: string | undefined
  files: string[]
  selectFile: Setter<string | undefined>
}
export const FileExplorer: Component<FileExplorerProps> = (props) => {
  return (
    <div id="file-explorer" class=" bg-accent w-full border-r ">
      <div class="text-center pb-2">
        <h2 class="font-semibold p-1">{props.dir?.replace(/^.*[//\\]/, '')}</h2>
      </div>
      <ul>
        <For each={props.files}>
          {(file) => (
            <li class="flex justify-between pb-0.5 cursor-pointer hover:bg-slate-600">
              <button class="pl-2 w-full text-left" onClick={() => props.selectFile(file)}>
                {file.replace(/\.html$/, '')}
              </button>
              <div class="flex">
                <div>x</div>
                <div>y</div>
              </div>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}
