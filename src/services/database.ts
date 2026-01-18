/**
 * IndexedDB database setup using Dexie.js
 * Handles local storage for characters, annotations, and cached D&D content
 */

import Dexie, { Table } from 'dexie'
import type { Character, PDFAnnotation } from '../types/character'
import type { Spell, Item, Feat, Monster } from '../types/dnd'

export class DnDeasyDatabase extends Dexie {
  characters!: Table<Character>
  annotations!: Table<PDFAnnotation>
  spells!: Table<Spell & { id?: number }>
  items!: Table<Item & { id?: number }>
  feats!: Table<Feat & { id?: number }>
  monsters!: Table<Monster & { id?: number }>

  constructor() {
    super('DnDeasyDB')

    this.version(1).stores({
      characters: 'id, name, class, level, createdAt, updatedAt',
      annotations: 'id, characterId, type, page, createdAt',
      spells: '++id, name, level, school, source',
      items: '++id, name, type, rarity, source',
      feats: '++id, name, source',
      monsters: '++id, name, cr, type, source',
    })
  }
}

export const db = new DnDeasyDatabase()

/**
 * Character CRUD operations
 */
export const characterService = {
  async getAll() {
    return await db.characters.toArray()
  },

  async getById(id: string) {
    return await db.characters.get(id)
  },

  async create(character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date()
    const newCharacter: Character = {
      ...character,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    await db.characters.add(newCharacter)
    return newCharacter
  },

  async update(id: string, updates: Partial<Character>) {
    await db.characters.update(id, {
      ...updates,
      updatedAt: new Date(),
    })
  },

  async delete(id: string) {
    await db.characters.delete(id)
    // Also delete associated annotations
    await db.annotations.where('characterId').equals(id).delete()
  },
}

/**
 * Annotation operations
 */
export const annotationService = {
  async getByCharacterId(characterId: string) {
    return await db.annotations.where('characterId').equals(characterId).toArray()
  },

  async create(annotation: Omit<PDFAnnotation, 'id' | 'createdAt'>) {
    const newAnnotation: PDFAnnotation = {
      ...annotation,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    await db.annotations.add(newAnnotation)
    return newAnnotation
  },

  async delete(id: string) {
    await db.annotations.delete(id)
  },
}

/**
 * D&D content cache operations
 */
export const contentService = {
  async cacheSpells(spells: Spell[]) {
    await db.spells.clear()
    await db.spells.bulkAdd(spells)
  },

  async getSpells() {
    return await db.spells.toArray()
  },

  async cacheItems(items: Item[]) {
    await db.items.clear()
    await db.items.bulkAdd(items)
  },

  async getItems() {
    return await db.items.toArray()
  },

  async cacheFeats(feats: Feat[]) {
    await db.feats.clear()
    await db.feats.bulkAdd(feats)
  },

  async getFeats() {
    return await db.feats.toArray()
  },

  async cacheMonsters(monsters: Monster[]) {
    await db.monsters.clear()
    await db.monsters.bulkAdd(monsters)
  },

  async getMonsters() {
    return await db.monsters.toArray()
  },

  async getCacheStatus() {
    const [spellCount, itemCount, featCount, monsterCount] = await Promise.all([
      db.spells.count(),
      db.items.count(),
      db.feats.count(),
      db.monsters.count(),
    ])

    return {
      spells: spellCount,
      items: itemCount,
      feats: featCount,
      monsters: monsterCount,
      isEmpty: spellCount === 0 && itemCount === 0 && featCount === 0 && monsterCount === 0,
    }
  },
}
