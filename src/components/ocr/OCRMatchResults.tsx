import { useState } from 'react'
import { OCRMatchResult } from '../annotation/AnnotationCanvas'
import type { ContentType } from '../../types/dnd'

interface OCRMatchResultsProps {
  results: OCRMatchResult[]
  onAddToCharacter?: (match: OCRMatchResult['matches'][0]) => void
}

export default function OCRMatchResults({ results, onAddToCharacter }: OCRMatchResultsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  if (results.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <svg
          className="w-16 h-16 mx-auto text-gray-600 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-white mb-2">No OCR Results Yet</h3>
        <p className="text-gray-400 text-sm">
          Select the OCR tool and draw a box around text in your character sheet to extract and match
          content.
        </p>
      </div>
    )
  }

  const getContentTypeColor = (type: ContentType) => {
    switch (type) {
      case 'spell':
        return 'bg-purple-600'
      case 'item':
        return 'bg-amber-600'
      case 'feat':
        return 'bg-green-600'
      case 'monster':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'spell':
        return '✨'
      case 'item':
        return '⚔️'
      case 'feat':
        return '🎯'
      case 'monster':
        return '👹'
      default:
        return '📄'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">OCR Match Results</h3>
        <span className="text-sm text-gray-400">{results.length} results</span>
      </div>

      {results.map((result, resultIndex) => (
        <div key={resultIndex} className="bg-gray-800 rounded-lg overflow-hidden">
          {/* OCR Text Header */}
          <div className="bg-gray-900 px-4 py-3 border-b border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-white font-medium mb-1">"{result.text}"</div>
                <div className="text-xs text-gray-400">
                  Confidence: {Math.round(result.confidence * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Matches */}
          <div className="p-2 space-y-2">
            {result.matches.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">No matches found</div>
            ) : (
              result.matches.map((match, matchIndex) => (
                <div
                  key={matchIndex}
                  className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors"
                >
                  <button
                    onClick={() =>
                      setExpandedIndex(
                        expandedIndex === resultIndex * 100 + matchIndex
                          ? null
                          : resultIndex * 100 + matchIndex
                      )
                    }
                    className="w-full px-4 py-3 text-left flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-2xl">{getContentTypeIcon(match.type)}</span>
                      <div className="flex-1">
                        <div className="text-white font-medium">{match.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`${getContentTypeColor(
                              match.type
                            )} text-white text-xs px-2 py-0.5 rounded uppercase`}
                          >
                            {match.type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {Math.round(match.score * 100)}% match
                          </span>
                        </div>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${
                        expandedIndex === resultIndex * 100 + matchIndex ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Expanded Content */}
                  {expandedIndex === resultIndex * 100 + matchIndex && (
                    <div className="border-t border-gray-600 px-4 py-3 space-y-3">
                      {/* Content Details */}
                      <div className="text-sm text-gray-300">
                        {renderContentDetails(match.type, match.data)}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => onAddToCharacter?.(match)}
                          className="flex-1 px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm font-medium"
                        >
                          Add to Character
                        </button>
                        <button className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm">
                          View Full Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function renderContentDetails(type: ContentType, data: any) {
  switch (type) {
    case 'spell':
      return (
        <div className="space-y-2">
          <div>
            <span className="font-medium">Level:</span> {data.level === 0 ? 'Cantrip' : data.level}
          </div>
          <div>
            <span className="font-medium">School:</span> {data.school}
          </div>
          {data.castingTime && (
            <div>
              <span className="font-medium">Casting Time:</span> {data.castingTime}
            </div>
          )}
          {data.range && (
            <div>
              <span className="font-medium">Range:</span> {data.range}
            </div>
          )}
        </div>
      )
    case 'item':
      return (
        <div className="space-y-2">
          <div>
            <span className="font-medium">Type:</span> {data.type}
          </div>
          {data.rarity && (
            <div>
              <span className="font-medium">Rarity:</span> {data.rarity}
            </div>
          )}
          {data.weight && (
            <div>
              <span className="font-medium">Weight:</span> {data.weight} lb
            </div>
          )}
        </div>
      )
    case 'feat':
      return (
        <div className="space-y-2">
          {data.prerequisite && (
            <div>
              <span className="font-medium">Prerequisite:</span> {data.prerequisite}
            </div>
          )}
          {data.ability && (
            <div>
              <span className="font-medium">Ability:</span> {data.ability.join(', ')}
            </div>
          )}
        </div>
      )
    case 'monster':
      return (
        <div className="space-y-2">
          <div>
            <span className="font-medium">CR:</span> {data.cr}
          </div>
          {data.type && (
            <div>
              <span className="font-medium">Type:</span> {data.type}
            </div>
          )}
          {data.size && (
            <div>
              <span className="font-medium">Size:</span> {data.size}
            </div>
          )}
        </div>
      )
    default:
      return <div className="text-gray-400">No details available</div>
  }
}
