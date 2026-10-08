export interface FixedOpening {
  markdown: string
  enabled: boolean
}

export interface FixedEnding {
  schemaVersion: 1
  markdown: string
  enabled: boolean
  opening?: FixedOpening
}
