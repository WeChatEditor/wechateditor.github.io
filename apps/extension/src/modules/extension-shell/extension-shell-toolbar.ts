const updates = new Map<number, symbol>()

function supportedPage(value: string | undefined): boolean {
  if (!value) return false
  try {
    const { origin } = new URL(value)
    return (
      origin === 'https://wechateditor.github.io' ||
      origin === 'https://mp.weixin.qq.com' ||
      (__DEVELOPMENT__ &&
        (origin === 'http://127.0.0.1:5175' || origin === 'http://127.0.0.1:4175'))
    )
  } catch {
    return false
  }
}

async function refreshTab(tabId: number): Promise<void> {
  const update = Symbol()
  updates.set(tabId, update)
  try {
    const tab = await chrome.tabs.get(tabId)
    if (updates.get(tabId) !== update) return
    await chrome.action.setIcon({
      tabId,
      path: supportedPage(tab.pendingUrl ?? tab.url) ? 'logo-32.png' : 'logo-32-gray.png',
    })
  } catch {
    // A closed tab or unavailable permission must not interrupt article transfer.
  } finally {
    if (updates.get(tabId) === update) updates.delete(tabId)
  }
}

async function refreshExistingTabs(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({})
    for (const tab of tabs) {
      if (tab.id !== undefined) void refreshTab(tab.id)
    }
  } catch {
    // The manifest's gray default remains available if initialization fails.
  }
}

export function registerToolbarIcon(): void {
  chrome.tabs.onCreated.addListener(function created(tab) {
    if (tab.id !== undefined) void refreshTab(tab.id)
  })
  chrome.tabs.onActivated.addListener(function activated({ tabId }) {
    void refreshTab(tabId)
  })
  chrome.tabs.onUpdated.addListener(function updated(tabId, change) {
    if (change.url !== undefined || change.status !== undefined) void refreshTab(tabId)
  })
  chrome.tabs.onReplaced.addListener(function replaced(addedTabId, removedTabId) {
    updates.delete(removedTabId)
    void refreshTab(addedTabId)
  })
  chrome.tabs.onRemoved.addListener(function removed(tabId) {
    updates.delete(tabId)
  })
  chrome.runtime.onInstalled.addListener(function installed() {
    void refreshExistingTabs()
  })
  chrome.runtime.onStartup.addListener(function started() {
    void refreshExistingTabs()
  })
  void refreshExistingTabs()
}
