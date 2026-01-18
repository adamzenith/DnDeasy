import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import AnnotationCanvas, { AnnotationMode, OCRMatchResult } from '../annotation/AnnotationCanvas'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
  pdfUrl: string
  annotationMode?: AnnotationMode
  onOCRResult?: (result: OCRMatchResult) => void
}

export default function PDFViewer({ pdfUrl, annotationMode, onOCRResult }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const pageContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get the PDF canvas after page renders
    if (pageContainerRef.current) {
      const canvas = pageContainerRef.current.querySelector('canvas')
      if (canvas) {
        pdfCanvasRef.current = canvas
      }
    }
  }, [pageNumber, scale])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1))
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2.0))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5))
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-gray-900 p-3 rounded-lg">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-white text-sm">
            Page {pageNumber} of {numPages || '?'}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            -
          </button>
          <span className="text-white text-sm">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            +
          </button>
        </div>
      </div>

      {/* PDF Document with Annotation Layer */}
      <div className="flex justify-center bg-gray-700 rounded-lg p-4 overflow-auto max-h-[800px]">
        <div ref={pageContainerRef} className="relative">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="text-white p-8">Loading PDF...</div>
            }
            error={
              <div className="text-red-500 p-8">
                Failed to load PDF. Please try again.
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
          {pdfCanvasRef.current && (
            <AnnotationCanvas
              pdfCanvas={pdfCanvasRef.current}
              mode={annotationMode || null}
              onOCRResult={onOCRResult}
            />
          )}
        </div>
      </div>
    </div>
  )
}
