import type { TypesettingConfig, ChapterStyle, ColorPreset } from './typesetting.model'
import { cardSymbols } from './typesetting.model'

export const defaultPresetId = 'editorial'

const originalPresets = [
  {
    id: 'editorial',
    name: '青黛朱砂',
    colors: {
      body: '#34404a',
      heading: '#193549',
      accent: '#b04432',
      muted: '#59656e',
      background: '#f7f0e9',
    },
  },
  {
    id: 'ink',
    name: '素纸墨灰',
    colors: {
      body: '#343434',
      heading: '#222222',
      accent: '#525252',
      muted: '#626262',
      background: '#f4f4f2',
    },
  },
  {
    id: 'warm-gold',
    name: '燕麦暖金',
    colors: {
      body: '#403b35',
      heading: '#4b3d2c',
      accent: '#8a652d',
      muted: '#6f6252',
      background: '#f7f2e8',
    },
  },
  {
    id: 'rose-news',
    name: '玫瑰晨报',
    colors: {
      body: '#3e3437',
      heading: '#632f42',
      accent: '#9e3951',
      muted: '#70545e',
      background: '#faf0ef',
    },
  },
  {
    id: 'coffee',
    name: '摩卡手札',
    colors: {
      body: '#403932',
      heading: '#4e382b',
      accent: '#88612f',
      muted: '#706255',
      background: '#f7f2eb',
    },
  },
  {
    id: 'burgundy',
    name: '酒红墨金',
    colors: {
      body: '#44373b',
      heading: '#6b293e',
      accent: '#856020',
      muted: '#715b62',
      background: '#f8f1eb',
    },
  },
  {
    id: 'teal',
    name: '松间青绿',
    colors: {
      body: '#30413b',
      heading: '#164b3b',
      accent: '#26745c',
      muted: '#536b60',
      background: '#edf5ee',
    },
  },
  {
    id: 'celadon',
    name: '雨后青瓷',
    colors: {
      body: '#34423e',
      heading: '#245549',
      accent: '#416e5b',
      muted: '#58695e',
      background: '#eef5ef',
    },
  },
  {
    id: 'olive',
    name: '橄榄手记',
    colors: {
      body: '#3e4034',
      heading: '#444b2a',
      accent: '#687126',
      muted: '#656950',
      background: '#f4f5e9',
    },
  },
  {
    id: 'ocean',
    name: '雾海蓝调',
    colors: {
      body: '#34404a',
      heading: '#234a60',
      accent: '#306e86',
      muted: '#546a75',
      background: '#edf4f7',
    },
  },
  {
    id: 'clear-blue',
    name: '澄空科技',
    colors: {
      body: '#303b4b',
      heading: '#12366a',
      accent: '#245cce',
      muted: '#526580',
      background: '#eef4ff',
    },
  },
  {
    id: 'aurora',
    name: '极光青紫',
    colors: {
      body: '#353950',
      heading: '#493a7a',
      accent: '#087783',
      muted: '#59627b',
      background: '#f0f5fa',
    },
  },
  {
    id: 'indigo',
    name: '靛蓝档案',
    colors: {
      body: '#373d4b',
      heading: '#2d386c',
      accent: '#4a55a0',
      muted: '#5d657c',
      background: '#f0f2fa',
    },
  },
  {
    id: 'violet',
    name: '鸢尾来信',
    colors: {
      body: '#41384b',
      heading: '#55416f',
      accent: '#795396',
      muted: '#70617c',
      background: '#f6f0fa',
    },
  },
  {
    id: 'cobalt-lime',
    name: '蓝柠撞色',
    colors: {
      body: '#353d46',
      heading: '#2449a6',
      accent: '#66751b',
      muted: '#62694b',
      background: '#f5f8df',
    },
  },
  {
    id: 'orange',
    name: '落日橘蓝',
    colors: {
      body: '#3d3c42',
      heading: '#23466c',
      accent: '#b84c25',
      muted: '#6f5d56',
      background: '#fff2e9',
    },
  },
  {
    id: 'retro',
    name: '复古棕绿',
    colors: {
      body: '#403b34',
      heading: '#774b35',
      accent: '#526b45',
      muted: '#716455',
      background: '#f5f1e8',
    },
  },
  {
    id: 'berry',
    name: '玫瑰莓紫',
    colors: {
      body: '#413640',
      heading: '#733b62',
      accent: '#aa3562',
      muted: '#76576c',
      background: '#fbf0f5',
    },
  },
]

export const presets: ColorPreset[] = originalPresets.map((preset) => ({
  ...preset,
  custom: false,
}))

export function defaultPalettes(): ColorPreset[] {
  return presets.map((preset) => ({ ...preset, colors: { ...preset.colors } }))
}

export const maxPalettes = 24

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
    chapterDecorationTight: config.chapterDecorationTight ?? true,
    chapterAlignment: config.chapterAlignment ?? 'left',
    chapterStyle: ['box', 'overline', 'quote'].includes(config.chapterStyle)
      ? 'bar'
      : config.chapterStyle,
    palettes: config.palettes ?? defaultPalettes(),
    cardSymbol: config.cardSymbol ?? 'spark',
    cardBrand: config.cardBrand ?? '',
  }
}

export function defaultTypesetting(): TypesettingConfig {
  return {
    preset: defaultPresetId,
    colors: { ...presets.find((preset) => preset.id === defaultPresetId)!.colors },
    chapterStyle: 'editorial',
    chapterNumberEnabled: true,
    chapterDecorationTight: true,
    chapterAlignment: 'left',
    palettes: defaultPalettes(),
    fontSize: 16,
    lineHeight: 1.9,
    paragraphGap: 18,
    letterSpacing: 0.5,
    font: 'default',
    backgroundEnabled: true,
    cardSymbol: 'spark',
    cardBrand: '',
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

function readableCodeColor(preferred: string, fallback: string, background: string): string {
  for (const color of [preferred, fallback]) {
    if (contrastRatio(color, background) >= 4.5) {
      return color
    }
  }
  return contrastRatio('#000000', background) >= contrastRatio('#ffffff', background)
    ? '#000000'
    : '#ffffff'
}

function mixCodeBorder(accent: string, background: string): string {
  const channels = [1, 3, 5].map(function channel(index) {
    const foreground = parseInt(accent.slice(index, index + 2), 16)
    const base = parseInt(background.slice(index, index + 2), 16)
    return Math.round(foreground * 0.22 + base * 0.78)
      .toString(16)
      .padStart(2, '0')
  })
  return '#' + channels.join('')
}

function chapterDecoration(style: ChapterStyle, accent: string, trailing = false): HTMLElement {
  const decoration = document.createElement('span')
  decoration.dataset.decoration = 'true'
  decoration.style.cssText = `display:inline-block;flex-shrink:0;color:${accent};font-weight:bold;line-height:1;`
  if (style === 'bar' || style === 'thick-bar') {
    decoration.style.cssText += `width:${style === 'bar' ? 4 : 8}px;height:1.2em;background-color:${accent};`
  } else if (style === 'dots') {
    decoration.style.width = '9px'
    for (let row = 0; row < 3; row++) {
      const line = document.createElement('span')
      line.style.cssText = `display:block;line-height:0;${row ? 'margin-top:2px;' : ''}`
      for (let column = 0; column < 2; column++) {
        const dot = document.createElement('span')
        dot.style.cssText = `display:inline-block;width:3px;height:3px;border-radius:50%;background-color:${accent};${column ? 'margin-left:3px;' : ''}`
        line.append(dot)
      }
      decoration.append(line)
    }
  } else {
    decoration.textContent =
      style === 'slash' ? '//' : style === 'bracket' ? (trailing ? ']' : '[') : '◎'
  }
  return decoration
}

function decorateChapter(
  heading: HTMLElement,
  style: ChapterStyle,
  number: number,
  config: TypesettingConfig,
): void {
  const { accent } = config.colors
  heading.style.textAlign = config.chapterAlignment
  const content = document.createElement('span')
  content.style.cssText = 'display:block;min-width:0;overflow-wrap:anywhere;'
  content.append(...heading.childNodes)
  const labelInk = contrastRatio(accent, '#ffffff') >= 4.5 ? '#ffffff' : '#000000'
  if (config.chapterNumberEnabled) {
    const sequence = document.createElement('span')
    sequence.dataset.decoration = 'true'
    sequence.textContent = String(number).padStart(2, '0')
    sequence.style.color = accent
    sequence.style.marginRight = '0.5em'
    if (style === 'editorial') {
      sequence.style.cssText += `font-family:Georgia,serif;font-size:1.25em;font-weight:normal;`
    } else if (style === 'label') {
      sequence.style.color = labelInk
    }
    content.prepend(sequence)
  }
  if (['editorial', 'label', 'frame', 'minimal'].includes(style)) {
    const plate = document.createElement('span')
    plate.style.cssText =
      'display:inline-block;max-width:100%;box-sizing:border-box;vertical-align:top;'
    if (!config.chapterDecorationTight) {
      plate.style.width = '100%'
    }
    if (style === 'editorial') {
      plate.style.cssText += `border-bottom:1px solid ${accent};padding:0 0 9px;`
      content.style.fontFamily = 'Georgia,"Noto Serif CJK SC","Songti SC",SimSun,serif'
    } else if (style === 'label') {
      plate.style.cssText += `background-color:${accent};color:${labelInk};padding:7px 13px;border-radius:3px;`
    } else if (style === 'frame') {
      plate.style.cssText += `border-top:2px solid ${accent};border-bottom:1px solid ${accent};padding:9px 2px;`
    } else {
      plate.style.cssText += `border-left:1px solid ${accent};padding:0 0 0 12px;`
      content.style.fontWeight = '500'
    }
    plate.append(content)
    heading.style.paddingBottom = '0'
    heading.append(plate)
    return
  }
  if (style === 'underline' || style === 'thick-underline') {
    const underlineTarget = config.chapterDecorationTight ? content : heading
    if (config.chapterDecorationTight) {
      content.style.display = 'inline-block'
      content.style.maxWidth = '100%'
      content.style.boxSizing = 'border-box'
      content.style.verticalAlign = 'top'
      content.style.paddingBottom = heading.style.paddingBottom
      heading.style.paddingBottom = '0'
    }
    underlineTarget.style.borderBottom = `${style === 'underline' ? 2 : 5}px solid ${accent}`
    heading.append(content)
    return
  }
  const group = document.createElement('span')
  group.style.cssText =
    'display:inline-flex;align-items:center;gap:12px;max-width:100%;vertical-align:middle;box-sizing:border-box;'
  if (!config.chapterDecorationTight) {
    group.style.width = '100%'
    content.style.flex = '1'
  }
  if (style !== 'slash') {
    group.append(chapterDecoration(style, accent))
  }
  group.append(content)
  if (['slash', 'bracket', 'circles', 'dots'].includes(style)) {
    group.append(chapterDecoration(style, accent, true))
  }
  heading.append(group)
}

export function chapterPreview(style: ChapterStyle, config: TypesettingConfig): string {
  const heading = document.createElement('span')
  heading.textContent = '阅读的节奏'
  heading.style.cssText = `display:block;color:${config.colors.heading};font-size:15px;line-height:24px;font-weight:bold;padding-bottom:4px;`
  decorateChapter(heading, style, 1, config)
  return heading.outerHTML
}

export function styleArticle(root: HTMLElement, config: TypesettingConfig, numbered = true): void {
  const { colors, fontSize, lineHeight, paragraphGap, letterSpacing } = config
  const codeText = readableCodeColor(colors.body, colors.heading, colors.background)
  const inlineCodeText = readableCodeColor(colors.accent, colors.body, colors.background)
  const codeBorder = mixCodeBorder(colors.accent, colors.background)
  root.style.cssText = `color:${colors.body};font-size:${fontSize}px;line-height:${fontSize * lineHeight}px;letter-spacing:${letterSpacing}px;word-wrap:break-word;text-align:left;`
  if (config.font !== 'default') {
    root.style.fontFamily =
      config.font === 'sans'
        ? '"Microsoft YaHei", "Noto Sans CJK SC", sans-serif'
        : '"Noto Serif CJK SC", "Songti SC", serif'
  }
  const headingElements = [...root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6')].filter(
    (heading) => !heading.closest('[data-card]'),
  )
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
      element.style.cssText = `color:${colors.heading};font-size:${size}px;line-height:${size * 1.5}px;font-weight:bold;margin:26px 0 14px;padding-bottom:6px;`
      if (level === 1) {
        element.style.cssText += `line-height:1.4;letter-spacing:0.02em;padding-bottom:16px;border-bottom:1px solid ${colors.background};`
        if (element === root.firstElementChild) {
          element.style.marginTop = '0'
        }
      }
      if (numbered && level === chapterLevel && !element.closest('[data-card]')) {
        decorateChapter(element, config.chapterStyle, ++chapter, config)
      }
    } else if (tag === 'strong') {
      element.style.cssText = `color:${element.closest('h1,h2,h3,h4,h5,h6') ? 'inherit' : colors.accent};font-weight:bold;`
    } else if (tag === 'blockquote') {
      element.style.cssText = `border-left:2px solid ${colors.accent};padding:12px 16px;margin:18px 0;color:${colors.muted};border-radius:0 4px 4px 0;`
      if (config.backgroundEnabled) {
        element.style.backgroundColor = colors.background
      }
    } else if (tag === 'pre') {
      element.style.cssText = `padding:16px 18px 18px;margin:24px 0;background-color:${colors.background};color:${codeText};border:1px solid ${codeBorder};border-top:2px solid ${colors.accent};border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px;line-height:24px;`
      const chrome = document.createElement('span')
      chrome.dataset.decoration = 'true'
      chrome.style.cssText = 'display:block;margin-bottom:12px;line-height:12px;'
      for (const color of [colors.accent, colors.heading, colors.muted]) {
        const dot = document.createElement('span')
        dot.style.cssText = `display:inline-block;width:9px;height:9px;margin-right:6px;border-radius:50%;background-color:${color};`
        chrome.append(dot)
      }
      element.prepend(chrome)
    } else if (tag === 'code') {
      element.style.fontFamily = 'monospace'
      if (element.parentElement?.tagName === 'PRE') {
        element.style.cssText +=
          'display:block;color:inherit;background-color:transparent;font-size:inherit;line-height:inherit;white-space:inherit;padding:0;margin:0;'
      } else if (element.closest('h1,h2,h3,h4,h5,h6')) {
        element.style.color = 'inherit'
      } else {
        element.style.cssText += `color:${inlineCodeText};background-color:${colors.background};padding:2px 5px;border-radius:3px;`
      }
    } else if (tag === 'table') {
      element.style.cssText = `width:100%;table-layout:fixed;border-collapse:collapse;font-size:${Math.max(14, fontSize - 1)}px;line-height:${fontSize * lineHeight}px;margin:20px 0;`
    } else if (tag === 'th' || tag === 'td') {
      const align = element.style.textAlign || 'left'
      element.style.cssText = `border-bottom:1px solid #d9dce5;padding:10px 8px;overflow-wrap:anywhere;text-align:${align};`
      if (tag === 'th') {
        element.style.color = colors.heading
        element.style.fontWeight = 'bold'
        element.style.backgroundColor = colors.background
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
      element.style.cssText = `color:${element.closest('h1,h2,h3,h4,h5,h6') ? 'inherit' : colors.accent};text-decoration:underline;overflow-wrap:anywhere;`
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noopener noreferrer')
    } else if (tag === 'hr') {
      element.style.cssText = `border:0;border-top:1px solid ${colors.accent};margin:28px 0;`
    }
  }
  for (const paragraph of root.querySelectorAll<HTMLElement>(
    'blockquote > p:last-child,li > p:last-child',
  )) {
    paragraph.style.marginBottom = '0'
  }
  styleCards(root, config)
}

function styleCards(root: HTMLElement, config: TypesettingConfig): void {
  const { colors, fontSize } = config
  const surface = '#ffffff'
  const border = mixCodeBorder(colors.accent, colors.background)
  const accent = readableCodeColor(colors.accent, colors.heading, colors.background)
  for (const card of root.querySelectorAll<HTMLElement>('[data-card]')) {
    card.style.cssText = `box-sizing:border-box;max-width:100%;min-width:0;overflow-wrap:anywhere;word-break:break-word;margin:0 0 28px;border:1px solid ${border};border-radius:14px;overflow:hidden;`
    if (card.dataset.card === 'hero') {
      card.style.cssText += `background-color:${surface};box-shadow:0 4px 16px ${border}55;`
      const eyebrow = card.querySelector<HTMLElement>(':scope > [data-card-part="eyebrow"]')
      const symbol = cardSymbols.find(([id]) => id === config.cardSymbol)?.[1] || ''
      let masthead: HTMLElement | undefined
      if (eyebrow || symbol) {
        masthead = document.createElement('section')
        masthead.style.cssText = `display:flex;align-items:center;gap:10px;padding:12px 18px;background-color:${colors.background};border-bottom:1px solid ${border};`
        if (symbol) {
          const mark = document.createElement('span')
          mark.dataset.decoration = 'true'
          mark.textContent = symbol
          mark.style.cssText = `display:inline-block;flex-shrink:0;font-family:Georgia,serif;font-size:22px;line-height:1;color:${accent};`
          masthead.append(mark)
        }
        if (eyebrow) {
          eyebrow.style.cssText = `flex:1;min-width:0;margin:0;color:${accent};font-size:${Math.max(11, fontSize - 3)}px;font-weight:bold;line-height:1.6;letter-spacing:0.08em;`
          masthead.append(eyebrow)
        }
        card.prepend(masthead)
      }
      const content = document.createElement('section')
      content.style.cssText = 'padding:24px 20px 22px;min-width:0;'
      for (const child of [...card.children]) {
        if (child !== masthead) content.append(child)
      }
      card.append(content)
      const title = content.querySelector<HTMLElement>('[data-card-part="title"]')
      if (title) {
        const size = fontSize + 10
        title.style.cssText = `color:${readableCodeColor(colors.heading, colors.body, surface)};font-size:${size}px;line-height:1.45;font-weight:800;letter-spacing:0.01em;margin:0 0 14px;padding:0;border:0;`
      }
      const last = content.lastElementChild as HTMLElement | null
      if (last) last.style.marginBottom = '0'
      if (config.cardBrand.trim()) {
        const footer = document.createElement('p')
        footer.dataset.cardBrand = 'true'
        footer.textContent = config.cardBrand.trim()
        footer.style.cssText = `margin:0;padding:10px 18px;text-align:right;background-color:${colors.background};border-top:1px solid ${border};color:${readableCodeColor(colors.muted, colors.body, colors.background)};font-size:${Math.max(11, fontSize - 3)}px;font-weight:bold;line-height:1.6;letter-spacing:0.06em;`
        card.append(footer)
      }
    } else {
      card.style.cssText += `padding:18px;background-color:${colors.background};background-image:linear-gradient(180deg,${colors.background},${surface});color:${readableCodeColor(colors.body, colors.heading, colors.background)};`
      const title = card.querySelector<HTMLElement>(':scope > [data-card-part="summary-title"]')
      if (title) {
        title.style.cssText = `margin:0 0 14px;color:${readableCodeColor(colors.heading, colors.body, colors.background)};font-size:${fontSize + 1}px;font-weight:800;line-height:1.6;`
      }
      for (const list of card.querySelectorAll<HTMLElement>(':scope > ul,:scope > ol')) {
        list.style.cssText = 'list-style:none;margin:12px 0 0;padding:0;'
        const start = Number(list.getAttribute('start') || '1')
        for (const [index, item] of [...list.children].entries()) {
          if (!(item instanceof HTMLElement) || item.tagName !== 'LI') continue
          item.style.cssText = `display:flex;align-items:flex-start;gap:10px;margin:0 0 9px;padding:11px 12px;border:1px solid ${border};border-radius:8px;background-color:${surface};color:${readableCodeColor(colors.body, colors.heading, surface)};line-height:1.8;list-style:none;`
          const marker = document.createElement('span')
          marker.dataset.decoration = 'true'
          marker.textContent = list.tagName === 'OL' ? String(start + index) : '✓'
          const markerInk = contrastRatio(colors.accent, surface) >= 4.5 ? surface : '#000000'
          marker.style.cssText = `display:inline-block;flex-shrink:0;min-width:20px;padding:0 3px;box-sizing:border-box;margin-top:3px;text-align:center;border-radius:12px;background-color:${colors.accent};color:${markerInk};font-size:12px;line-height:20px;font-weight:bold;`
          const content = document.createElement('section')
          content.style.cssText = 'flex:1;min-width:0;overflow-wrap:anywhere;'
          content.append(...item.childNodes)
          item.append(marker, content)
        }
        const last = list.lastElementChild as HTMLElement | null
        if (last) last.style.marginBottom = '0'
      }
    }
  }
}
