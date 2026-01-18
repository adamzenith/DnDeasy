/**
 * Type definitions for D&D 5e data structures from 5e.tools
 */

export interface Spell {
  name: string
  source: string
  page?: number
  level: number
  school: string
  time: CastingTime[]
  range: Range
  components: Components
  duration: Duration[]
  entries: string[]
  damageInflict?: string[]
  savingThrow?: string[]
  abilityCheck?: string[]
  spellAttack?: string[]
  classes?: {
    fromClassList?: ClassSource[]
  }
}

export interface CastingTime {
  number: number
  unit: string
  condition?: string
}

export interface Range {
  type: string
  distance?: {
    type: string
    amount?: number
  }
}

export interface Components {
  v?: boolean
  s?: boolean
  m?: string | { text: string }
}

export interface Duration {
  type: string
  duration?: {
    type: string
    amount?: number
  }
  concentration?: boolean
}

export interface ClassSource {
  name: string
  source: string
}

export interface Item {
  name: string
  source: string
  page?: number
  type: string
  rarity?: string
  reqAttune?: boolean | string
  weight?: number
  value?: number
  entries?: string[]
  additionalEntries?: string[]
  bonusWeapon?: string
  bonusAc?: string
}

export interface Feat {
  name: string
  source: string
  page?: number
  prerequisite?: Prerequisite[]
  ability?: Ability[]
  entries: string[]
  skillProficiencies?: SkillProficiency[]
}

export interface Prerequisite {
  level?: number
  str?: number
  dex?: number
  con?: number
  int?: number
  wis?: number
  cha?: number
  feat?: string[]
}

export interface Ability {
  choose?: AbilityChoice[]
}

export interface AbilityChoice {
  from: string[]
  count?: number
  amount?: number
}

export interface SkillProficiency {
  choose?: {
    from: string[]
    count?: number
  }
}

export interface Monster {
  name: string
  source: string
  page?: number
  size: string[]
  type: string | { type: string; tags?: string[] }
  alignment: string[]
  ac: AC[]
  hp: HP
  speed: { [key: string]: number }
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
  save?: { [key: string]: string }
  skill?: { [key: string]: string }
  senses?: string[]
  passive?: number
  languages?: string[]
  cr: string | number
  trait?: Trait[]
  action?: Action[]
  legendary?: Legendary[]
}

export interface AC {
  ac: number
  from?: string[]
}

export interface HP {
  average: number
  formula: string
}

export interface Trait {
  name: string
  entries: string[]
}

export interface Action {
  name: string
  entries: string[]
}

export interface Legendary {
  name: string
  entries: string[]
}

export type ContentType = 'spell' | 'item' | 'feat' | 'monster' | 'class' | 'race' | 'background'

export interface SearchResult<T = Spell | Item | Feat | Monster> {
  item: T
  score: number
  matches: { key: string; value: string }[]
}
