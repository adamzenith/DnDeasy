/**
 * Service for fetching D&D 5e data from 5e.tools GitHub repository
 * Data source: https://github.com/5etools-mirror-3/5etools-src
 */

import type { Spell, Item, Feat, Monster, ContentType } from '../types/dnd'
import { contentService } from './database'

const BASE_URL = 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data'

export class FiveEToolsService {

  /**
   * Fetch spells from 5e.tools
   */
  async fetchSpells(): Promise<Spell[]> {
    const cached = await contentService.getSpells()
    if (cached.length > 0) {
      return cached
    }

    const response = await fetch(`${BASE_URL}/spells/spells-phb.json`)
    if (!response.ok) {
      throw new Error('Failed to fetch spells')
    }

    const data = await response.json()
    const spells = data.spell || []

    // Cache for offline use
    await contentService.cacheSpells(spells)

    return spells
  }

  /**
   * Fetch items from 5e.tools
   */
  async fetchItems(): Promise<Item[]> {
    const cached = await contentService.getItems()
    if (cached.length > 0) {
      return cached
    }

    const response = await fetch(`${BASE_URL}/items/items-base.json`)
    if (!response.ok) {
      throw new Error('Failed to fetch items')
    }

    const data = await response.json()
    const items = [
      ...(data.item || []),
      ...(data.itemGroup || []),
    ]

    await contentService.cacheItems(items)

    return items
  }

  /**
   * Fetch feats from 5e.tools
   */
  async fetchFeats(): Promise<Feat[]> {
    const cached = await contentService.getFeats()
    if (cached.length > 0) {
      return cached
    }

    const response = await fetch(`${BASE_URL}/feats.json`)
    if (!response.ok) {
      throw new Error('Failed to fetch feats')
    }

    const data = await response.json()
    const feats = data.feat || []

    await contentService.cacheFeats(feats)

    return feats
  }

  /**
   * Fetch monsters from 5e.tools
   */
  async fetchMonsters(): Promise<Monster[]> {
    const cached = await contentService.getMonsters()
    if (cached.length > 0) {
      return cached
    }

    const response = await fetch(`${BASE_URL}/bestiary/bestiary-mm.json`)
    if (!response.ok) {
      throw new Error('Failed to fetch monsters')
    }

    const data = await response.json()
    const monsters = data.monster || []

    await contentService.cacheMonsters(monsters)

    return monsters
  }

  /**
   * Fetch all content types
   */
  async fetchAll() {
    return Promise.all([
      this.fetchSpells(),
      this.fetchItems(),
      this.fetchFeats(),
      this.fetchMonsters(),
    ])
  }

  /**
   * Get content by type
   */
  async getContent(type: ContentType) {
    switch (type) {
      case 'spell':
        return this.fetchSpells()
      case 'item':
        return this.fetchItems()
      case 'feat':
        return this.fetchFeats()
      case 'monster':
        return this.fetchMonsters()
      default:
        throw new Error(`Unknown content type: ${type}`)
    }
  }
}

export const fiveEToolsService = new FiveEToolsService()
