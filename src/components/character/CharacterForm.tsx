import { useState } from 'react'
import type { Character } from '../../types/character'

interface CharacterFormProps {
  character?: Character
  onSave: (character: Partial<Character>) => void
  onCancel: () => void
}

export default function CharacterForm({ character, onSave, onCancel }: CharacterFormProps) {
  const [formData, setFormData] = useState({
    name: character?.name || '',
    race: character?.race || '',
    class: character?.class || '',
    level: character?.level || 1,
    background: character?.background || '',
    alignment: character?.alignment || '',
    experiencePoints: character?.experiencePoints || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Character Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Character Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-primary-500 focus:outline-none"
            placeholder="Gandalf the Grey"
          />
        </div>

        {/* Race */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Race</label>
          <input
            type="text"
            value={formData.race}
            onChange={e => handleChange('race', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-primary-500 focus:outline-none"
            placeholder="Human, Elf, Dwarf..."
          />
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Class</label>
          <input
            type="text"
            value={formData.class}
            onChange={e => handleChange('class', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-primary-500 focus:outline-none"
            placeholder="Wizard, Fighter, Rogue..."
          />
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.level}
            onChange={e => handleChange('level', parseInt(e.target.value))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Experience Points */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Experience Points
          </label>
          <input
            type="number"
            min="0"
            value={formData.experiencePoints}
            onChange={e => handleChange('experiencePoints', parseInt(e.target.value))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Background */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Background</label>
          <input
            type="text"
            value={formData.background}
            onChange={e => handleChange('background', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-primary-500 focus:outline-none"
            placeholder="Sage, Soldier, Criminal..."
          />
        </div>

        {/* Alignment */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Alignment</label>
          <select
            value={formData.alignment}
            onChange={e => handleChange('alignment', e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-primary-500 focus:outline-none"
          >
            <option value="">Select alignment</option>
            <option value="Lawful Good">Lawful Good</option>
            <option value="Neutral Good">Neutral Good</option>
            <option value="Chaotic Good">Chaotic Good</option>
            <option value="Lawful Neutral">Lawful Neutral</option>
            <option value="True Neutral">True Neutral</option>
            <option value="Chaotic Neutral">Chaotic Neutral</option>
            <option value="Lawful Evil">Lawful Evil</option>
            <option value="Neutral Evil">Neutral Evil</option>
            <option value="Chaotic Evil">Chaotic Evil</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          {character ? 'Update Character' : 'Create Character'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
