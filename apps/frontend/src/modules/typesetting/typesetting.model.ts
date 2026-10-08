export const chapterStyles = [
  ['underline', '下划线'],
  ['thick-underline', '粗下划线'],
  ['slash', '斜线'],
  ['bar', '竖线'],
  ['thick-bar', '粗竖线'],
  ['bracket', '方括号'],
  ['circles', '双圆'],
  ['dots', '点阵'],
] as const
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
}
