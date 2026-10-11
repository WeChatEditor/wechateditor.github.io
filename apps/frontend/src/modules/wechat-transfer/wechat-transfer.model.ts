import type { ExternalRequest, TaskSummary } from '@jlab-wechat-editor/wechat-transfer-contract'
export const phaseLabels: Record<TaskSummary['phase'], string> = {
  pending: '待插入',
  waiting_login: '等待登录',
  waiting_target: '等待目标',
  creating: '正在新建',
  waiting_editor: '等待编辑器',
  applying: '正在插入',
  inserted: '已插入，待手动保存',
  blocked: '操作已停止',
  uncertain: '结果不确定，请检查后台',
  cancelled: '已取消',
  expired: '已过期',
}

export interface PreparedText {
  sourceArticleId: string
  sourceRevision: number
  sourceGeneration: number
  title: string
  html: string
  plainText: string
}
export interface TransferConnection {
  busy: boolean
  message: string
  task: TaskSummary | null
  retry: ExternalRequest | null
}
