import { useEffect, useRef, useState } from 'react'
import { Canvas, Rect, Text, TEvent } from 'fabric'
import { ocrService, OCRRegion } from '../../services/ocr'
import { spellSearch, itemSearch, featSearch } from '../../services/fuzzySearch'
import type { ContentType } from '../../types/dnd'

export type AnnotationMode = 'select' | 'draw' | 'highlight' | 'ocr' | null

interface AnnotationCanvasProps {
  pdfCanvas?: HTMLCanvasElement
  mode: AnnotationMode
  onOCRResult?: (result: OCRMatchResult) => void
}

export interface OCRMatchResult {
  text: string
  confidence: number
  matches: Array<{
    type: ContentType
    name: string
    score: number
    data: any
  }>
}

export default function AnnotationCanvas({ pdfCanvas, mode, onOCRResult }: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<Canvas | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentRect, setCurrentRect] = useState<Rect | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Fabric canvas
    const canvas = new Canvas(canvasRef.current, {
      isDrawingMode: false,
      selection: mode === 'select',
    })

    fabricCanvasRef.current = canvas

    // Match PDF dimensions
    if (pdfCanvas) {
      canvas.setWidth(pdfCanvas.width)
      canvas.setHeight(pdfCanvas.height)
    }

    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [pdfCanvas])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    // Update canvas mode
    canvas.isDrawingMode = mode === 'draw' || mode === 'highlight'
    canvas.selection = mode === 'select'

    if (mode === 'draw' && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = '#3b82f6'
      canvas.freeDrawingBrush.width = 3
    } else if (mode === 'highlight' && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = 'rgba(251, 191, 36, 0.4)'
      canvas.freeDrawingBrush.width = 20
    } else if (mode === 'ocr') {
      setupOCRMode(canvas)
    }
  }, [mode])

  const setupOCRMode = (canvas: Canvas) => {
    let isDrawing = false
    let startX = 0
    let startY = 0

    const handleMouseDown = (opt: TEvent) => {
      if (!opt.e) return
      isDrawing = true
      const pointer = canvas.getPointer(opt.e)
      startX = pointer.x
      startY = pointer.y

      const rect = new Rect({
        left: startX,
        top: startY,
        width: 0,
        height: 0,
        fill: 'rgba(59, 130, 246, 0.2)',
        stroke: '#3b82f6',
        strokeWidth: 2,
        selectable: false,
      })

      canvas.add(rect)
      setCurrentRect(rect)
    }

    const handleMouseMove = (opt: TEvent) => {
      if (!isDrawing || !currentRect || !opt.e) return
      const pointer = canvas.getPointer(opt.e)

      const width = pointer.x - startX
      const height = pointer.y - startY

      currentRect.set({
        width: Math.abs(width),
        height: Math.abs(height),
        left: width < 0 ? pointer.x : startX,
        top: height < 0 ? pointer.y : startY,
      })

      canvas.renderAll()
    }

    const handleMouseUp = async () => {
      if (!isDrawing || !currentRect) return
      isDrawing = false

      // Extract OCR region
      const region: OCRRegion = {
        x: currentRect.left || 0,
        y: currentRect.top || 0,
        width: currentRect.width || 0,
        height: currentRect.height || 0,
      }

      // Validate region size
      if (region.width < 10 || region.height < 10) {
        canvas.remove(currentRect)
        setCurrentRect(null)
        return
      }

      // Process OCR
      await processOCRRegion(region, canvas)
    }

    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)

    // Cleanup
    return () => {
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)
    }
  }

  const processOCRRegion = async (region: OCRRegion, canvas: Canvas) => {
    if (!pdfCanvas) return

    setIsProcessing(true)

    try {
      // Initialize OCR if needed
      await ocrService.initialize()

      // Perform OCR on the region
      const ocrResult = await ocrService.recognizeRegion(pdfCanvas, region)

      console.log('OCR Result:', ocrResult.text, 'Confidence:', ocrResult.confidence)

      // Search for matches in D&D content
      const matches = await findContentMatches(ocrResult.text)

      // Add label to annotation
      if (currentRect) {
        const label = new Text(ocrResult.text, {
          left: (currentRect.left || 0) + 5,
          top: (currentRect.top || 0) - 20,
          fontSize: 14,
          fill: '#3b82f6',
          backgroundColor: 'white',
          selectable: false,
        })
        canvas.add(label)
      }

      // Notify parent component
      if (onOCRResult) {
        onOCRResult({
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          matches,
        })
      }

      setCurrentRect(null)
    } catch (error) {
      console.error('OCR processing failed:', error)
      // Remove rectangle on error
      if (currentRect) {
        canvas.remove(currentRect)
        setCurrentRect(null)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const findContentMatches = async (text: string) => {
    const matches: OCRMatchResult['matches'] = []

    // Search spells
    const spellResults = spellSearch.search(text, 3)
    spellResults.forEach(result => {
      matches.push({
        type: 'spell',
        name: result.item.name,
        score: 1 - (result.score || 0),
        data: result.item,
      })
    })

    // Search items
    const itemResults = itemSearch.search(text, 3)
    itemResults.forEach(result => {
      matches.push({
        type: 'item',
        name: result.item.name,
        score: 1 - (result.score || 0),
        data: result.item,
      })
    })

    // Search feats
    const featResults = featSearch.search(text, 3)
    featResults.forEach(result => {
      matches.push({
        type: 'feat',
        name: result.item.name,
        score: 1 - (result.score || 0),
        data: result.item,
      })
    })

    // Sort by score
    matches.sort((a, b) => b.score - a.score)

    return matches.slice(0, 5)
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-auto"
        style={{ cursor: mode === 'ocr' ? 'crosshair' : 'default' }}
      />
      {isProcessing && (
        <div className="absolute top-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg">
          Processing OCR...
        </div>
      )}
    </>
  )
}
