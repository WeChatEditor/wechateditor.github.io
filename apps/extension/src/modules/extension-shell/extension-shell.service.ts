import {
  articleResponseSchema,
  internalResponseSchema,
  targetsSchema,
  transferNoticeSchema,
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
    host.style.cssText = 'position:fixed;right:18px;bottom:24px;z-index:2147483647'
    document.body.append(host)
  }
  const root = host.attachShadow({ mode: 'closed' })
  const style = document.createElement('style')
  style.textContent = `:host{font:14px/1.6 system-ui,sans-serif;color:#183141}*{box-sizing:border-box}section{width:${mode === 'popup' ? 360 : 258}px;padding:18px;background:#fff;border:1px solid #dce5eb;border-radius:12px;box-shadow:0 8px 28px #18314119}.brand{display:flex;align-items:center;gap:9px;margin-bottom:14px}.brand img{width:32px;height:32px;border-radius:8px}h1{font-size:16px;margin:0}p{margin:10px 0;overflow-wrap:anywhere}small{color:#637786}button,select{font:inherit;padding:8px 10px;border:1px solid #d6e0e7;border-radius:7px;background:#f5f8fa;color:#183141}button{display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}button svg{width:16px;height:16px;flex:none}button:disabled,select:disabled{opacity:.5;cursor:default}button:focus-visible,select:focus-visible{outline:2px solid #247267;outline-offset:2px}.error{color:#a3472b}.navigation{display:flex;gap:8px;margin-bottom:16px}.navigation button{flex:1;padding:6px 7px;font-size:12px;white-space:nowrap}.target-label{display:block;font-size:12px;color:#637786;margin-bottom:6px}.target-row{display:flex;align-items:center;gap:8px}.target-row select{flex:1;min-width:0;height:36px}.target-row button{width:36px;height:36px;padding:8px;flex:none}.capability{font-size:12px;color:#637786}.panel-button{width:100%;margin:12px 0;color:#fff;background:#247267;border-color:#247267}.hide{font-size:12px;margin-top:12px;padding:4px 10px}`
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
  const error = document.createElement('p')
  error.className = 'error'
  error.setAttribute('role', 'alert')
  let busy = false
  function button(
    label: string,
    action: () => Promise<void>,
    parent: HTMLElement | ShadowRoot = section,
    path?: string,
  ): HTMLButtonElement {
    const control = document.createElement('button')
    control.type = 'button'
    if (path) control.append(icon(path))
    control.append(document.createTextNode(label))
    control.addEventListener('click', async function clicked(event) {
      if (!event.isTrusted || busy) return
      busy = true
      control.disabled = true
      error.textContent = ''
      try {
        await action()
      } catch (failure) {
        error.textContent = failure instanceof Error ? failure.message : '操作失败，请重新打开插件'
      } finally {
        busy = false
        control.disabled = false
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
      ? `本次内容：${current.title}`
      : '在写作工作台点击“发送到公众号”，即可传入当前内容。'
  }
  if (mode === 'popup') {
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
    function pageActivity(event: Event): void {
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
    const panel = button('打开传稿面板', async function panel() {
      await send({ kind: 'OPEN_PANEL' })
    })
    panel.className = 'panel-button'
    const hide = button('收起', async function close() {
      section.hidden = true
      const show = button(
        '桀士传稿',
        async function reopen() {
          section.hidden = false
          show.remove()
        },
        root,
      )
    })
    hide.className = 'hide'
  }
  const hint = document.createElement('small')
  hint.textContent = '点击工作台发送后自动新建并插入；请在后台检查并手动保存。'
  section.append(hint, error)
  void loadArticle().catch(function unavailable(failure) {
    error.textContent = failure instanceof Error ? failure.message : '内容信息不可用'
  })
}
