import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { characterService, contentService } from '../services/database'
import type { Character } from '../types/character'

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [cacheStatus, setCacheStatus] = useState({ isEmpty: true, spells: 0, items: 0, feats: 0, monsters: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const chars = await characterService.getAll()
    setCharacters(chars)

    const status = await contentService.getCacheStatus()
    setCacheStatus(status)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Welcome to DnDeasy
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-300">
          Your intelligent D&D character sheet manager with OCR and auto-population
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/pdf-editor"
          className="relative block rounded-lg border-2 border-dashed border-gray-600 p-12 text-center hover:border-gray-500 hover:bg-gray-800 transition-colors"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="mt-2 block text-sm font-semibold text-white">
            Upload & Annotate PDF
          </span>
        </Link>

        <Link
          to="/content"
          className="relative block rounded-lg border-2 border-dashed border-gray-600 p-12 text-center hover:border-gray-500 hover:bg-gray-800 transition-colors"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="mt-2 block text-sm font-semibold text-white">
            Browse D&D Content
          </span>
        </Link>

        <button
          onClick={() => {/* TODO: Implement new character creation */}}
          className="relative block rounded-lg border-2 border-dashed border-gray-600 p-12 text-center hover:border-gray-500 hover:bg-gray-800 transition-colors"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="mt-2 block text-sm font-semibold text-white">
            New Character
          </span>
        </button>
      </div>

      {/* Characters List */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">Your Characters</h2>
        {characters.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No characters yet. Create your first character to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map(character => (
              <Link
                key={character.id}
                to={`/character/${character.id}`}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-xl font-bold text-white">{character.name}</h3>
                <p className="text-gray-400 mt-2">
                  Level {character.level} {character.race} {character.class}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Cache Status */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Content Cache Status</h3>
        {cacheStatus.isEmpty ? (
          <p className="text-gray-400">
            No D&D content cached yet. Visit the Content Browser to download data for offline use.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-gray-400 text-sm">Spells</p>
              <p className="text-2xl font-bold text-white">{cacheStatus.spells}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Items</p>
              <p className="text-2xl font-bold text-white">{cacheStatus.items}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Feats</p>
              <p className="text-2xl font-bold text-white">{cacheStatus.feats}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Monsters</p>
              <p className="text-2xl font-bold text-white">{cacheStatus.monsters}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
