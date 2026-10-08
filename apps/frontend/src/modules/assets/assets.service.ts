import type { PreparedAsset, AssetDiagnostic } from './assets.model'

const maxImageBytes = 10 * 1024 * 1024
const imageTypes = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp'])

export function remoteImageUrl(source: string): string | undefined {
  try {
    const url = new URL(source)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined
  } catch {
    return undefined
  }
}

async function imageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(blob)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > 40_000_000
    ) {
      throw new Error('图片尺寸过大或无法读取，请换一张图片。')
    }
    return { width: image.naturalWidth, height: image.naturalHeight }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function prepareAsset(file: File): Promise<PreparedAsset> {
  if (!imageTypes.has(file.type) || file.size > maxImageBytes || file.size === 0) {
    throw new Error('请选择不超过 10 MB 的 PNG、JPEG、GIF 或 WebP 图片。')
  }
  const dimensions = await imageDimensions(file)
  return { id: crypto.randomUUID(), name: file.name, mime: file.type, blob: file, ...dimensions }
}

export function createAssetUrls(assets: PreparedAsset[]): Map<string, string> {
  return new Map(assets.map((asset) => [asset.id, URL.createObjectURL(asset.blob)]))
}

export function releaseAssetUrls(urls: Map<string, string>): void {
  for (const url of urls.values()) {
    URL.revokeObjectURL(url)
  }
}

export function resolvePreviewImages(
  root: HTMLElement,
  urls: Map<string, string>,
): AssetDiagnostic[] {
  const diagnostics: AssetDiagnostic[] = []
  for (const image of root.querySelectorAll<HTMLImageElement>('img[data-image-source]')) {
    const source = image.dataset.imageSource || ''
    const url = source.startsWith('asset:') ? urls.get(source.slice(6)) : remoteImageUrl(source)
    if (url) {
      image.src = url
      image.loading = 'lazy'
      image.referrerPolicy = 'no-referrer'
    } else {
      diagnostics.push({
        source,
        message: `缺少图片：${source}。请插入单张图片替换，或使用 HTTPS 图片地址。`,
        blocking: true,
      })
      const placeholder = document.createElement('p')
      placeholder.textContent = `［图片未找到：${image.alt || source}］`
      placeholder.style.cssText = 'color:#a94e20;border:1px dashed #d7a47c;padding:12px;'
      image.replaceWith(placeholder)
    }
  }
  return diagnostics
}

function blobDataUrl(blob: Blob): Promise<string> {
  return new Promise(function read(resolve, reject) {
    const reader = new FileReader()
    reader.onload = function loaded() {
      resolve(String(reader.result))
    }
    reader.onerror = function failed() {
      reject(new Error('图片转换失败，请重新选择图片。'))
    }
    reader.readAsDataURL(blob)
  })
}

async function exportBlob(blob: Blob): Promise<{ src: string; width: number; height: number }> {
  if (!imageTypes.has(blob.type) || blob.size > maxImageBytes || !blob.size) {
    throw new Error('图片格式或大小不符合要求。')
  }
  const dimensions = await imageDimensions(blob)
  const scale = Math.min(1, 1440 / dimensions.width, 2400 / dimensions.height)
  if (blob.type === 'image/gif') {
    if (scale < 1) {
      throw new Error('GIF 超过 1440×2400，请先缩小或在公众号后台插入，以保留动画。')
    }
    return { src: await blobDataUrl(blob), ...dimensions }
  }
  if (scale === 1 && blob.type !== 'image/webp') {
    return { src: await blobDataUrl(blob), ...dimensions }
  }
  const url = URL.createObjectURL(blob)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(dimensions.width * scale))
    canvas.height = Math.max(1, Math.round(dimensions.height * scale))
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('当前浏览器无法处理图片。')
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return {
      src: canvas.toDataURL(blob.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9),
      width: canvas.width,
      height: canvas.height,
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function prepareExportImages(
  root: HTMLElement,
  assets: PreparedAsset[],
): Promise<AssetDiagnostic[]> {
  const diagnostics: AssetDiagnostic[] = []
  const cache = new Map<string, Awaited<ReturnType<typeof exportBlob>>>()
  for (const image of root.querySelectorAll<HTMLImageElement>('img[data-image-source]')) {
    const source = image.dataset.imageSource || ''
    try {
      let result = cache.get(source)
      if (!result) {
        const local = source.startsWith('asset:')
          ? assets.find((a) => a.id === source.slice(6))
          : undefined
        let blob = local?.blob
        if (!blob) {
          const url = remoteImageUrl(source)
          if (!url) {
            throw new Error('缺少图片文件，请插入单张图片或改用 HTTPS 地址。')
          }
          const response = await fetch(url, {
            signal: AbortSignal.timeout(15_000),
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
          })
          if (!response.ok) {
            throw new Error('远程图片读取失败。')
          }
          if (Number(response.headers.get('content-length')) > maxImageBytes) {
            throw new Error('远程图片超过 10 MB。')
          }
          blob = await response.blob()
        }
        result = await exportBlob(blob)
        cache.set(source, result)
      }
      image.src = result.src
      image.setAttribute('data-w', String(result.width))
      image.setAttribute('width', String(result.width))
      image.setAttribute('height', String(result.height))
    } catch (error) {
      diagnostics.push({
        source,
        message: `图片无法复制：${source}。${error instanceof Error ? error.message : '请重新选择图片。'} 远程图需允许跨域读取。`,
        blocking: true,
      })
    }
  }
  return diagnostics
}
