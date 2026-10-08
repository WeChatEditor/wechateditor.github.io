import { storageName } from '../../../app.config'
import type {
  DraftStorage,
  WorkspaceDraft,
  StoredDraft,
  VersionSummary,
} from '../draft-storage.port'
import { draftWriteId, validateVersion } from '../workspace.service'

export class DraftConflictError extends Error {}

export function createDraftStorage(): DraftStorage {
  let database: Promise<IDBDatabase> | undefined
  function open(): Promise<IDBDatabase> {
    if (!database) {
      database = new Promise<IDBDatabase>(function connect(resolve, reject) {
        const request = indexedDB.open(storageName, 2)
        let blocked = false
        request.onupgradeneeded = function upgrade() {
          if (!request.result.objectStoreNames.contains('drafts')) {
            request.result.createObjectStore('drafts')
          }
          if (!request.result.objectStoreNames.contains('versions')) {
            request.result.createObjectStore('versions')
          }
        }
        request.onsuccess = function connected() {
          const db = request.result
          if (blocked) {
            db.close()
            return
          }
          db.onversionchange = function close() {
            db.close()
            database = undefined
          }
          resolve(db)
        }
        request.onerror = function failed() {
          reject(request.error)
        }
        request.onblocked = function unavailable() {
          blocked = true
          reject(new Error('草稿库被其他页面占用，请关闭旧页面后重试。'))
        }
      }).catch(function failed(error) {
        database = undefined
        throw error
      })
    }
    return database
  }

  async function read(store: string, key: IDBValidKey): Promise<unknown> {
    const db = await open()
    return new Promise(function load(resolve, reject) {
      const transaction = db.transaction(store, 'readonly')
      const request = transaction.objectStore(store).get(key)
      transaction.oncomplete = function completed() {
        resolve(request.result)
      }
      transaction.onabort = function aborted() {
        reject(transaction.error ?? new Error('读取本地文章失败。'))
      }
    })
  }

  async function save(
    draft: WorkspaceDraft,
    expectedWriteId: string | undefined,
    version = false,
  ): Promise<{ writeId: string; timestamp?: number }> {
    const db = await open()
    return new Promise(function write(resolve, reject) {
      const transaction = db.transaction(version ? ['drafts', 'versions'] : ['drafts'], 'readwrite')
      const drafts = transaction.objectStore('drafts')
      const request = drafts.get('current')
      const writeId = crypto.randomUUID()
      let timestamp: number | undefined
      let conflict: Error | undefined
      request.onsuccess = function compareAndWrite() {
        try {
          if (draftWriteId(request.result) !== expectedWriteId) {
            throw new DraftConflictError('另一页面更新了当前文章，已暂停保存。请备份原稿后刷新。')
          }
          const record: StoredDraft = { ...draft, writeId }
          drafts.put(record, 'current')
          if (version) {
            const versions = transaction.objectStore('versions')
            const last = versions.openKeyCursor(null, 'prev')
            last.onsuccess = function append() {
              const previous = last.result?.key
              timestamp = Math.max(Date.now(), typeof previous === 'number' ? previous + 1 : 0)
              const versionDraft: WorkspaceDraft = {
                ...draft,
                assets: draft.assets.filter((asset) =>
                  draft.article.markdown.includes(`asset:${asset.id}`),
                ),
              }
              versions.add({ timestamp, draft: versionDraft }, timestamp)
            }
          }
        } catch (error) {
          conflict = error instanceof Error ? error : new Error('当前文章异常。')
          transaction.abort()
        }
      }
      transaction.oncomplete = function completed() {
        resolve({ writeId, timestamp })
      }
      transaction.onabort = function aborted() {
        reject(conflict ?? transaction.error ?? new Error('保存文章失败。'))
      }
    })
  }

  async function listVersions(): Promise<VersionSummary[]> {
    const db = await open()
    return new Promise(function list(resolve, reject) {
      const transaction = db.transaction('versions', 'readonly')
      const request = transaction.objectStore('versions').openCursor(null, 'prev')
      const items: VersionSummary[] = []
      let invalid: Error | undefined
      request.onsuccess = function next() {
        const cursor = request.result
        if (!cursor) {
          return
        }
        try {
          const record = validateVersion(cursor.value, Number(cursor.key))
          items.push({
            timestamp: record.timestamp,
            title:
              record.draft.article.markdown
                .split('\n')
                .find((line) => line.trim())
                ?.replace(/^#+\s*/, '')
                .slice(0, 80) || '空白文章',
            characters: record.draft.article.markdown.length,
          })
          cursor.continue()
        } catch (error) {
          invalid = error instanceof Error ? error : new Error('历史记录异常。')
          transaction.abort()
        }
      }
      transaction.oncomplete = function completed() {
        resolve(items)
      }
      transaction.onabort = function aborted() {
        reject(invalid ?? transaction.error ?? new Error('读取历史版本失败。'))
      }
    })
  }

  async function deleteVersion(timestamp: number): Promise<void> {
    const db = await open()
    return new Promise(function remove(resolve, reject) {
      const transaction = db.transaction('versions', 'readwrite')
      transaction.objectStore('versions').delete(timestamp)
      transaction.oncomplete = function completed() {
        resolve()
      }
      transaction.onabort = function aborted() {
        reject(transaction.error ?? new Error('删除版本失败。'))
      }
    })
  }
  function close(): void {
    void database?.then(
      (db) => db.close(),
      () => undefined,
    )
    database = undefined
  }
  return {
    load: () => read('drafts', 'current'),
    save,
    listVersions,
    loadVersion: (timestamp) => read('versions', timestamp),
    deleteVersion,
    close,
  }
}
