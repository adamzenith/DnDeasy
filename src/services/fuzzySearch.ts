/**
 * Fuzzy search service using Fuse.js
 * Handles matching OCR results to D&D content
 */

import Fuse from 'fuse.js'
import type { Spell, Item, Feat, Monster, SearchResult } from '../types/dnd'

/**
 * Generic fuzzy search class
 */
export class FuzzySearchService<T> {
  private fuse: Fuse<T> | null = null

  constructor(
    private keys: string[],
    private threshold: number = 0.3
  ) {}

  /**
   * Initialize search index with data
   */
  setData(data: T[]) {
    this.fuse = new Fuse(data, {
      keys: this.keys,
      threshold: this.threshold,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    })
  }

  /**
   * Search for items matching query
   */
  search(query: string, limit: number = 10): SearchResult<T>[] {
    if (!this.fuse) {
      return []
    }

    const results = this.fuse.search(query, { limit })

    return results.map(result => ({
      item: result.item,
      score: result.score || 1,
      matches: (result.matches || []).map(match => ({
        key: match.key || '',
        value: match.value || '',
      })),
    }))
  }

  /**
   * Find best match for query
   */
  findBestMatch(query: string): SearchResult<T> | null {
    const results = this.search(query, 1)
    return results.length > 0 ? results[0] : null
  }

  /**
   * Check if match confidence is high enough
   */
  isConfidentMatch(result: SearchResult<T>, minConfidence: number = 0.7): boolean {
    return (1 - result.score) >= minConfidence
  }
}

/**
 * Spell search service
 */
export const spellSearch = new FuzzySearchService<Spell>(
  ['name', 'entries', 'school'],
  0.3
)

/**
 * Item search service
 */
export const itemSearch = new FuzzySearchService<Item>(
  ['name', 'type', 'entries'],
  0.3
)

/**
 * Feat search service
 */
export const featSearch = new FuzzySearchService<Feat>(
  ['name', 'entries'],
  0.3
)

/**
 * Monster search service
 */
export const monsterSearch = new FuzzySearchService<Monster>(
  ['name', 'type'],
  0.3
)

/**
 * Initialize all search indices
 */
export async function initializeSearchIndices(data: {
  spells: Spell[]
  items: Item[]
  feats: Feat[]
  monsters: Monster[]
}) {
  spellSearch.setData(data.spells)
  itemSearch.setData(data.items)
  featSearch.setData(data.feats)
  monsterSearch.setData(data.monsters)
}
