export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function cropImage(imageSrc: string, crop: CropArea, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = crop.width
      canvas.height = crop.height
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not available')); return }
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Failed to encode image')),
        'image/jpeg',
        quality,
      )
    }

    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = imageSrc
  })
}
