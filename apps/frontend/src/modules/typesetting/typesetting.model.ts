export const chapterStyles = [
  ['editorial', '杂志刊头'],
  ['label', '色签标题'],
  ['frame', '双线专栏'],
  ['minimal', '极简细线'],
  ['underline', '下划线'],
  ['thick-underline', '粗下划线'],
  ['slash', '斜线'],
  ['bar', '竖线'],
  ['thick-bar', '粗竖线'],
  ['bracket', '方括号'],
  ['circles', '双圆'],
  ['dots', '点阵'],
] as const
export const fontSizeRange = { min: 11, max: 32, step: 1 } as const
export const fontSizePresets = [11, 12, 14, 16, 18, 20, 24, 28, 32] as const
export const cardSymbols = [
  ['spark', '✦', '星芒'],
  ['diamond', '◆', '菱形'],
  ['none', '', '无符号'],
] as const
export type CardSymbol = (typeof cardSymbols)[number][0]
export type ChapterStyle = (typeof chapterStyles)[number][0]
export type ColorRole = 'body' | 'heading' | 'accent' | 'muted' | 'background'
export interface ColorPreset {
  id: string
  name: string
  colors: Record<ColorRole, string>
  custom: boolean
}
export interface TypesettingConfig {
  preset: string
  colors: Record<ColorRole, string>
  chapterStyle: ChapterStyle
  chapterNumberEnabled: boolean
  chapterDecorationTight: boolean
  chapterAlignment: 'left' | 'center' | 'right'
  palettes: ColorPreset[]
  fontSize: number
  lineHeight: number
  paragraphGap: number
  letterSpacing: number
  font: 'default' | 'sans' | 'serif'
  backgroundEnabled: boolean
  cardSymbol: CardSymbol
  cardBrand: string
}
