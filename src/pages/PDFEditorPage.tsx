import { useState } from 'react'
import PDFViewer from '../components/pdf/PDFViewer'
import AnnotationTools from '../components/annotation/AnnotationTools'

export default function PDFEditorPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setPdfUrl(URL.createObjectURL(file))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">PDF Editor</h1>
          <p className="text-gray-400 mt-2">
            Upload a character sheet PDF, annotate it, and use OCR to auto-populate data
          </p>
        </div>
      </div>

      {/* File Upload */}
      {!pdfUrl && (
        <div className="mt-8">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-12 h-12 mb-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF files only</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      {/* PDF Viewer and Annotation Tools */}
      {pdfUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Annotation Tools Sidebar */}
          <div className="lg:col-span-1">
            <AnnotationTools />
          </div>

          {/* PDF Viewer */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {pdfFile?.name}
                </h2>
                <button
                  onClick={() => {
                    setPdfFile(null)
                    setPdfUrl(null)
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <PDFViewer pdfUrl={pdfUrl} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
