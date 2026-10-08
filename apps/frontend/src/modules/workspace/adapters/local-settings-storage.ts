import { storageName } from '../../../app.config'
import type { WorkspaceSettings } from '../draft-storage.port'
import { validateSettings } from '../workspace.service'

export const settingsKey = `${storageName}:settings`

export function loadSettings(): WorkspaceSettings | undefined {
  const raw = localStorage.getItem(settingsKey)
  return raw === null ? undefined : validateSettings(JSON.parse(raw), true)
}

export function saveSettings(settings: WorkspaceSettings): void {
  localStorage.setItem(settingsKey, JSON.stringify(validateSettings(settings)))
}
