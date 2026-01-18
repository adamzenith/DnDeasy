/**
 * Type definitions for character data
 */

export interface Character {
  id: string
  name: string
  class: string
  level: number
  race: string
  background: string
  alignment?: string
  experiencePoints: number

  // Ability scores
  abilities: AbilityScores

  // Proficiencies
  proficiencyBonus: number
  savingThrows: SavingThrows
  skills: Skills

  // Combat stats
  armorClass: number
  initiative: number
  speed: number
  hitPoints: HitPoints
  hitDice: string
  deathSaves: DeathSaves

  // Features and traits
  spells: CharacterSpell[]
  features: Feature[]
  equipment: EquipmentItem[]

  // Metadata
  pdfUrl?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type AbilityName = keyof AbilityScores

export interface SavingThrows {
  strength: { proficient: boolean; value: number }
  dexterity: { proficient: boolean; value: number }
  constitution: { proficient: boolean; value: number }
  intelligence: { proficient: boolean; value: number }
  wisdom: { proficient: boolean; value: number }
  charisma: { proficient: boolean; value: number }
}

export interface Skills {
  acrobatics: { proficient: boolean; expertise: boolean; value: number }
  animalHandling: { proficient: boolean; expertise: boolean; value: number }
  arcana: { proficient: boolean; expertise: boolean; value: number }
  athletics: { proficient: boolean; expertise: boolean; value: number }
  deception: { proficient: boolean; expertise: boolean; value: number }
  history: { proficient: boolean; expertise: boolean; value: number }
  insight: { proficient: boolean; expertise: boolean; value: number }
  intimidation: { proficient: boolean; expertise: boolean; value: number }
  investigation: { proficient: boolean; expertise: boolean; value: number }
  medicine: { proficient: boolean; expertise: boolean; value: number }
  nature: { proficient: boolean; expertise: boolean; value: number }
  perception: { proficient: boolean; expertise: boolean; value: number }
  performance: { proficient: boolean; expertise: boolean; value: number }
  persuasion: { proficient: boolean; expertise: boolean; value: number }
  religion: { proficient: boolean; expertise: boolean; value: number }
  sleightOfHand: { proficient: boolean; expertise: boolean; value: number }
  stealth: { proficient: boolean; expertise: boolean; value: number }
  survival: { proficient: boolean; expertise: boolean; value: number }
}

export interface HitPoints {
  current: number
  max: number
  temp: number
}

export interface DeathSaves {
  successes: number
  failures: number
}

export interface CharacterSpell {
  name: string
  level: number
  school: string
  prepared: boolean
  alwaysPrepared?: boolean
}

export interface Feature {
  name: string
  source: string
  description: string
}

export interface EquipmentItem {
  name: string
  quantity: number
  weight?: number
  equipped?: boolean
}

export interface PDFAnnotation {
  id: string
  characterId: string
  type: 'text' | 'box' | 'highlight' | 'ocr-region'
  page: number
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
  data?: {
    text?: string
    ocrResult?: string
    matchedContent?: string
    confidence?: number
  }
  createdAt: Date
}
