declare module '@uiw/vue-codemirror' {
  import type { Component } from 'vue'
  import type { Extension } from '@codemirror/state'

  interface CodeMirrorOptions {
    theme?: Extension
    basicSetup?: {
      lineNumbers?: boolean
      foldGutter?: boolean
      highlightActiveLine?: boolean
      dropCursor?: boolean
      allowMultipleSelections?: boolean
      indentOnInput?: boolean
    }
    extensions?: Extension[]
  }

  export const Codemirror: Component<{
    modelValue?: string
    options?: CodeMirrorOptions
    style?: Record<string, string>
    placeholder?: string
    onChange?: (value: string) => void
  }>
}
