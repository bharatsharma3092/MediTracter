import { useCallback, useEffect, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import medicines from '@/data/indianMedicines.json'
import { API_BASE_URL } from '@/config/constants'

interface Medicine {
  name: string
  generic: string
  category: string
  fromApi?: boolean
}

const fuse = new Fuse(medicines as Medicine[], {
  keys: ['name', 'generic'],
  threshold: 0.35,
  includeScore: true
})

const controlClass =
  'min-h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100'

export function MedicineAutocomplete({
  name,
  defaultValue,
  required,
  clearOnSelect,
  onSelect
}: {
  name: string
  defaultValue?: string
  required?: boolean
  clearOnSelect?: boolean
  onSelect?: (medicine: Medicine) => void
}) {
  const [query, setQuery] = useState(defaultValue ?? '')
  const [results, setResults] = useState<Medicine[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>()
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback(async (value: string) => {
    if (value.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      setIsLoading(false)
      return
    }

    // Cancel any in-flight API request
    abortRef.current?.abort()

    // Local search first
    const localMatches = fuse.search(value, { limit: 8 }).map((r) => r.item)

    if (localMatches.length >= 3) {
      setResults(localMatches)
      setIsOpen(true)
      setHighlightIndex(-1)
      setIsLoading(false)
      return
    }

    // Few local results — show them immediately and fetch from API
    setResults(localMatches)
    setIsOpen(true)
    setHighlightIndex(-1)
    setIsLoading(true)

    try {
      abortRef.current = new AbortController()
      const res = await fetch(
        `${API_BASE_URL}/medicines/search?q=${encodeURIComponent(value)}`,
        { signal: abortRef.current.signal }
      )

      if (!res.ok) {
        setIsLoading(false)
        return
      }

      const data = await res.json()
      const apiResults: Medicine[] = (data.data || []).map((m: Medicine) => ({ ...m, fromApi: true }))

      // Merge: local first, then API results not already in local
      const localNames = new Set(localMatches.map((m) => m.name.toLowerCase()))
      const merged = [
        ...localMatches,
        ...apiResults.filter((m) => !localNames.has(m.name.toLowerCase()))
      ]

      setResults(merged.slice(0, 10))
      setIsOpen(merged.length > 0)
    } catch {
      // AbortError or network error — keep local results
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup
  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  function select(medicine: Medicine) {
    if (clearOnSelect) {
      setQuery('')
      setResults([])
    } else {
      setQuery(medicine.name)
    }
    setIsOpen(false)
    setHighlightIndex(-1)
    onSelect?.(medicine)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((i) => (i < results.length - 1 ? i + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((i) => (i > 0 ? i - 1 : results.length - 1))
        break
      case 'Enter':
        if (highlightIndex >= 0) {
          e.preventDefault()
          select(results[highlightIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightIndex(-1)
        break
    }
  }

  function handleBlur() {
    blurTimeout.current = setTimeout(() => setIsOpen(false), 150)
  }

  function handleFocus() {
    clearTimeout(blurTimeout.current)
    if (query.trim().length >= 2 && results.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        name={name}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        required={required}
        autoComplete="off"
        className={controlClass}
      />
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {results.map((medicine, i) => (
            <li
              key={`${medicine.name}-${medicine.generic}`}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === highlightIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-900 hover:bg-gray-50'
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(medicine)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              <span className="font-medium">{medicine.name}</span>
              <span className="ml-2 text-xs text-gray-500">{medicine.generic}</span>
              {medicine.fromApi && (
                <span className="ml-2 text-[10px] text-gray-400 italic">online</span>
              )}
            </li>
          ))}
          {isLoading && (
            <li className="px-3 py-1.5 text-xs text-gray-400 italic">
              Searching online...
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
