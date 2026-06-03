'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import type { CropArea } from '@/lib/cropImage'

interface Props {
  imageSrc: string
  onConfirm: (area: CropArea) => void
  onCancel: () => void
}

export default function AvatarCropModal({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">

        {/* Crop area */}
        <div className="relative bg-black" style={{ height: 320 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-6 pt-5 pb-6 space-y-5">
          {/* Zoom slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Zoom</span>
              <span>{zoom.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="w-full accent-orange-500"
              aria-label="Zoom"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => croppedAreaPixels && onConfirm(croppedAreaPixels)}
              disabled={!croppedAreaPixels}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
