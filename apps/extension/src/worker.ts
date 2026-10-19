import { registerTransferWorker } from './modules/wechat-transfer/wechat-transfer.service'
import { registerToolbarIcon } from './modules/extension-shell/extension-shell.service'

registerToolbarIcon()
registerTransferWorker()
