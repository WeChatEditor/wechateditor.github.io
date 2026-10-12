import {
  articleResponseSchema,
  connectionInfoSchema,
  clipboardResponseSchema,
  internalResponseSchema,
  nativeTitleEditAttribute,
  targetsSchema,
  transferNoticeSchema,
  validateTextHtml,
  type InternalRequest,
} from '@jlab-wechat-editor/wechat-transfer-contract'

async function send(request: InternalRequest): Promise<unknown> {
  const response = internalResponseSchema.parse(await chrome.runtime.sendMessage(request))
  if (response.status !== 0) throw new Error(response.err || '插件操作失败')
  return response.data
}
function icon(path: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '1.7')
  svg.setAttribute('aria-hidden', 'true')
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  shape.setAttribute('d', path)
  svg.append(shape)
  return svg
}
export function mountTransferShell(mode: 'popup' | 'content'): void {
  const host =
    mode === 'popup'
      ? document.querySelector<HTMLElement>('#app')!
      : document.createElement('aside')
  if (mode === 'content') {
    host.style.cssText =
      'position:fixed;right:18px;bottom:24px;max-width:calc(100vw - 24px);z-index:2147483647'
    document.body.append(host)
  }
  const root = host.attachShadow({ mode: 'closed' })
  const style = document.createElement('style')
  style.textContent = `
    :host{font:14px/1.6 system-ui,sans-serif;color:#183141;color-scheme:light}
    *{box-sizing:border-box} [hidden]{display:none!important}
    section{width:${mode === 'popup' ? 360 : 320}px;max-width:${mode === 'popup' ? 'none' : 'calc(100vw - 24px)'};max-height:${mode === 'popup' ? '560px' : 'calc(100vh - 24px)'};overflow:auto;padding:16px;background:#fff;border:1px solid #dce5eb;border-radius:12px;box-shadow:0 8px 28px #18314119}
    .brand{display:flex;align-items:center;gap:8px;margin-bottom:14px;min-width:0}
    .brand img{width:28px;height:28px;border-radius:7px;flex:none}
    h1{font-size:14px;line-height:1.5;margin:0;overflow-wrap:anywhere}
    .drag-handle{cursor:grab;touch-action:none;user-select:none;border-radius:5px}
    .drag-handle.dragging{cursor:grabbing}.drag-handle:focus-visible{outline:2px solid #2563eb;outline-offset:4px}
    .drag-handle h1{flex:1;min-width:0}.drag-hint{font-size:12px;color:#81919d;flex:none}
    p{font-size:13px;margin:12px 0;overflow-wrap:anywhere}
    small{display:block;font-size:12px;line-height:1.7;color:#637786}
    button,select{font:inherit;line-height:1.4;padding:8px 10px;border:1px solid #d6e0e7;border-radius:7px;background:#f5f8fa;color:#183141;min-width:0}
    button{display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;overflow-wrap:anywhere}
    button svg{width:16px;height:16px;flex:none}
    button:disabled,select:disabled{opacity:.5;cursor:default}
    button:focus-visible,select:focus-visible{outline:2px solid #2563eb;outline-offset:2px}
    .error{color:#a3472b;font-size:12px;margin-bottom:0}.error:empty{display:none}
    .navigation{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:14px}
    .navigation button{padding:8px 6px;font-size:12px;white-space:normal}
    .target-label{display:block;font-size:12px;color:#637786;margin-bottom:6px}
    .target-row{display:flex;align-items:center;gap:8px}.target-row select{flex:1;min-width:0;height:36px}
    .target-row button{width:36px;height:36px;padding:8px;flex:none}
    .capability{font-size:12px;color:#637786}
    .panel-button{width:100%;margin:14px 0 10px;color:#fff;background:#2563eb;border-color:#2563eb;font-size:13px}
    .panel-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px}
    .connection{font-size:11px;line-height:1.5;color:#637786}.hide{font-size:12px;padding:5px 9px;flex:none}
  `
  root.append(style)
  const section = document.createElement('section')
  root.append(section)
  const brand = document.createElement('div')
  brand.className = 'brand'
  const logo = document.createElement('img')
  logo.src = chrome.runtime.getURL('logo.png')
  logo.alt = ''
  const heading = document.createElement('h1')
  heading.textContent = '桀士排版·公众号助手'
  brand.append(logo, heading)
  section.append(brand)
  const navigation = document.createElement('div')
  navigation.className = 'navigation'
  section.append(navigation)
  const article = document.createElement('p')
  section.append(article)
  const feedback = document.createElement('p')
  feedback.setAttribute('role', 'status')
  feedback.style.cssText = 'color:#247267;font-size:12px'
  const error = document.createElement('p')
  error.className = 'error'
  error.setAttribute('role', 'alert')
  let busy = false
  function button(
    label: string,
    action: () => Promise<void>,
    parent: HTMLElement | ShadowRoot = section,
    path?: string,
    enabled: () => boolean = function always() {
      return true
    },
  ): HTMLButtonElement {
    const control = document.createElement('button')
    control.type = 'button'
    if (path) control.append(icon(path))
    control.append(document.createTextNode(label))
    control.addEventListener('click', async function clicked(event) {
      if (!event.isTrusted || busy || !enabled()) return
      busy = true
      control.disabled = true
      error.textContent = ''
      feedback.textContent = ''
      try {
        await action()
      } catch (failure) {
        error.textContent = failure instanceof Error ? failure.message : '操作失败，请重新打开插件'
      } finally {
        busy = false
        control.disabled = !enabled()
      }
    })
    parent.append(control)
    return control
  }
  button(
    '打开写作工作台',
    async function web() {
      await send({ kind: 'OPEN_WEB' })
    },
    navigation,
    'm12 3 8 8-8 10-8-10 8-8Zm0 0v10m-4 8h8',
  )
  button(
    '打开公众号后台',
    async function wechat() {
      await send({ kind: 'OPEN_WECHAT' })
    },
    navigation,
    'M3 4h18v13H3ZM8 21h8m-4-4v4',
  )
  async function loadArticle(): Promise<void> {
    const current = articleResponseSchema.parse(await send({ kind: 'ARTICLE' })).article
    article.textContent = current
      ? `已保存内容：${current.title}`
      : '写作工作台自动保存或点击“发送到公众号”后，即可在这里复制排版内容。'
  }
  if (mode === 'popup') {
    async function copyArticle(titleOnly = false): Promise<void> {
      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined')
        throw new Error('当前浏览器无法复制排版内容，请使用桌面Chrome重新打开插件面板')
      const snapshot = send({ kind: 'COPY_ARTICLE' }).then(function received(raw) {
        const current = clipboardResponseSchema.parse(raw).article
        if (!current)
          throw new Error('插件中暂无可复制内容，请在编辑器修改并等待自动保存，或点击发送文章')
        validateTextHtml(current.html)
        article.textContent = `已保存内容：${current.title}`
        return current
      })
      // Start the clipboard write during the click; both formats resolve from one snapshot.
      const formats: Record<string, Promise<Blob>> = {
        'text/plain': snapshot.then(function plain(current) {
          return new Blob([titleOnly ? current.title : current.plainText], { type: 'text/plain' })
        }),
      }
      if (!titleOnly)
        formats['text/html'] = snapshot.then(function html(current) {
          return new Blob([current.html], { type: 'text/html' })
        })
      for (const format of Object.values(formats)) void format.catch(function unavailable() {})
      try {
        await navigator.clipboard.write([new ClipboardItem(formats)])
      } catch (failure) {
        // Surface missing/invalid snapshots; clipboard permission failures have a user-facing hint.
        await snapshot
        throw new Error('复制未完成，请保持插件面板打开并再次点击复制；可检查浏览器剪贴板权限', {
          cause: failure,
        })
      }
      feedback.textContent = titleOnly
        ? '标题已复制，可粘贴到公众号标题栏。'
        : '排版内容已复制，可直接粘贴到公众号正文编辑区。'
    }
    const copyRow = document.createElement('div')
    copyRow.style.cssText = 'display:flex;gap:8px;margin:10px 0 12px'
    section.append(copyRow)
    const copy = button(
      '复制到公众号',
      async function copyBody() {
        await copyArticle()
      },
      copyRow,
      'M9 7h11v14H9ZM15 7V3H4v14h5',
    )
    copy.style.cssText = 'flex:1;color:#fff;background:#247267;border-color:#247267'
    button(
      '复制标题',
      async function copyTitle() {
        await copyArticle(true)
      },
      copyRow,
    )
    section.append(feedback)
    const label = document.createElement('label')
    label.className = 'target-label'
    label.htmlFor = 'wechat-account'
    label.textContent = '选择公众号'
    section.append(label)
    const row = document.createElement('div')
    row.className = 'target-row'
    const selector = document.createElement('select')
    selector.id = 'wechat-account'
    row.append(selector)
    section.append(row)
    const capability = document.createElement('p')
    capability.className = 'capability'
    section.append(capability)
    let targets: ReturnType<typeof targetsSchema.parse>['targets'] = []
    function describeTarget(): void {
      capability.textContent =
        targets.find(function selected(target) {
          return String(target.tabId) === selector.value
        })?.message || '登录公众号后，点击右侧刷新图标。'
    }
    async function loadTargets(): Promise<void> {
      selector.disabled = true
      try {
        const result = targetsSchema.parse(await send({ kind: 'TARGETS' }))
        targets = result.targets
        selector.replaceChildren()
        for (const target of targets) {
          const option = document.createElement('option')
          option.value = String(target.tabId)
          option.textContent = target.account || '未登录或未识别公众号'
          if (target.editor) option.textContent += '（请打开后台首页）'
          option.disabled = !target.account || target.editor
          selector.append(option)
        }
        if (result.selected) selector.value = String(result.selected.tabId)
        else {
          const placeholder = document.createElement('option')
          placeholder.value = ''
          placeholder.textContent = '请先登录公众号后台'
          selector.prepend(placeholder)
          selector.value = ''
        }
        describeTarget()
      } finally {
        selector.disabled = false
      }
    }
    const refresh = button(
      '',
      loadTargets,
      row,
      'M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.6-2L20 8M4 16l2.3 3A7 7 0 0 0 17.9 17',
    )
    refresh.title = '刷新公众号与页面能力'
    refresh.setAttribute('aria-label', '刷新公众号与页面能力')
    selector.addEventListener('change', async function selected(event) {
      if (!event.isTrusted || busy) return
      const target = targets.find(function matching(value) {
        return String(value.tabId) === selector.value
      })
      if (!target || !target.account || target.editor) return
      busy = true
      selector.disabled = true
      error.textContent = ''
      try {
        await send({ kind: 'SELECT_TARGET', tabId: target.tabId, account: target.account })
        describeTarget()
      } catch (failure) {
        error.textContent = failure instanceof Error ? failure.message : '公众号选择失败'
      } finally {
        busy = false
        selector.disabled = false
      }
    })
    void loadTargets().catch(function unavailable(failure) {
      error.textContent = failure instanceof Error ? failure.message : '无法读取公众号'
    })
  } else {
    brand.classList.add('drag-handle')
    brand.tabIndex = 0
    brand.setAttribute('role', 'group')
    brand.setAttribute('aria-label', '拖动传稿面板；方向键移动，Home恢复右下角')
    brand.title = '拖动面板 · 方向键移动 · Home恢复位置'
    const grip = document.createElement('span')
    grip.className = 'drag-hint'
    grip.textContent = '⠿'
    grip.setAttribute('aria-hidden', 'true')
    brand.append(grip)
    let drag: { pointerId: number; x: number; y: number; left: number; top: number } | undefined
    let positioned = false
    function position(left: number, top: number): void {
      const rect = host.getBoundingClientRect()
      const inset = 12
      const maxLeft = Math.max(inset, window.innerWidth - rect.width - inset)
      const maxTop = Math.max(inset, window.innerHeight - rect.height - inset)
      host.style.left = `${Math.max(inset, Math.min(maxLeft, left))}px`
      host.style.top = `${Math.max(inset, Math.min(maxTop, top))}px`
      host.style.right = 'auto'
      host.style.bottom = 'auto'
      positioned = true
    }
    function stopDrag(): void {
      const pointer = drag?.pointerId
      drag = undefined
      brand.classList.remove('dragging')
      if (pointer !== undefined && brand.hasPointerCapture(pointer))
        brand.releasePointerCapture(pointer)
    }
    brand.addEventListener('pointerdown', function startDrag(event) {
      if (!event.isTrusted || event.button !== 0) return
      event.preventDefault()
      const rect = host.getBoundingClientRect()
      drag = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left: rect.left,
        top: rect.top,
      }
      brand.setPointerCapture(event.pointerId)
      brand.classList.add('dragging')
      brand.focus({ preventScroll: true })
    })
    brand.addEventListener('pointermove', function move(event) {
      if (!drag || drag.pointerId !== event.pointerId) return
      position(drag.left + event.clientX - drag.x, drag.top + event.clientY - drag.y)
    })
    brand.addEventListener('pointerup', stopDrag)
    brand.addEventListener('pointercancel', stopDrag)
    brand.addEventListener('lostpointercapture', stopDrag)
    window.addEventListener('blur', stopDrag)
    brand.addEventListener('keydown', function moveWithKeyboard(event) {
      if (
        !event.isTrusted ||
        !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)
      )
        return
      event.preventDefault()
      stopDrag()
      const rect = host.getBoundingClientRect()
      const step = event.shiftKey ? 40 : 12
      position(
        event.key === 'Home'
          ? window.innerWidth - rect.width - 18
          : rect.left + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0),
        event.key === 'Home'
          ? window.innerHeight - rect.height - 24
          : rect.top + (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0),
      )
    })
    function keepVisible(): void {
      if (!positioned) return
      const rect = host.getBoundingClientRect()
      position(rect.left, rect.top)
    }
    window.addEventListener('resize', function resized() {
      stopDrag()
      keepVisible()
    })
    const observer = new ResizeObserver(keepVisible)
    observer.observe(host)
    function pageActivity(event: Event): void {
      const nativeTitle =
        event.type === 'input' && event.target instanceof Element
          ? event.target.closest(
              '#js_title_main .title-editor-overlay .title-editor__input > .ProseMirror[contenteditable="true"]',
            )
          : null
      if (nativeTitle?.getAttribute(nativeTitleEditAttribute) === 'active') return
      if (event.isTrusted && !event.composedPath().includes(host))
        void send({ kind: 'PAGE_ACTIVITY' }).catch(function ignore() {})
    }
    document.addEventListener('pointerdown', pageActivity, true)
    document.addEventListener('keydown', pageActivity, true)
    document.addEventListener('input', pageActivity, true)
    chrome.runtime.onMessage.addListener(function notice(raw: unknown, sender) {
      const parsed = transferNoticeSchema.safeParse(raw)
      if (sender.id === chrome.runtime.id && parsed.success) {
        error.textContent = parsed.data.message
      }
    })
    let connected = false
    const connection = document.createElement('span')
    connection.className = 'connection'
    connection.setAttribute('role', 'status')
    connection.textContent = '正在检测插件…'
    const panel = button(
      '打开传稿面板',
      async function panel() {
        try {
          await send({ kind: 'OPEN_PANEL' })
        } catch (failure) {
          connected = false
          connection.textContent = '插件未连接，请启用插件并刷新网页'
          throw failure
        }
      },
      section,
      undefined,
      function available() {
        return connected
      },
    )
    panel.className = 'panel-button'
    panel.disabled = true
    const footer = document.createElement('div')
    footer.className = 'panel-footer'
    footer.append(connection)
    section.append(footer)
    const hide = button(
      '收起',
      async function close() {
        stopDrag()
        section.hidden = true
        const show = button(
          '桀士传稿',
          async function reopen() {
            section.hidden = false
            show.remove()
          },
          root,
        )
      },
      footer,
    )
    hide.className = 'hide'
    void send({ kind: 'PING' })
      .then(function detected(raw) {
        connectionInfoSchema.parse(raw)
        connected = true
        connection.textContent = '插件已连接 · 拖动标题可移动'
        panel.disabled = false
        panel.title = '打开插件传稿面板'
      })
      .catch(function unavailable() {
        connected = false
        panel.disabled = true
        panel.title = '请先安装或启用传稿插件，并刷新网页'
        connection.textContent = '插件未连接，请启用插件并刷新网页'
      })
  }
  const hint = document.createElement('small')
  hint.textContent = '发送后尝试自动插入；未完成时可直接在插件面板复制。请在后台检查并手动保存。'
  section.append(hint, error)
  void loadArticle().catch(function unavailable(failure) {
    error.textContent = failure instanceof Error ? failure.message : '内容信息不可用'
  })
}
