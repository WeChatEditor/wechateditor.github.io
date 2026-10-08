import { onBeforeUnmount, watch, type Ref } from 'vue'

export function useScrollSync(
  enabled: Ref<boolean>,
  getEditor: () => HTMLElement | undefined,
  getPreview: () => HTMLElement | undefined,
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
    const sourceRange = source.scrollHeight - source.clientHeight
    const progress = sourceRange > 0 ? Math.max(0, Math.min(1, source.scrollTop / sourceRange)) : 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let previousTime: number | undefined

    function advance(time: number): void {
      frame = undefined
      if (!enabled.value || !target.isConnected) {
        return
      }
      const destination = progress * Math.max(0, target.scrollHeight - target.clientHeight)
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
