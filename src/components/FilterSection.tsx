type FilterSectionProps = {
  artistInput: string
  categoryInput: string
  selectedArtists: string[]
  selectedCategories: string[]
  artistSuggestions: string[]
  categorySuggestions: string[]
  showArtistDropdown: boolean
  showCategoryDropdown: boolean
  onArtistInputChange: (value: string) => void
  onCategoryInputChange: (value: string) => void
  onArtistFocus: () => void
  onArtistBlur: () => void
  onCategoryFocus: () => void
  onCategoryBlur: () => void
  onAddArtist: (artist: string) => void
  onAddCategory: (category: string) => void
  onRemoveArtist: (artist: string) => void
  onRemoveCategory: (category: string) => void
  layout?: 'row' | 'column'
}

export function FilterSection({
  artistInput,
  categoryInput,
  selectedArtists,
  selectedCategories,
  artistSuggestions,
  categorySuggestions,
  showArtistDropdown,
  showCategoryDropdown,
  onArtistInputChange,
  onCategoryInputChange,
  onArtistFocus,
  onArtistBlur,
  onCategoryFocus,
  onCategoryBlur,
  onAddArtist,
  onAddCategory,
  onRemoveArtist,
  onRemoveCategory,
  layout = 'row',
}: FilterSectionProps) {
  return (
    <section
      style={{
        padding: 'clamp(12px, 4vw, 24px) clamp(16px, 6vw, 32px)',
        display: 'flex',
        gap: 'clamp(12px, 3vw, 20px)',
        width: '100%',
        maxWidth: '1200px',
        flexWrap: 'wrap',
        flexDirection: layout === 'column' ? 'column' : 'row',
      }}
    >
      {/* Artist Filter */}
      <div className="filter-group" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
        <div
          className="filter-input-container"
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Buscar artistas..."
            value={artistInput}
            onChange={e => {
              onArtistInputChange(e.target.value)
              onArtistFocus()
            }}
            onFocus={onArtistFocus}
            onBlur={() => setTimeout(onArtistBlur, 200)}
          />
          <div
            className="selected-filters"
            style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: '6px' }}
          >
            {selectedArtists.map(artist => (
              <span
                key={artist}
                className="filter-pill"
                style={{
                  background: '#ff8533',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: 15,
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                {artist}{' '}
                <span
                  onClick={() => onRemoveArtist(artist)}
                  style={{ marginLeft: 4, cursor: 'pointer' }}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
          {showArtistDropdown && artistSuggestions.length > 0 && (
            <div
              className="dropdown-menu show"
              style={{
                position: 'absolute',
                width: '100%',
                maxHeight: '200px',
                overflowY: 'auto',
                background: '#343a40',
                border: '1px solid #454d55',
                zIndex: 1000,
                top: '100%',
              }}
            >
              {artistSuggestions.map(artist => (
                <a
                  key={artist}
                  className="dropdown-item"
                  href="#"
                  onClick={e => {
                    e.preventDefault()
                    onAddArtist(artist)
                  }}
                  style={{ color: '#fff', display: 'block', padding: '8px 12px' }}
                >
                  {artist}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="filter-input-container" style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar categorias..."
            value={categoryInput}
            onChange={e => {
              onCategoryInputChange(e.target.value)
              onCategoryFocus()
            }}
            onFocus={onCategoryFocus}
            onBlur={() => setTimeout(onCategoryBlur, 200)}
          />
          {showCategoryDropdown && categorySuggestions.length > 0 && (
            <div
              className="dropdown-menu show"
              style={{
                position: 'absolute',
                width: '100%',
                maxHeight: '200px',
                overflowY: 'auto',
                background: '#343a40',
                border: '1px solid #454d55',
                zIndex: 1000,
                top: '100%',
              }}
            >
              {categorySuggestions.map(category => (
                <a
                  key={category}
                  className="dropdown-item"
                  href="#"
                  onClick={e => {
                    e.preventDefault()
                    onAddCategory(category)
                  }}
                  style={{ color: '#fff', display: 'block', padding: '8px 12px' }}
                >
                  {category}
                </a>
              ))}
            </div>
          )}
        </div>
        <div
          className="selected-filters"
          style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: '6px' }}
        >
          {selectedCategories.map(category => (
            <span
              key={category}
              className="filter-pill"
              style={{
                background: '#ff8533',
                color: 'white',
                padding: '4px 8px',
                borderRadius: 15,
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              {category}{' '}
              <span
                onClick={() => onRemoveCategory(category)}
                style={{ marginLeft: 4, cursor: 'pointer' }}
              >
                ×
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
