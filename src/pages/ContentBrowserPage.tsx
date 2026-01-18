import { useState, useEffect } from 'react'
import { fiveEToolsService } from '../services/fiveETools'
import { contentService } from '../services/database'
import { spellSearch, itemSearch, featSearch, monsterSearch, initializeSearchIndices } from '../services/fuzzySearch'
import type { ContentType, Spell, Item, Feat, Monster } from '../types/dnd'

type Content = Spell | Item | Feat | Monster

export default function ContentBrowserPage() {
  const [contentType, setContentType] = useState<ContentType>('spell')
  const [content, setContent] = useState<Content[]>([])
  const [filteredContent, setFilteredContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cacheStatus, setCacheStatus] = useState({ isEmpty: true, spells: 0, items: 0, feats: 0, monsters: 0 })

  useEffect(() => {
    loadCacheStatus()
  }, [])

  useEffect(() => {
    loadContent()
  }, [contentType])

  useEffect(() => {
    if (searchQuery) {
      performSearch()
    } else {
      setFilteredContent(content)
    }
  }, [searchQuery, content])

  const loadCacheStatus = async () => {
    const status = await contentService.getCacheStatus()
    setCacheStatus(status)
  }

  const loadContent = async () => {
    setLoading(true)
    try {
      const data = await fiveEToolsService.getContent(contentType)
      setContent(data)
      setFilteredContent(data)
      await loadCacheStatus()
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllContent = async () => {
    setLoading(true)
    try {
      const [spells, items, feats, monsters] = await fiveEToolsService.fetchAll()
      await initializeSearchIndices({ spells, items, feats, monsters })
      await loadCacheStatus()
      await loadContent()
    } catch (error) {
      console.error('Failed to load all content:', error)
    } finally {
      setLoading(false)
    }
  }

  const performSearch = () => {
    let results: Array<{ item: Content; score: number; matches: Array<{ key: string; value: string }> }>
    switch (contentType) {
      case 'spell':
        results = spellSearch.search(searchQuery, 50)
        break
      case 'item':
        results = itemSearch.search(searchQuery, 50)
        break
      case 'feat':
        results = featSearch.search(searchQuery, 50)
        break
      case 'monster':
        results = monsterSearch.search(searchQuery, 50)
        break
      default:
        results = []
    }
    setFilteredContent(results.map(r => r.item))
  }

  const renderContentItem = (item: Content, index: number) => {
    const name = 'name' in item ? item.name : 'Unknown'
    const source = 'source' in item ? item.source : ''

    let details = ''
    if ('level' in item && 'school' in item) {
      const spell = item as Spell
      details = `Level ${spell.level} ${spell.school}`
    } else if ('type' in item && 'rarity' in item) {
      const itm = item as Item
      details = `${itm.type}${itm.rarity ? ` - ${itm.rarity}` : ''}`
    } else if ('cr' in item) {
      const monster = item as Monster
      details = `CR ${monster.cr}`
    }

    return (
      <div
        key={index}
        className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
      >
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        {details && <p className="text-gray-400 text-sm mt-1">{details}</p>}
        <p className="text-gray-500 text-xs mt-2">{source}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Browser</h1>
          <p className="text-gray-400 mt-2">
            Browse and search D&D 5e content from 5e.tools
          </p>
        </div>
        <button
          onClick={loadAllContent}
          disabled={loading}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Download All Content'}
        </button>
      </div>

      {/* Cache Status */}
      {!cacheStatus.isEmpty && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Cached Content</h3>
          <div className="flex space-x-4 text-sm text-gray-400">
            <span>{cacheStatus.spells} spells</span>
            <span>{cacheStatus.items} items</span>
            <span>{cacheStatus.feats} feats</span>
            <span>{cacheStatus.monsters} monsters</span>
          </div>
        </div>
      )}

      {/* Content Type Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(['spell', 'item', 'feat', 'monster'] as ContentType[]).map(type => (
            <button
              key={type}
              onClick={() => setContentType(type)}
              className={`${
                contentType === type
                  ? 'border-primary-500 text-white'
                  : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium capitalize`}
            >
              {type}s
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder={`Search ${contentType}s...`}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-primary-500 focus:outline-none"
        />
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading content...</p>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400">
            {content.length === 0
              ? 'No content loaded. Click "Download All Content" to fetch data from 5e.tools.'
              : 'No results found for your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContent.slice(0, 100).map((item, index) => renderContentItem(item, index))}
          {filteredContent.length > 100 && (
            <div className="col-span-full text-center py-4 text-gray-400">
              Showing first 100 results. Refine your search to see more.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
