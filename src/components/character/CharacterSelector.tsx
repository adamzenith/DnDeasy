import { useState, useEffect } from 'react'
import { contentService } from '../../services/database'
import type { Character } from '../../types/character'
import CharacterForm from './CharacterForm'

interface CharacterSelectorProps {
  selectedCharacterId: string | null
  onSelect: (characterId: string | null) => void
}

export default function CharacterSelector({ selectedCharacterId, onSelect }: CharacterSelectorProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCharacters()
  }, [])

  const loadCharacters = async () => {
    setLoading(true)
    try {
      const allCharacters = await contentService.getAllCharacters()
      setCharacters(allCharacters)

      // Auto-select first character if none selected
      if (!selectedCharacterId && allCharacters.length > 0) {
        onSelect(allCharacters[0].id)
      }
    } catch (error) {
      console.error('Failed to load characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCharacter = async (characterData: Partial<Character>) => {
    try {
      const newCharacter: Character = {
        id: `char_${Date.now()}`,
        ...characterData,
        name: characterData.name || 'Unnamed Character',
        level: characterData.level || 1,
        race: characterData.race || '',
        class: characterData.class || '',
        background: characterData.background || '',
        alignment: characterData.alignment || '',
        experiencePoints: characterData.experiencePoints || 0,
        abilities: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        hitPoints: {
          current: 10,
          max: 10,
          temp: 0,
        },
        armorClass: 10,
        initiative: 0,
        speed: 30,
        hitDice: '1d8',
        proficiencyBonus: 2,
        savingThrows: {
          strength: { proficient: false, value: 0 },
          dexterity: { proficient: false, value: 0 },
          constitution: { proficient: false, value: 0 },
          intelligence: { proficient: false, value: 0 },
          wisdom: { proficient: false, value: 0 },
          charisma: { proficient: false, value: 0 },
        },
        skills: {
          acrobatics: { proficient: false, expertise: false, value: 0 },
          animalHandling: { proficient: false, expertise: false, value: 0 },
          arcana: { proficient: false, expertise: false, value: 0 },
          athletics: { proficient: false, expertise: false, value: 0 },
          deception: { proficient: false, expertise: false, value: 0 },
          history: { proficient: false, expertise: false, value: 0 },
          insight: { proficient: false, expertise: false, value: 0 },
          intimidation: { proficient: false, expertise: false, value: 0 },
          investigation: { proficient: false, expertise: false, value: 0 },
          medicine: { proficient: false, expertise: false, value: 0 },
          nature: { proficient: false, expertise: false, value: 0 },
          perception: { proficient: false, expertise: false, value: 0 },
          performance: { proficient: false, expertise: false, value: 0 },
          persuasion: { proficient: false, expertise: false, value: 0 },
          religion: { proficient: false, expertise: false, value: 0 },
          sleightOfHand: { proficient: false, expertise: false, value: 0 },
          stealth: { proficient: false, expertise: false, value: 0 },
          survival: { proficient: false, expertise: false, value: 0 },
        },
        deathSaves: {
          successes: 0,
          failures: 0,
        },
        spells: [],
        features: [],
        equipment: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await contentService.addCharacter(newCharacter)
      await loadCharacters()
      onSelect(newCharacter.id)
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to create character:', error)
      alert('Failed to create character')
    }
  }

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId)

  if (showCreateForm) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Create New Character</h3>
        <CharacterForm
          onSave={handleCreateCharacter}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Active Character</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
        >
          + New
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-400">Loading characters...</div>
      ) : characters.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm mb-3">No characters yet</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Create Your First Character
          </button>
        </div>
      ) : (
        <>
          {/* Character Dropdown */}
          <select
            value={selectedCharacterId || ''}
            onChange={e => onSelect(e.target.value || null)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-primary-500 focus:outline-none"
          >
            <option value="">Select a character</option>
            {characters.map(character => (
              <option key={character.id} value={character.id}>
                {character.name} - Level {character.level} {character.class}
              </option>
            ))}
          </select>

          {/* Selected Character Info */}
          {selectedCharacter && (
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{selectedCharacter.name}</h4>
                <span className="text-xs text-gray-400">Level {selectedCharacter.level}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">
                  Race: <span className="text-white">{selectedCharacter.race || 'N/A'}</span>
                </div>
                <div className="text-gray-400">
                  Class: <span className="text-white">{selectedCharacter.class || 'N/A'}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="text-xs text-gray-400">
                  {selectedCharacter.spells?.length || 0} spells •{' '}
                  {selectedCharacter.equipment?.length || 0} items •{' '}
                  {selectedCharacter.features?.length || 0} features
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
