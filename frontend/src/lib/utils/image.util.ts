type LogoOpts = { size?: number; quality?: number } // size px, quality 0..1

async function loadBitmap(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  // Prefer auto-orientation if supported
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(blob, { imageOrientation: 'from-image' as any })
    } catch {
      // fall through
    }
  }
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

function coverCropParams(w: number, h: number) {
  const s = Math.min(w, h)
  const sx = Math.floor((w - s) / 2)
  const sy = Math.floor((h - s) / 2)
  return { sx, sy, s }
}

export async function toLogoWebP96(input: Blob, opts: LogoOpts = {}): Promise<Blob> {
  const size = opts.size ?? 96
  const quality = opts.quality ?? 0.86

  const src = await loadBitmap(input)
  const w = (src as any).width as number
  const h = (src as any).height as number

  const { sx, sy, s } = coverCropParams(w, h)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { alpha: true })!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if ('drawImage' in ctx) {
    ctx.drawImage(src as any, sx, sy, s, s, 0, 0, size, size)
  }

  // Prefer native WebP; fallback to PNG if WebP unsupported (rare)
  const type = 'image/webp'
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, type, quality))

  if (blob) return blob

  const png: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/png'))
  if (!png) throw new Error('toBlob failed')
  return png
}
