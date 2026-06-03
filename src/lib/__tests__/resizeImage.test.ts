import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resizeImage } from '@/lib/resizeImage'

// Canvas mock with controllable dimensions
function makeCanvasMock() {
  let capturedWidth = 0
  let capturedHeight = 0
  const ctx = { drawImage: vi.fn() }
  const canvas = {
    get width() { return capturedWidth },
    set width(v: number) { capturedWidth = v },
    get height() { return capturedHeight },
    set height(v: number) { capturedHeight = v },
    getContext: vi.fn(() => ctx),
    toBlob: vi.fn((cb: (b: Blob | null) => void) => {
      cb(new Blob(['img'], { type: 'image/jpeg' }))
    }),
  }
  return { canvas, ctx, get capturedWidth() { return capturedWidth }, get capturedHeight() { return capturedHeight } }
}

function setupImageMock(naturalWidth: number, naturalHeight: number) {
  const { canvas, ctx, ...rest } = makeCanvasMock()
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') return canvas as unknown as HTMLElement
    return document.createElement(tag)
  })
  class MockImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    width = naturalWidth
    height = naturalHeight
    set src(_: string) { setTimeout(() => this.onload?.(), 0) }
  }
  vi.stubGlobal('Image', MockImage)
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:mock'),
    revokeObjectURL: vi.fn(),
  })
  return { canvas, ctx, ...rest }
}

beforeEach(() => { vi.restoreAllMocks() })

describe('resizeImage', () => {
  it('resolves with a Blob', async () => {
    const { canvas } = setupImageMock(800, 600)
    void canvas
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await resizeImage(file, { maxDimension: 1080 })
    expect(result).toBeInstanceOf(Blob)
  })

  it('does not resize an image already within maxDimension', async () => {
    const { canvas } = setupImageMock(500, 400)
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    await resizeImage(file, { maxDimension: 1080 })
    expect(canvas.width).toBe(500)
    expect(canvas.height).toBe(400)
  })

  it('scales down a landscape image by its wider dimension', async () => {
    const { canvas } = setupImageMock(2000, 1000)
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    await resizeImage(file, { maxDimension: 1000 })
    expect(canvas.width).toBe(1000)
    expect(canvas.height).toBe(500)
  })

  it('scales down a portrait image by its taller dimension', async () => {
    const { canvas } = setupImageMock(1000, 2000)
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    await resizeImage(file, { maxDimension: 1000 })
    expect(canvas.width).toBe(500)
    expect(canvas.height).toBe(1000)
  })

  it('preserves aspect ratio on non-even dimensions', async () => {
    const { canvas } = setupImageMock(3000, 2000)
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    await resizeImage(file, { maxDimension: 1080 })
    expect(canvas.width).toBe(1080)
    expect(canvas.height).toBe(720)
  })

  it('rejects when canvas context is unavailable', async () => {
    setupImageMock(800, 600)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return { width: 0, height: 0, getContext: () => null, toBlob: vi.fn() } as unknown as HTMLElement
      }
      return document.createElement(tag)
    })
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    await expect(resizeImage(file, { maxDimension: 1080 })).rejects.toThrow('Canvas not available')
  })
})
