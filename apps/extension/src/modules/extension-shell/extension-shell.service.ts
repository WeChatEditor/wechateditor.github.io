import {
  internalResponseSchema,
  statusSchema,
  targetsSchema,
  type InternalRequest,
  type TaskSummary,
} from '@jlab-wechat-editor/wechat-transfer-contract'

const labels: Record<TaskSummary['phase'], string> = {
  pending: '待插入',
  waiting_login: '等待登录',
  waiting_target: '等待目标',
  creating: '正在新建',
  waiting_editor: '等待编辑器',
  applying: '正在插入',
  inserted: '已插入，待手动保存',
  blocked: '操作已停止',
  uncertain: '结果不确定',
  cancelled: '已取消',
  expired: '已过期',
}
async function send(request: InternalRequest): Promise<unknown> {
  const response = internalResponseSchema.parse(await chrome.runtime.sendMessage(request))
  if (response.status !== 0) throw new Error(response.err || '插件操作失败')
  return response.data
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
  style.textContent = `:host{font:14px/1.6 system-ui,sans-serif;color:#183141}*{box-sizing:border-box}section{width:${mode === 'popup' ? 360 : 258}px;padding:18px;background:#fff;border:1px solid #dce5eb;border-radius:12px;box-shadow:0 8px 28px #18314119}h1{font-size:16px;margin:0 0 12px}p{margin:8px 0;overflow-wrap:anywhere}small{color:#637786}button,select{font:inherit;width:100%;padding:8px 10px;margin:5px 0;border:1px solid #d6e0e7;border-radius:7px;background:#f5f8fa;color:#183141}button{cursor:pointer}button.primary{color:white;background:#247267;border-color:#247267}button:disabled{opacity:.5;cursor:default}button:focus-visible,select:focus-visible{outline:2px solid #247267;outline-offset:2px}label{display:block;margin-top:8px}input{margin-right:6px}.error{color:#a3472b}.row{display:flex;gap:8px}.row button{width:auto;flex:1}details{margin-top:12px}`
  root.append(style)
  const section = document.createElement('section')
  root.append(section)
  const heading = document.createElement('h1')
  heading.textContent = '桀士排版·公众号助手'
  section.append(heading)
  const status = document.createElement('p')
  status.setAttribute('role', 'status')
  section.append(status)
  const message = document.createElement('p')
  section.append(message)
  const error = document.createElement('p')
  error.className = 'error'
  error.setAttribute('role', 'alert')
  section.append(error)
  let task: TaskSummary | null = null
  let busy = false
  let startControl: HTMLButtonElement | undefined
  function button(label: string, action: () => Promise<void>, primary = false): HTMLButtonElement {
    const control = document.createElement('button')
    control.textContent = label
    if (primary) control.className = 'primary'
    control.addEventListener('click', async function clicked(event) {
      if (!event.isTrusted || busy) return
      busy = true
      control.disabled = true
      error.textContent = ''
      try {
        await action()
      } catch (failure) {
        error.textContent =
          failure instanceof Error ? failure.message : '操作失败，请点击浏览器工具栏插件图标'
      } finally {
        busy = false
        control.disabled = false
        void refresh()
      }
    })
    section.append(control)
    return control
  }
  async function refresh(): Promise<void> {
    try {
      task = statusSchema.parse(await send({ kind: 'STATUS' })).task
      status.textContent = task ? `${labels[task.phase]} · ${task.title}` : '没有待传文章'
      message.textContent = task
        ? `${task.message}（接收于 ${new Date(task.receivedAt).toLocaleTimeString()}）`
        : '先在Web完成排版，点击“发送到公众号”'
      if (startControl)
        startControl.disabled =
          busy || !task || !['pending', 'waiting_login', 'waiting_target'].includes(task.phase)
    } catch (failure) {
      error.textContent = failure instanceof Error ? failure.message : '任务状态不可用'
    }
  }
  button('打开写作工作台', async function web() {
    await send({ kind: 'OPEN_WEB' })
  })
  if (mode === 'content') {
    function pageActivity(event: Event): void {
      if (event.isTrusted && !event.composedPath().includes(host))
        void send({ kind: 'PAGE_ACTIVITY' }).catch(function ignore() {})
    }
    document.addEventListener('pointerdown', pageActivity, true)
    document.addEventListener('keydown', pageActivity, true)
    document.addEventListener('input', pageActivity, true)
    button(
      '打开传稿面板',
      async function panel() {
        try {
          await send({ kind: 'OPEN_PANEL' })
        } catch {
          throw new Error('请点击浏览器工具栏的桀士排版插件图标，选择账号后开始插入')
        }
      },
      true,
    )
    const hint = document.createElement('small')
    hint.textContent = '只插入文字排版；检查后请手动保存'
    section.append(hint)
    const hide = document.createElement('button')
    hide.textContent = '收起'
    hide.onclick = function close() {
      section.hidden = true
      const show = document.createElement('button')
      show.textContent = '桀士传稿'
      show.onclick = function reopen() {
        section.hidden = false
        show.remove()
        void refresh()
      }
      root.append(show)
    }
    section.append(hide)
  } else {
    button('打开公众号后台', async function wechat() {
      await send({ kind: 'OPEN_WECHAT' })
    })
    const selector = document.createElement('select')
    selector.setAttribute('aria-label', '公众号目标标签')
    section.append(selector)
    const capability = document.createElement('p')
    section.append(capability)
    let targets: ReturnType<typeof targetsSchema.parse>['targets'] = []
    async function loadTargets(): Promise<void> {
      targets = targetsSchema.parse(await send({ kind: 'TARGETS' })).targets
      selector.replaceChildren()
      const placeholder = document.createElement('option')
      placeholder.value = ''
      placeholder.textContent = '请选择已登录的后台首页或草稿箱'
      selector.append(placeholder)
      for (const target of targets) {
        const option = document.createElement('option')
        option.value = String(target.tabId)
        option.textContent = `${target.account || '未识别账号'} · 标签 ${target.tabId}${target.editor ? '（编辑页，请改选后台首页）' : ''}`
        option.disabled = !target.account || target.editor
        selector.append(option)
      }
      capability.textContent = targets.length
        ? targets
            .map(function capability(target) {
              return `标签${target.tabId}：${target.message}`
            })
            .join('；')
        : '请登录公众号，再刷新目标与页面能力'
    }
    button('刷新目标与页面能力', loadTargets)
    const confirmation = document.createElement('label')
    const check = document.createElement('input')
    check.type = 'checkbox'
    confirmation.append(check, '我确认所选公众号，新建空图文后插入此快照')
    section.append(confirmation)
    startControl = button(
      '新建图文并插入',
      async function insert() {
        const target = targets.find(function selected(value) {
          return String(value.tabId) === selector.value
        })
        if (!task || !target || !check.checked) throw new Error('请选择公众号并勾选确认')
        const current = task
        await send({
          kind: 'START_INSERT',
          taskId: current.id,
          tabId: target.tabId,
          account: target.account,
        })
        check.checked = false
      },
      true,
    )
    selector.addEventListener('change', function changed() {
      check.checked = false
    })
    button('取消待传任务', async function cancel() {
      if (task) await send({ kind: 'CANCEL_TASK', taskId: task.id, inspected: false })
    })
    const details = document.createElement('details')
    const summary = document.createElement('summary')
    summary.textContent = '中断恢复与清理'
    details.append(summary)
    section.append(details)
    const inspectedLabel = document.createElement('label')
    const inspected = document.createElement('input')
    inspected.type = 'checkbox'
    inspectedLabel.append(inspected, '我已检查后台，新建或插入结果由我处理')
    details.append(inspectedLabel)
    const discard = button('丢弃当前任务记录', async function discardTask() {
      if (!inspected.checked) throw new Error('请先检查后台并勾选确认')
      if (task) await send({ kind: 'CANCEL_TASK', taskId: task.id, inspected: true })
    })
    details.append(discard)
    const clear = button('清空损坏的任务存储', async function clearStorage() {
      if (!inspected.checked) throw new Error('请先检查后台并勾选确认')
      await send({ kind: 'CLEAR_STORAGE', inspected: true })
    })
    details.append(clear)
    const hint = document.createElement('small')
    hint.textContent = '只使用文字快照。已插入后，请检查排版、补充封面等信息并手动保存。'
    section.append(hint)
    void loadTargets().catch(function missing(failure) {
      error.textContent = failure instanceof Error ? failure.message : '无法获取目标'
    })
  }
  void refresh()
  const timer = setInterval(function poll() {
    if (!busy) void refresh()
  }, 2000)
  window.addEventListener(
    'pagehide',
    function cleanup() {
      clearInterval(timer)
    },
    { once: true },
  )
}
