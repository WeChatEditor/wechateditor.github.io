import { onBeforeUnmount, watch, type Ref } from 'vue'

export function useScrollSync(
  enabled: Ref<boolean>,
  getEditor: () => HTMLElement | undefined,
  getPreview: () => HTMLElement | undefined,
  getPreviewAnchors: () => { line: number; top: number }[],
  getEditorAnchors: (lines: number[]) => { line: number; top: number }[],
) {
  let frame: number | undefined
  let written = new WeakMap<HTMLElement, number>()

  function cancel(): void {
    if (frame !== undefined) {
      cancelAnimationFrame(frame)
      frame = undefined
    }
  }

  function follow(source: HTMLElement, target: HTMLElement): void {
    cancel()
    const editor = getEditor()
    const preview = getPreview()
    if (!editor || !preview) {
      return
    }
    const editorRange = Math.max(0, editor.scrollHeight - editor.clientHeight)
    const previewRange = Math.max(0, preview.scrollHeight - preview.clientHeight)
    const previewAnchors = getPreviewAnchors().sort((a, b) => a.line - b.line)
    const editorTops = new Map(
      getEditorAnchors(previewAnchors.map((a) => a.line)).map((a) => [a.line, a.top]),
    )
    const pairs = [{ editor: 0, preview: 0 }]
    for (const anchor of previewAnchors) {
      const top = editorTops.get(anchor.line)
      const previous = pairs[pairs.length - 1]
      if (
        top !== undefined &&
        top > previous.editor &&
        anchor.top > previous.preview &&
        top < editorRange &&
        anchor.top < previewRange
      ) {
        pairs.push({ editor: top, preview: anchor.top })
      }
    }
    pairs.push({ editor: editorRange, preview: previewRange })
    const from = source === editor ? 'editor' : 'preview'
    const to = source === editor ? 'preview' : 'editor'
    const position = Math.max(0, Math.min(pairs[pairs.length - 1][from], source.scrollTop))
    const index = pairs.findIndex((pair, index) => index > 0 && pair[from] >= position)
    const lower = pairs[Math.max(0, index - 1)]
    const upper = pairs[index < 0 ? pairs.length - 1 : index]
    const span = upper[from] - lower[from]
    const destination =
      editorRange === 0 || previewRange === 0
        ? 0
        : lower[to] + (span > 0 ? (position - lower[from]) / span : 0) * (upper[to] - lower[to])
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let previousTime: number | undefined

    function advance(time: number): void {
      frame = undefined
      if (!enabled.value || !target.isConnected) {
        return
      }
      const distance = destination - target.scrollTop
      const elapsed = previousTime === undefined ? 16 : Math.min(64, time - previousTime)
      previousTime = time
      const previousTop = target.scrollTop
      target.scrollTop =
        reducedMotion || Math.abs(distance) <= 2
          ? destination
          : target.scrollTop + distance * (1 - Math.exp(-elapsed / 45))
      if (target.scrollTop === previousTop || Math.abs(destination - target.scrollTop) <= 1) {
        target.scrollTop = destination
      }
      written.set(target, target.scrollTop)
      if (Math.abs(destination - target.scrollTop) > 1) {
        frame = requestAnimationFrame(advance)
      }
    }

    frame = requestAnimationFrame(advance)
  }

  function scrolled(source: HTMLElement): void {
    if (!enabled.value) {
      return
    }
    const expected = written.get(source)
    if (expected !== undefined && Math.abs(source.scrollTop - expected) <= 1) {
      return
    }
    written.delete(source)
    const editor = getEditor()
    const preview = getPreview()
    const target = source === editor ? preview : source === preview ? editor : undefined
    if (target) {
      follow(source, target)
    }
  }

  function align(): void {
    const editor = getEditor()
    const preview = getPreview()
    if (enabled.value && editor && preview) {
      follow(editor, preview)
    }
  }

  watch(
    enabled,
    function toggle() {
      cancel()
      written = new WeakMap()
      align()
    },
    { flush: 'post' },
  )
  onBeforeUnmount(cancel)

  return { scrolled, align }
}
