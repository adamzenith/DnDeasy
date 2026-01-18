import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { characterService } from '../services/database'
import type { Character } from '../types/character'

export default function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCharacter()
  }, [id])

  const loadCharacter = async () => {
    if (!id) return

    try {
      const char = await characterService.getById(id)
      setCharacter(char || null)
    } catch (error) {
      console.error('Failed to load character:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading character...</div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Character not found</h2>
          <p className="text-gray-400">The requested character does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Character Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white">{character.name}</h1>
        <p className="text-gray-400 mt-2">
          Level {character.level} {character.race} {character.class}
        </p>
        {character.background && (
          <p className="text-gray-400">{character.background}</p>
        )}
      </div>

      {/* Ability Scores */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Ability Scores</h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {Object.entries(character.abilities).map(([ability, score]) => (
            <div key={ability} className="text-center">
              <div className="text-sm text-gray-400 uppercase">{ability.slice(0, 3)}</div>
              <div className="text-3xl font-bold text-white">{score}</div>
              <div className="text-sm text-gray-500">
                {Math.floor((score - 10) / 2) >= 0 ? '+' : ''}{Math.floor((score - 10) / 2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Combat Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Armor Class</h3>
          <p className="text-4xl font-bold text-white">{character.armorClass}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Initiative</h3>
          <p className="text-4xl font-bold text-white">
            {character.initiative >= 0 ? '+' : ''}{character.initiative}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Speed</h3>
          <p className="text-4xl font-bold text-white">{character.speed} ft.</p>
        </div>
      </div>

      {/* Hit Points */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Hit Points</h2>
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-sm text-gray-400">Current</p>
            <p className="text-3xl font-bold text-white">{character.hitPoints.current}</p>
          </div>
          <div className="text-2xl text-gray-600">/</div>
          <div>
            <p className="text-sm text-gray-400">Maximum</p>
            <p className="text-3xl font-bold text-white">{character.hitPoints.max}</p>
          </div>
          {character.hitPoints.temp > 0 && (
            <>
              <div className="text-2xl text-gray-600">+</div>
              <div>
                <p className="text-sm text-gray-400">Temporary</p>
                <p className="text-3xl font-bold text-primary-500">{character.hitPoints.temp}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Spells */}
      {character.spells.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Spells</h2>
          <div className="space-y-2">
            {character.spells.map((spell, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700">
                <div>
                  <span className="text-white font-medium">{spell.name}</span>
                  <span className="text-gray-400 text-sm ml-2">
                    Level {spell.level} {spell.school}
                  </span>
                </div>
                {spell.prepared && (
                  <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                    Prepared
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
