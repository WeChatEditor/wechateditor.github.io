import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  { ignores: ['**/node_modules/**', '**/dist/**', '.generated/**', 'templates/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        require: 'readonly',
        module: 'readonly',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
  {
    files: ['apps/frontend/src/**/*.{ts,vue}'],
    languageOptions: {
      globals: Object.fromEntries(
        [
          'window',
          'Event',
          'CompositionEvent',
          'KeyboardEvent',
          'MouseEvent',
          'HTMLInputElement',
          'TextDecoder',
          'BeforeUnloadEvent',
          'document',
          'navigator',
          'localStorage',
          'indexedDB',
          'crypto',
          'Blob',
          'File',
          'FileReader',
          'Image',
          'HTMLElement',
          'Element',
          'Node',
          'NodeFilter',
          'Range',
          'ResizeObserver',
          'PointerEvent',
          'BroadcastChannel',
          'ClipboardItem',
          'HTMLTextAreaElement',
          'HTMLImageElement',
          'HTMLCanvasElement',
          'HTMLTableElement',
          'DOMParser',
          'performance',
          'requestAnimationFrame',
          'cancelAnimationFrame',
          'atob',
          'btoa',
        ].map(function browserGlobal(name) {
          return [name, 'readonly']
        }),
      ),
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser },
      globals: {
        window: 'readonly',
        HTMLElement: 'readonly',
        ResizeObserver: 'readonly',
        MediaQueryList: 'readonly',
      },
    },
  },
  {
    files: ['**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
]
