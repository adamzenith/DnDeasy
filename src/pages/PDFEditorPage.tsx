import { useState } from 'react'
import PDFViewer from '../components/pdf/PDFViewer'
import AnnotationTools from '../components/annotation/AnnotationTools'
import OCRMatchResults from '../components/ocr/OCRMatchResults'
import CharacterSelector from '../components/character/CharacterSelector'
import { AnnotationMode, OCRMatchResult } from '../components/annotation/AnnotationCanvas'
import { contentService } from '../services/database'

export default function PDFEditorPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>(null)
  const [ocrResults, setOcrResults] = useState<OCRMatchResult[]>([])
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setPdfUrl(URL.createObjectURL(file))
    }
  }

  const handleOCRResult = (result: OCRMatchResult) => {
    setOcrResults(prev => [result, ...prev])
  }

  const handleAddToCharacter = async (match: OCRMatchResult['matches'][0]) => {
    if (!selectedCharacterId) {
      alert('Please select or create a character first')
      return
    }

    try {
      const character = await contentService.getCharacter(selectedCharacterId)
      if (!character) {
        alert('Character not found')
        return
      }

      // Add content to character based on type
      switch (match.type) {
        case 'spell':
          // Convert spell to CharacterSpell format
          character.spells = [
            ...(character.spells || []),
            {
              name: match.data.name,
              level: match.data.level,
              school: match.data.school,
              prepared: false,
            },
          ]
          break
        case 'item':
          // Convert item to EquipmentItem format
          character.equipment = [
            ...(character.equipment || []),
            {
              name: match.data.name,
              quantity: 1,
              weight: match.data.weight,
              equipped: false,
            },
          ]
          break
        case 'feat':
          // Convert feat to Feature format
          character.features = [
            ...(character.features || []),
            {
              name: match.data.name,
              source: match.data.source || 'Unknown',
              description: match.data.entries?.join('\n') || '',
            },
          ]
          break
      }

      await contentService.updateCharacter(selectedCharacterId, character)
      alert(`Added ${match.name} to character!`)
    } catch (error) {
      console.error('Failed to add to character:', error)
      alert('Failed to add to character')
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
        {pdfUrl && (
          <button
            onClick={() => {
              setPdfFile(null)
              setPdfUrl(null)
              setOcrResults([])
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Close PDF
          </button>
        )}
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

          {/* Sample PDF for testing */}
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Don't have a PDF?</h3>
            <p className="text-gray-400 text-sm mb-3">
              Download a blank D&D character sheet to try out the annotation and OCR features.
            </p>
            <a
              href="https://media.wizards.com/2022/dnd/downloads/DnD_5E_CharacterSheet_FormFillable.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
            >
              Download Official Character Sheet
            </a>
          </div>
        </div>
      )}

      {/* PDF Viewer with Tools and Results */}
      {pdfUrl && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Annotation Tools Sidebar */}
          <div className="xl:col-span-3">
            <div className="sticky top-4 space-y-4">
              <CharacterSelector
                selectedCharacterId={selectedCharacterId}
                onSelect={setSelectedCharacterId}
              />
              <AnnotationTools
                activeMode={annotationMode}
                onModeChange={setAnnotationMode}
              />
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="xl:col-span-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{pdfFile?.name}</h2>
              </div>
              <PDFViewer
                pdfUrl={pdfUrl}
                annotationMode={annotationMode}
                onOCRResult={handleOCRResult}
              />
            </div>
          </div>

          {/* OCR Results Sidebar */}
          <div className="xl:col-span-3">
            <div className="sticky top-4">
              <OCRMatchResults results={ocrResults} onAddToCharacter={handleAddToCharacter} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
