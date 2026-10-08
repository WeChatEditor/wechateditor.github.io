import type { TypesettingConfig, ChapterStyle, ColorPreset } from './typesetting.model'

const originalPresets = [
  {
    id: 'clear-blue',
    name: '清透蓝',
    colors: {
      body: '#30323d',
      heading: '#172b4d',
      accent: '#2563eb',
      muted: '#475569',
      background: '#eff6ff',
    },
  },
  {
    id: 'warm-gold',
    name: '暖金',
    colors: {
      body: '#423b34',
      heading: '#45352a',
      accent: '#a16207',
      muted: '#6b5e50',
      background: '#fef7e8',
    },
  },
  {
    id: 'teal',
    name: '青绿',
    colors: {
      body: '#2b403c',
      heading: '#164e45',
      accent: '#0f766e',
      muted: '#526a64',
      background: '#edf7f4',
    },
  },
  {
    id: 'ink',
    name: '墨色',
    colors: {
      body: '#30323d',
      heading: '#1e293b',
      accent: '#475569',
      muted: '#64748b',
      background: '#f1f5f9',
    },
  },

  {
    id: 'retro',
    name: '复古潮流',
    colors: {
      body: '#3d3830',
      heading: '#8b4e35',
      accent: '#5b7762',
      muted: '#80766a',
      background: '#f7f2e8',
    },
  },

  {
    id: 'orange',
    name: '活力橙',
    colors: {
      body: '#39332d',
      heading: '#ab4a17',
      accent: '#bd681c',
      muted: '#807264',
      background: '#fff3e7',
    },
  },
]

export const presets: ColorPreset[] = [
  'warm-gold',
  'teal',
  'ink',
  'clear-blue',
  'retro',
  'orange',
].map((id) => ({ ...originalPresets.find((preset) => preset.id === id)!, custom: false }))

export function defaultPalettes(): ColorPreset[] {
  return presets.map((preset) => ({ ...preset, colors: { ...preset.colors } }))
}

export const maxPalettes = 9

export function saveColorPreset(
  config: TypesettingConfig,
  value: string,
): Partial<TypesettingConfig> | undefined {
  const name = value.trim().slice(0, 30)
  if (!name || config.palettes.length >= maxPalettes) {
    return
  }
  const id = 'custom-' + crypto.randomUUID()
  return {
    palettes: [...config.palettes, { id, name, colors: { ...config.colors }, custom: true }],
    preset: id,
  }
}

export function deleteColorPreset(
  config: TypesettingConfig,
  id: string,
): Partial<TypesettingConfig> | undefined {
  if (config.palettes.length <= 1 || !config.palettes.some((preset) => preset.id === id)) {
    return
  }
  return {
    palettes: config.palettes.filter((preset) => preset.id !== id),
    ...(config.preset === id ? { preset: 'custom' } : {}),
  }
}

export function updateColorPreset(
  config: TypesettingConfig,
  id: string,
): Partial<TypesettingConfig> {
  return {
    palettes: config.palettes.map((preset) =>
      preset.id === id ? { ...preset, colors: { ...config.colors } } : preset,
    ),
    preset: id,
  }
}

export function resetColorPresets(): Partial<TypesettingConfig> {
  return { palettes: defaultPalettes(), preset: 'custom' }
}

export function normalizeTypesetting(config: TypesettingConfig): TypesettingConfig {
  return {
    ...config,
    chapterNumberEnabled: config.chapterNumberEnabled ?? false,
    palettes: config.palettes ?? defaultPalettes(),
  }
}

export function defaultTypesetting(): TypesettingConfig {
  return {
    preset: 'clear-blue',
    colors: { ...presets.find((preset) => preset.id === 'clear-blue')!.colors },
    chapterStyle: 'bar',
    chapterNumberEnabled: false,
    palettes: defaultPalettes(),
    fontSize: 16,
    lineHeight: 1.9,
    paragraphGap: 20,
    letterSpacing: 0.5,
    font: 'default',
    backgroundEnabled: true,
  }
}

export function contrastRatio(first: string, second: string): number {
  function luminance(hex: string): number {
    const channels = [1, 3, 5].map(function channel(index) {
      const value = parseInt(hex.slice(index, index + 2), 16) / 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  }
  const a = luminance(first)
  const b = luminance(second)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function decorateChapter(
  heading: HTMLElement,
  style: ChapterStyle,
  number: number,
  config: TypesettingConfig,
): void {
  const { accent, heading: color } = config.colors
  const decoration = document.createElement('span')
  decoration.dataset.decoration = 'true'
  decoration.style.cssText = `color:${accent};font-size:14px;line-height:24px;font-weight:bold;`
  const label = config.chapterNumberEnabled ? String(number).padStart(2, '0') + '  ' : ''
  switch (style) {
    case 'underline':
      heading.style.borderBottom = `2px solid ${accent}`
      break
    case 'bar':
      heading.style.borderLeft = `4px solid ${accent}`
      heading.style.paddingLeft = '12px'
      break
    case 'box':
      heading.style.border = `1px solid ${accent}`
      heading.style.padding = '12px'
      break
    case 'slash':
      decoration.textContent = '//  '
      break
    case 'bracket':
      decoration.textContent = label ? `[${label.trim()}]  ` : '[ ]  '
      break
    case 'circles':
      decoration.textContent = '◎ ◎  '
      break
    case 'dots':
      decoration.textContent = '● ● ●  '
      break
    case 'overline':
      decoration.textContent = '—'
      decoration.style.display = 'block'
      break
    case 'quote':
      decoration.textContent = '“  '
      decoration.style.color = color
      break
  }
  if (label && style !== 'bracket') {
    const sequence = document.createElement('span')
    sequence.dataset.decoration = 'true'
    sequence.textContent = label
    sequence.style.color = accent
    heading.prepend(sequence)
  }
  if (decoration.textContent) {
    heading.prepend(decoration)
  }
}

export function chapterPreview(style: ChapterStyle, config: TypesettingConfig): string {
  const heading = document.createElement('span')
  heading.textContent = '章节标题示例'
  heading.style.cssText = `display:block;color:${config.colors.heading};font-size:15px;line-height:24px;font-weight:bold;padding-bottom:4px;`
  decorateChapter(heading, style, 1, config)
  return heading.outerHTML
}

export function styleArticle(root: HTMLElement, config: TypesettingConfig, numbered = true): void {
  const { colors, fontSize, lineHeight, paragraphGap, letterSpacing } = config
  root.style.cssText = `color:${colors.body};font-size:${fontSize}px;line-height:${fontSize * lineHeight}px;letter-spacing:${letterSpacing}px;word-wrap:break-word;text-align:left;`
  if (config.font !== 'default') {
    root.style.fontFamily =
      config.font === 'sans'
        ? '"Microsoft YaHei", "Noto Sans CJK SC", sans-serif'
        : '"Noto Serif CJK SC", "Songti SC", serif'
  }
  const headingElements = [...root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6')]
  const chapterLevel = Math.min(
    ...headingElements.filter((h) => h.tagName !== 'H1').map((h) => Number(h.tagName[1])),
  )
  let chapter = 0
  for (const element of root.querySelectorAll<HTMLElement>('*')) {
    const tag = element.tagName.toLowerCase()
    if (tag === 'p') {
      element.style.cssText = `margin:0 0 ${paragraphGap}px;line-height:${fontSize * lineHeight}px;`
    } else if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag[1])
      const size =
        level === 1 ? fontSize + 12 : level === chapterLevel ? fontSize + 5 : fontSize + 2
      element.style.cssText = `color:${colors.heading};font-size:${size}px;line-height:${size * 1.6}px;font-weight:bold;margin:28px 0 18px;padding-bottom:6px;`
      if (numbered && level === chapterLevel) {
        decorateChapter(element, config.chapterStyle, ++chapter, config)
      }
    } else if (tag === 'strong') {
      element.style.cssText = `color:${colors.accent};font-weight:bold;`
    } else if (tag === 'blockquote') {
      element.style.cssText = `border-left:3px solid ${colors.accent};padding:14px 18px;margin:20px 0;color:${colors.muted};`
      if (config.backgroundEnabled) {
        element.style.backgroundColor = colors.background
      }
    } else if (tag === 'pre') {
      element.style.cssText = `padding:16px 18px 18px;margin:24px 0;background-color:#f6f8fa;color:#30323d;border:1px solid #e2e8f0;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px;line-height:24px;`
      const chrome = document.createElement('span')
      chrome.dataset.decoration = 'true'
      chrome.style.cssText = 'display:block;margin-bottom:12px;line-height:12px;'
      for (const color of ['#ff5f56', '#ffbd2e', '#27c93f']) {
        const dot = document.createElement('span')
        dot.style.cssText = `display:inline-block;width:9px;height:9px;margin-right:6px;border-radius:50%;background-color:${color};`
        chrome.append(dot)
      }
      element.prepend(chrome)
    } else if (tag === 'code') {
      element.style.fontFamily = 'monospace'
      if (element.parentElement?.tagName !== 'PRE') {
        element.style.cssText += `color:${colors.accent};background-color:#f4f5f7;padding:2px 4px;`
      }
    } else if (tag === 'table') {
      element.style.cssText = `width:100%;table-layout:fixed;border-collapse:collapse;font-size:${Math.max(14, fontSize - 1)}px;line-height:${fontSize * lineHeight}px;margin:20px 0;`
    } else if (tag === 'th' || tag === 'td') {
      const align = element.style.textAlign || 'left'
      element.style.cssText = `border-bottom:1px solid #d9dce5;padding:10px 8px;overflow-wrap:anywhere;text-align:${align};`
      if (tag === 'th') {
        element.style.color = colors.heading
        element.style.fontWeight = 'bold'
        element.style.backgroundColor = '#f1f5f9'
      } else if (element.parentElement?.parentElement?.tagName === 'TBODY') {
        const row = element.parentElement
        if (row && [...row.parentElement!.children].indexOf(row) % 2 === 1) {
          element.style.backgroundColor = '#f8fafc'
        }
      }
    } else if (tag === 'ul' || tag === 'ol') {
      element.style.cssText = 'padding-left:26px;margin:16px 0;'
    } else if (tag === 'li') {
      element.style.cssText = `margin:8px 0;line-height:${fontSize * lineHeight}px;`
    } else if (tag === 'img') {
      element.style.cssText = 'max-width:100%;height:auto;display:block;margin:18px auto;'
    } else if (tag === 'a') {
      element.style.cssText = `color:${colors.accent};text-decoration:underline;overflow-wrap:anywhere;`
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noopener noreferrer')
    } else if (tag === 'hr') {
      element.style.cssText = `border:0;border-top:1px solid ${colors.accent};margin:28px 0;`
    }
  }
}
