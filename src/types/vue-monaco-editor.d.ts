declare module '@guolao/vue-monaco-editor' {
    import type { DefineComponent } from 'vue'
    
    const MonacoEditor: DefineComponent<{
        value?: string
        modelValue?: string
        options?: {
            language?: string
            theme?: string
            automaticLayout?: boolean
            minimap?: {
                enabled?: boolean
            }
            formatOnPaste?: boolean
            formatOnType?: boolean
            [key: string]: any
        }
        'onUpdate:modelValue'?: (value: string) => void
    }>

    export default MonacoEditor
}
