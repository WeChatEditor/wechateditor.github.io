import {
  errors,
  TransferError,
  wechatUrl,
  productionWebUrl,
} from '@jlab-wechat-editor/wechat-transfer-contract'
import { editorBridge } from './wechat-page.bridge'
import type { PageBinding, PageCommand, PageTarget } from './wechat-page.model'

export async function inspectPage(
  tabId: number,
  command: PageCommand = { operation: 'probe' },
  documentId?: string,
) {
  const tab = await chrome.tabs.get(tabId)
  if (!tab.url?.startsWith(wechatUrl))
    throw new TransferError(errors.PAGE_UNSUPPORTED, '请打开公众号后台')
  const results = await chrome.scripting.executeScript({
    target: documentId ? { tabId, documentIds: [documentId] } : { tabId, frameIds: [0] },
    world: 'MAIN',
    func: editorBridge,
    args: [command],
  })
  const result = results[0]
  if (!result?.result || !result.documentId)
    throw new TransferError(errors.PAGE_UNSUPPORTED, '无法读取公众号页面能力')
  return { page: result.result, documentId: result.documentId }
}
export async function listTargets(): Promise<PageTarget[]> {
  const tabs = await chrome.tabs.query({ url: `${wechatUrl}*` })
  return Promise.all(
    tabs
      .filter(function hasId(tab) {
        return tab.id !== undefined
      })
      .map(async function probe(tab) {
        try {
          return { tabId: tab.id!, ...(await inspectPage(tab.id!)).page }
        } catch {
          return {
            tabId: tab.id!,
            account: '',
            ready: false,
            editor: false,
            empty: false,
            titleSupported: false,
            message: '页面能力不可用或尚未登录',
          }
        }
      }),
  )
}
export async function openWeb(): Promise<void> {
  const url = __DEVELOPMENT__ ? 'http://127.0.0.1:5175/' : productionWebUrl
  const tabs = await chrome.tabs.query({ url: `${url}*` })
  if (tabs[0]?.id !== undefined) {
    await chrome.tabs.update(tabs[0].id, { active: true })
    if (tabs[0].windowId) await chrome.windows.update(tabs[0].windowId, { focused: true })
  } else await chrome.tabs.create({ url })
}
export async function openWechat(): Promise<number> {
  const tab = await chrome.tabs.create({ url: wechatUrl, active: true })
  if (tab.id === undefined) throw new TransferError(errors.PAGE_UNSUPPORTED, '无法打开公众号后台')
  return tab.id
}
export async function duplicateTarget(tabId: number, account: string): Promise<number> {
  const probe = await inspectPage(tabId)
  if (probe.page.account !== account || !account)
    throw new TransferError(errors.TARGET_REQUIRED, '账号已变化，请重新选择并确认')
  if (probe.page.editor)
    throw new TransferError(
      errors.PAGE_UNSUPPORTED,
      '请先选择后台首页或草稿箱标签，插件不会复用已有编辑页',
    )
  const tab = await chrome.tabs.get(tabId)
  const created = await chrome.tabs.create({ url: tab.url, active: true, openerTabId: tabId })
  if (created.id === undefined)
    throw new TransferError(errors.PAGE_UNSUPPORTED, '无法打开独立后台标签')
  return created.id
}
export async function applyArticle(binding: PageBinding, title: string, html: string) {
  return (
    await inspectPage(
      binding.tabId,
      { operation: 'apply', account: binding.account, title, html },
      binding.documentId,
    )
  ).page
}
export async function navigationStep(
  binding: PageBinding,
  operation: 'drafts' | 'create' | 'article',
  expandMenu = true,
) {
  return (
    await inspectPage(
      binding.tabId,
      { operation, account: binding.account, ...(operation === 'drafts' ? { expandMenu } : {}) },
      binding.documentId,
    )
  ).page
}
export async function childTabs(tabId: number): Promise<number[]> {
  const tabs = await chrome.tabs.query({ url: `${wechatUrl}*` })
  return tabs
    .filter(function child(tab) {
      return tab.openerTabId === tabId && tab.id !== undefined
    })
    .map(function id(tab) {
      return tab.id!
    })
}
export async function childTab(
  tabId: number,
  previous: readonly number[],
): Promise<number | undefined> {
  const children = (await childTabs(tabId)).filter(function created(id) {
    return !previous.includes(id)
  })
  if (children.length > 1)
    throw new TransferError(errors.PAGE_UNSUPPORTED, '新建操作打开了多个页面，请检查后台')
  return children[0]
}
