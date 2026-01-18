/**
 * OCR service using Tesseract.js
 * Extracts text from PDF regions for auto-population
 */

import { createWorker, Worker } from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
}

export interface OCRRegion {
  x: number
  y: number
  width: number
  height: number
}

export class OCRService {
  private worker: Worker | null = null
  private isInitialized = false

  /**
   * Initialize Tesseract worker
   */
  async initialize() {
    if (this.isInitialized) return

    this.worker = await createWorker('eng')
    this.isInitialized = true
  }

  /**
   * Perform OCR on image data
   */
  async recognize(imageData: string | ImageData | HTMLCanvasElement): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize()
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized')
    }

    const result = await this.worker.recognize(imageData)

    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence / 100,
    }
  }

  /**
   * Extract text from a specific region of a canvas
   */
  async recognizeRegion(
    canvas: HTMLCanvasElement,
    region: OCRRegion
  ): Promise<OCRResult> {
    // Create a temporary canvas with just the region
    const regionCanvas = document.createElement('canvas')
    regionCanvas.width = region.width
    regionCanvas.height = region.height

    const ctx = regionCanvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Draw the region onto the temporary canvas
    ctx.drawImage(
      canvas,
      region.x,
      region.y,
      region.width,
      region.height,
      0,
      0,
      region.width,
      region.height
    )

    return this.recognize(regionCanvas)
  }

  /**
   * Clean up worker
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
      this.isInitialized = false
    }
  }
}

export const ocrService = new OCRService()
