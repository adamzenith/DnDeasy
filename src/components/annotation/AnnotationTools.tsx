import { useState } from 'react'

type AnnotationMode = 'select' | 'draw' | 'highlight' | 'ocr' | null

export default function AnnotationTools() {
  const [activeMode, setActiveMode] = useState<AnnotationMode>(null)

  const tools = [
    {
      id: 'select' as AnnotationMode,
      name: 'Select',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
      description: 'Select and move annotations',
    },
    {
      id: 'draw' as AnnotationMode,
      name: 'Draw',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      description: 'Draw shapes and boxes',
    },
    {
      id: 'highlight' as AnnotationMode,
      name: 'Highlight',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Highlight text',
    },
    {
      id: 'ocr' as AnnotationMode,
      name: 'OCR',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      description: 'Extract text with OCR',
    },
  ]

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white">Annotation Tools</h3>

      <div className="space-y-2">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveMode(tool.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              activeMode === tool.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex-shrink-0">
              {tool.icon}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{tool.name}</div>
              <div className="text-xs opacity-75">{tool.description}</div>
            </div>
          </button>
        ))}
      </div>

      {activeMode === 'ocr' && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <h4 className="text-sm font-semibold text-white mb-2">OCR Mode</h4>
          <p className="text-xs text-gray-400 mb-3">
            Draw a box around text to extract it and match with D&D content.
          </p>
          <button className="w-full px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm">
            Process Region
          </button>
        </div>
      )}

      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-white mb-2">Quick Actions</h4>
        <div className="space-y-2">
          <button className="w-full px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm">
            Clear All Annotations
          </button>
          <button className="w-full px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm">
            Export Data
          </button>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-sm font-semibold text-white mb-2">Recent Matches</h4>
        <p className="text-xs text-gray-500">No OCR matches yet</p>
      </div>
    </div>
  )
}
