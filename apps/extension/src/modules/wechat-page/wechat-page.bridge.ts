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
    return (
      element.getClientRects().length > 0 &&
      !element.closest('[hidden],[inert]') &&
      !['hidden', 'collapse'].includes(getComputedStyle(element).visibility)
    )
  }
  function accountName(): string {
    const elements = [
      ...document.querySelectorAll(
        '.weui-desktop_name, .acount_box-nickname, .weui-desktop-account__nickname, .account_nickname, #account_nickname',
      ),
    ]
    const names = elements
      .filter(visible)
      .map(function name(element) {
        return element.textContent?.trim() || ''
      })
      .filter(Boolean)
    const unique = [...new Set(names)]
    if (unique.length) return unique.length === 1 ? unique[0] : ''
    // A fresh editor can hide its account header. Only verify an already bound account.
    if (
      command.account &&
      (command.operation === 'probe' || command.operation === 'apply') &&
      typeof api?.invoke === 'function' &&
      elements.length === 1 &&
      elements[0].textContent?.trim() === command.account
    )
      return command.account
    return ''
  }
  type TitleControl = {
    element: HTMLInputElement | HTMLTextAreaElement | HTMLElement
    backing?: HTMLTextAreaElement
  }
  function titleInput(): TitleControl | undefined {
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
    const richInputs = [
      ...document.querySelectorAll<HTMLElement>(
        '#js_title_main .title-editor-overlay .title-editor__input > .ProseMirror[contenteditable="true"]',
      ),
    ].filter(function editable(element) {
      return (
        visible(element) &&
        element.isContentEditable &&
        !element.closest('[aria-disabled="true"],[aria-readonly="true"]')
      )
    })
    if (richInputs.length) {
      if (richInputs.length !== 1) return undefined
      const element = richInputs[0]
      const container = element.closest('#js_title_main')
      if (
        inputs.some(function independent(input) {
          return input.closest('#js_title_main') !== container
        })
      )
        return undefined
      const backing = container?.querySelectorAll<HTMLTextAreaElement>(
        'textarea#title[name="title"]',
      )
      return backing?.length === 1 && !backing[0].disabled && !backing[0].readOnly
        ? { element, backing: backing[0] }
        : undefined
    }
    return inputs.length === 1 ? { element: inputs[0] } : undefined
  }
  function titleText(control: TitleControl): string {
    return control.element instanceof HTMLInputElement ||
      control.element instanceof HTMLTextAreaElement
      ? control.element.value
      : control.element.textContent || ''
  }
  function titleEmpty(control: TitleControl): boolean {
    return !titleText(control).trim() && (!control.backing || !control.backing.value.trim())
  }
  function titleMatches(control: TitleControl, title: string): boolean {
    return titleText(control) === title && (!control.backing || control.backing.value === title)
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
    return {
      ...failed,
      account,
      editor: Boolean(api),
      message: '官方编辑接口未就绪或返回格式不支持，请稍后检查能力',
    }
  }
  const input = titleInput()
  const editor = Boolean(api)
  const ready = state.isReady === true && state.isNew === true
  const bodyEmpty = emptyBody(html)
  const empty = ready && bodyEmpty && Boolean(input && titleEmpty(input))
  let message = '后台账号已识别，可以尝试新建图文'
  if (editor) {
    if (!ready) message = '官方接口尚未就绪或编辑器版本不支持'
    else if (!input) message = '标题控件尚未就绪或无法唯一识别，正在等待页面加载'
    else if (!bodyEmpty) message = '当前正文已有文字或媒体，禁止覆盖'
    else if (!titleEmpty(input)) message = '当前标题已有内容，禁止覆盖'
    else message = '官方接口已就绪，标题和正文为空'
  }
  const result: PageResult = {
    account,
    editor,
    ready,
    empty,
    titleSupported: Boolean(input),
    message,
  }
  if (command.operation === 'probe') return result
  if (command.operation === 'apply') {
    if (!ready || !empty || !input || !command.title || !command.html)
      return { ...result, message: '无法确认新建空编辑器，停止插入' }
    const maximum = input.backing
      ? Number(input.backing.getAttribute('max-length'))
      : (input.element as HTMLInputElement | HTMLTextAreaElement).maxLength
    const titleLength = input.backing ? [...command.title].length : command.title.length
    const limit = input.backing && (!Number.isInteger(maximum) || maximum <= 0) ? 64 : maximum
    if (limit > 0 && titleLength > limit)
      return { ...result, message: '标题超过当前编辑器长度限制' }
    if (input.backing && command.titleEditAttribute !== 'data-jlab-native-title-edit')
      return { ...result, message: '原生标题输入保护未就绪，停止插入' }
    // Fresh read immediately before the first change. Never append to existing content.
    const fresh = record(await invoke('mp_editor_get_content'))
    if (
      typeof fresh.content !== 'string' ||
      !emptyBody(fresh.content) ||
      !titleEmpty(input) ||
      accountName() !== account
    )
      return { ...result, message: '编辑器或账号已变化，停止插入' }
    let userEdited = false
    let editingTitle = false
    function userInput(event: Event): void {
      if (
        event.isTrusted &&
        !(editingTitle && event.target instanceof Node && input!.element.contains(event.target))
      )
        userEdited = true
    }
    document.addEventListener('input', userInput, true)
    try {
      if (input.backing) {
        const selection = window.getSelection()
        if (!selection || typeof document.execCommand !== 'function')
          return { ...result, message: '浏览器原生标题编辑能力不可用，停止插入' }
        input.element.focus({ preventScroll: true })
        const range = document.createRange()
        range.selectNodeContents(input.element)
        selection.removeAllRanges()
        selection.addRange(range)
        const attribute = command.titleEditAttribute!
        editingTitle = true
        input.element.setAttribute(attribute, 'active')
        try {
          if (!document.execCommand('insertText', false, command.title))
            return { ...result, message: '浏览器拒绝原生标题编辑，请检查标题后手动复制' }
        } finally {
          input.element.removeAttribute(attribute)
          editingTitle = false
        }
        input.element.blur()
        const deadline = Date.now() + 2000
        while (!titleMatches(input, command.title)) {
          if (userEdited || accountName() !== account || !input.element.isConnected)
            return { ...result, message: '标题写入期间页面或账号变化，停止正文插入' }
          if (Date.now() >= deadline)
            return {
              ...result,
              message: '可见标题与平台标题字段未同步，停止正文插入，请检查后手动复制',
            }
          await new Promise(function settle(resolve) {
            setTimeout(resolve, 25)
          })
        }
      } else {
        const descriptor = Object.getOwnPropertyDescriptor(
          input.element instanceof HTMLInputElement
            ? HTMLInputElement.prototype
            : HTMLTextAreaElement.prototype,
          'value',
        )
        if (!descriptor?.set) return { ...result, message: '标题输入能力不可用' }
        descriptor.set.call(input.element, command.title)
        input.element.dispatchEvent(new Event('input', { bubbles: true }))
        input.element.dispatchEvent(new Event('change', { bubbles: true }))
      }
      const afterTitle = record(await invoke('mp_editor_get_content'))
      if (
        userEdited ||
        accountName() !== account ||
        !titleMatches(input, command.title) ||
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
        titleMatches(input, command.title) &&
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
  if (editor) return { ...result, clicked: false, message: '当前不是受支持的新建入口' }
  function label(element: Element): string {
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.querySelector('.weui-desktop-menu__name')?.textContent ||
      element.textContent ||
      ''
    )
      .replace(/\s+/g, '')
      .trim()
  }
  function enabled(element: Element): boolean {
    return !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true'
  }
  function controlsFor(labels: string[]): HTMLElement[] {
    const matches = [
      ...document.querySelectorAll<HTMLElement>(
        'a,button,[role="button"],[role="menuitem"],.weui-desktop-dropdown__list-ele,.weui-desktop-dropdown__list-item',
      ),
    ].filter(function matching(element) {
      const menuText = element.matches(
        '.weui-desktop-dropdown__list-ele,.weui-desktop-dropdown__list-item',
      )
        ? element.querySelector<HTMLElement>('.weui-desktop-dropdown__list-ele__text')
        : null
      // Menu tooltips can repeat the label in textContent even when they are hidden.
      const name = (
        element.getAttribute('aria-label') ||
        (menuText && visible(menuText) ? menuText.innerText : element.innerText)
      )
        .replace(/\s+/g, '')
        .trim()
      return visible(element) && labels.includes(name) && enabled(element)
    })
    // A menu item and its own link represent one action, not two competing entries.
    return matches.filter(function innermost(element) {
      return !matches.some(function nested(other) {
        return other !== element && element.contains(other)
      })
    })
  }
  let draftControls: HTMLAnchorElement[] = []
  let contentMenu: HTMLElement | undefined
  let menuHeading: HTMLElement | undefined
  if (command.operation === 'drafts') {
    const menus = [...document.querySelectorAll<HTMLElement>('.weui-desktop-menu_create')].filter(
      function contentManagement(menu) {
        const heading = menu.querySelector<HTMLElement>(':scope > .weui-desktop-menu__link')
        return visible(menu) && heading !== null && label(heading) === '内容管理'
      },
    )
    if (menus.length > 1)
      return { ...result, clicked: false, message: '左侧匹配到多个“内容管理”菜单，已停止自动导航' }
    contentMenu = menus[0]
    menuHeading =
      contentMenu?.querySelector<HTMLElement>(':scope > .weui-desktop-menu__link') || undefined
    draftControls = contentMenu
      ? [...contentMenu.querySelectorAll<HTMLAnchorElement>('a.weui-desktop-menu__link')].filter(
          function draftLink(link) {
            return label(link) === '草稿箱' && visible(link)
          },
        )
      : []
    if (draftControls.length > 1)
      return { ...result, clicked: false, message: '左侧匹配到多个“草稿箱”入口，已停止自动导航' }
  }
  if (command.operation === 'drafts' && controlsFor(['新的创作']).length === 1) {
    const heading = [
      ...document.querySelectorAll(
        'h1,h2,h3,[role="heading"],[class*="title"],[class*="main__hd"]',
      ),
    ].some(function draftsHeading(element) {
      return visible(element) && element.textContent?.trim() === '草稿箱'
    })
    const selected = draftControls.some(function current(element) {
      return Boolean(
        element.closest(
          '[aria-current="page"],.selected,.active,.weui-desktop-menu__item_selected,.weui-desktop-menu__sub_item_selected,.weui-desktop-sub-menu__item_selected',
        ),
      )
    })
    if (heading || selected) return { ...result, drafts: true, message: '已在草稿箱，准备新的创作' }
  }
  if (command.operation === 'drafts' && draftControls.length === 0) {
    if (!contentMenu || !menuHeading)
      return {
        ...result,
        clicked: false,
        retryNavigation: true,
        message: '未找到首页左侧“内容管理”菜单，正在等待页面加载',
      }
    if (!visible(menuHeading) || !enabled(menuHeading))
      return { ...result, clicked: false, message: '左侧“内容管理”菜单暂时不可点击' }
    if (command.expandMenu !== false) {
      menuHeading.click()
      return {
        ...result,
        clicked: false,
        retryNavigation: true,
        menuExpansionRequested: true,
        message: '已点击“内容管理”，正在等待草稿箱菜单展开',
      }
    }
    return {
      ...result,
      clicked: false,
      retryNavigation: true,
      message: '左侧“草稿箱”入口尚未显示，正在等待菜单展开或加载',
    }
  }
  const labels =
    command.operation === 'drafts'
      ? ['草稿箱']
      : command.operation === 'create'
        ? ['新的创作']
        : ['文章', '图文', '图文消息']
  let controls: HTMLElement[] = []
  if (command.operation === 'drafts') controls = draftControls
  else {
    for (const name of labels) {
      controls = controlsFor([name])
      if (controls.length) break
    }
  }
  if (controls.length !== 1)
    return {
      ...result,
      clicked: false,
      retryNavigation: controls.length === 0,
      message: controls.length
        ? `匹配到多个“${labels[0]}”入口，已停止自动导航`
        : `未找到“${labels[0]}”入口，正在等待页面就绪`,
    }
  const control = controls[0]
  if (!enabled(control))
    return { ...result, clicked: false, message: `“${labels[0]}”入口暂时不可点击` }
  if (control instanceof HTMLAnchorElement) {
    const target = new URL(control.href, location.href)
    if (target.origin !== location.origin || !/^https:/.test(target.protocol))
      return { ...result, clicked: false, message: '后台入口不在允许来源内' }
  }
  control.click()
  return { ...result, clicked: true, message: '已触发后台入口，等待页面就绪' }
}
