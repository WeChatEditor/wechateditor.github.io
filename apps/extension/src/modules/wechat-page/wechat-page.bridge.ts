import type { PageCommand, PageResult } from './wechat-page.model'

// Serialized by chrome.scripting: keep all runtime dependencies inside this function.
export async function editorBridge(command: PageCommand): Promise<PageResult> {
  const failed = {
    account: '',
    ready: false,
    editor: false,
    empty: false,
    titleSupported: false,
    message: '无法识别公众号页面来源或所在文档，请在公众号后台顶层页面检查能力',
  }
  if (location.origin !== 'https://mp.weixin.qq.com' || window.top !== window) return failed
  function visible(element: Element): boolean {
    return element.getClientRects().length > 0
  }
  function accountName(): string {
    const names = [
      ...document.querySelectorAll(
        '.weui-desktop_name, .acount_box-nickname, .weui-desktop-account__nickname, .account_nickname, #account_nickname',
      ),
    ]
      .filter(visible)
      .map(function name(element) {
        return element.textContent?.trim() || ''
      })
      .filter(Boolean)
    const unique = [...new Set(names)]
    return unique.length === 1 ? unique[0] : ''
  }
  function titleInput(): HTMLInputElement | HTMLTextAreaElement | undefined {
    const inputs = [
      ...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input[name="title"], textarea[name="title"], input#title, textarea#title, #js_title, input[placeholder="请在这里输入标题"], textarea[placeholder="请在这里输入标题"]',
      ),
    ].filter(function editable(input) {
      return (
        (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) &&
        visible(input) &&
        !input.disabled &&
        !input.readOnly
      )
    })
    return inputs.length === 1 ? inputs[0] : undefined
  }
  function text(html: string): string {
    const dom = new DOMParser().parseFromString(html, 'text/html')
    return (dom.body.textContent || '').replace(/[\s\u200b\ufeff]+/g, '')
  }
  function emptyBody(html: string): boolean {
    const dom = new DOMParser().parseFromString(html, 'text/html')
    return !text(html) && !dom.querySelector('img,video,audio,iframe,svg,object,embed')
  }
  const api = (
    window as unknown as {
      __MP_Editor_JSAPI__?: {
        invoke: (request: {
          apiName: string
          apiParam?: { content: string }
          sucCb: (result: unknown) => void
          errCb: (error: unknown) => void
        }) => void
      }
    }
  ).__MP_Editor_JSAPI__
  async function invoke(name: string, content?: string): Promise<unknown> {
    if (!api || typeof api.invoke !== 'function') throw new Error('官方编辑接口尚未就绪')
    return new Promise(function call(resolve, reject) {
      const timeout = setTimeout(function late() {
        reject(new Error('编辑接口超时'))
      }, 10000)
      api.invoke({
        apiName: name,
        ...(content === undefined ? {} : { apiParam: { content } }),
        sucCb: function success(result) {
          clearTimeout(timeout)
          resolve(result)
        },
        errCb: function failure() {
          clearTimeout(timeout)
          reject(new Error('官方编辑接口拒绝操作'))
        },
      })
    })
  }
  function record(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  }
  let account = accountName()
  if (!account)
    return {
      ...failed,
      message:
        '未能唯一识别右上角公众号名称，插件尚未开始新建或插入，请更新插件后刷新页面再检查能力',
    }
  if (command.account && account !== command.account)
    return { ...failed, message: '公众号账号已经变化，请重新确认目标' }
  let state: Record<string, unknown> = {}
  let html = ''
  try {
    if (api) {
      state = record(await invoke('mp_editor_get_isready'))
      if (state.isReady === true && state.isNew === true) {
        const content = record(await invoke('mp_editor_get_content'))
        if (typeof content.content !== 'string') throw new Error('官方接口返回格式不支持')
        html = content.content
      }
    }
  } catch {
    return { ...failed, account, message: '官方编辑接口未就绪或返回格式不支持，请稍后检查能力' }
  }
  const input = titleInput()
  const editor = Boolean(api)
  const ready = state.isReady === true && state.isNew === true
  const empty = ready && emptyBody(html) && Boolean(input) && !input?.value.trim()
  const result: PageResult = {
    account,
    editor,
    ready,
    empty,
    titleSupported: Boolean(input),
    message: editor
      ? ready
        ? empty
          ? '官方接口已就绪，标题和正文为空'
          : '当前编辑器已有内容，禁止覆盖'
        : '官方接口尚未就绪或编辑器版本不支持'
      : '后台账号已识别，可以尝试新建图文',
  }
  if (command.operation === 'probe') return result
  if (command.operation === 'apply') {
    if (!ready || !empty || !input || !command.title || !command.html)
      return { ...result, message: '无法确认新建空编辑器，停止插入' }
    if (input.maxLength > 0 && command.title.length > input.maxLength)
      return { ...result, message: '标题超过当前编辑器长度限制' }
    // Fresh read immediately before the first change. Never append to existing content.
    const fresh = record(await invoke('mp_editor_get_content'))
    if (
      typeof fresh.content !== 'string' ||
      !emptyBody(fresh.content) ||
      input.value.trim() ||
      accountName() !== account
    )
      return { ...result, message: '编辑器或账号已变化，停止插入' }
    const descriptor = Object.getOwnPropertyDescriptor(
      input instanceof HTMLInputElement
        ? HTMLInputElement.prototype
        : HTMLTextAreaElement.prototype,
      'value',
    )
    if (!descriptor?.set) return { ...result, message: '标题输入能力不可用' }
    let userEdited = false
    function userInput(event: Event): void {
      if (event.isTrusted) userEdited = true
    }
    document.addEventListener('input', userInput, true)
    try {
      descriptor.set.call(input, command.title)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
      const afterTitle = record(await invoke('mp_editor_get_content'))
      if (
        userEdited ||
        accountName() !== account ||
        input.value !== command.title ||
        typeof afterTitle.content !== 'string' ||
        !emptyBody(afterTitle.content)
      )
        throw new Error('写入期间页面发生变化')
      await invoke('mp_editor_set_content', command.html)
      const readback = record(await invoke('mp_editor_get_content'))
      account = accountName()
      const actual = typeof readback.content === 'string' ? readback.content : ''
      const expectedDom = new DOMParser().parseFromString(command.html, 'text/html')
      const actualDom = new DOMParser().parseFromString(actual, 'text/html')
      const structure = [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'table',
        'tr',
        'td',
        'th',
        'blockquote',
        'pre',
      ]
      const matches =
        !actualDom.querySelector('img,svg,video,audio,iframe,object,embed,picture,source') &&
        !userEdited &&
        account === command.account &&
        input.value === command.title &&
        text(actual) === text(command.html) &&
        structure.every(function count(tag) {
          return actualDom.querySelectorAll(tag).length === expectedDom.querySelectorAll(tag).length
        })
      return {
        ...result,
        applied: true,
        matches,
        message: matches
          ? '已插入，请检查排版并手动保存'
          : '内容读回存在差异，请检查后台，禁止自动重试',
      }
    } finally {
      document.removeEventListener('input', userInput, true)
    }
  }
  const labels =
    command.operation === 'drafts'
      ? ['草稿箱']
      : command.operation === 'create'
        ? ['新的创作']
        : ['图文', '图文消息']
  const controls = [...document.querySelectorAll<HTMLElement>('a,button,[role="button"]')].filter(
    function matching(element) {
      return (
        visible(element) &&
        labels.includes((element.getAttribute('aria-label') || element.textContent || '').trim()) &&
        !element.hasAttribute('disabled') &&
        element.getAttribute('aria-disabled') !== 'true'
      )
    },
  )
  if (controls.length !== 1)
    return {
      ...result,
      clicked: false,
      message: `无法唯一定位“${labels[0]}”，请手动进入草稿箱后重试`,
    }
  if (editor && command.operation !== 'drafts')
    return { ...result, clicked: false, message: '当前不是受支持的新建入口' }
  const control = controls[0]
  if (control instanceof HTMLAnchorElement) {
    const target = new URL(control.href, location.href)
    if (target.origin !== location.origin || !/^https:/.test(target.protocol))
      return { ...result, clicked: false, message: '后台入口不在允许来源内' }
    control.target = '_self'
  }
  control.click()
  return { ...result, clicked: true, message: '已触发后台入口，等待页面就绪' }
}
