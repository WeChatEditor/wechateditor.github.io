export interface PreparedAsset {
  id: string
  name: string
  mime: string
  blob: Blob
  width: number
  height: number
}

export interface AssetDiagnostic {
  source: string
  message: string
  blocking: boolean
}
