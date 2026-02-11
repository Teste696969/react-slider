import type { QuerySuggestion } from "../hooks/useVideoFilters";

type FilterSectionProps = {
  searchInput: string;
  selectedArtists: string[];
  selectedCategories: string[];
  randomArtists: string[];
  allCategories: string[];
  searchSuggestions: QuerySuggestion[];
  showSuggestions: boolean;
  onSearchInputChange: (value: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onAddArtist: (artist: string) => void;
  onAddCategory: (category: string) => void;
  onRemoveArtist: (artist: string) => void;
  onRemoveCategory: (category: string) => void;
};

export function FilterSection({
  searchInput,
  selectedArtists,
  selectedCategories,
  randomArtists = [],
  allCategories = [],
  searchSuggestions = [],
  showSuggestions,
  onSearchInputChange,
  onSearchFocus,
  onSearchBlur,
  onAddArtist,
  onAddCategory,
  onRemoveArtist,
  onRemoveCategory,
}: FilterSectionProps) {
  return (
    <section
      style={{
        paddingTop: "24px",
        paddingBottom: "24px",
        paddingLeft: "8px",
        paddingRight: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
      }}
    >
      {/* Search Input */}
      <div style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Procurar artistas ou categorias..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onFocus={onSearchFocus}
          onBlur={() => setTimeout(onSearchBlur, 200)}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "16px",
            borderRadius: "8px",
          }}
        />

        {/* Search Suggestions Dropdown */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              width: "100%",
              maxHeight: "300px",
              overflowY: "auto",
              background: "#343a40",
              border: "1px solid #454d55",
              borderRadius: "8px",
              zIndex: 1000,
              top: "100%",
              marginTop: "8px",
            }}
          >
            {searchSuggestions.map((suggestion, index) => (
              <a
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (suggestion.type === "artist") {
                    onAddArtist(suggestion.value);
                  } else {
                    onAddCategory(suggestion.value);
                  }
                  onSearchInputChange("");
                }}
                style={{
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  textDecoration: "none",
                  fontSize: "14px",
                  gap: "12px",
                  borderBottom: "1px solid #454d55",
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  target.style.backgroundColor = "#454d55";
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget;
                  target.style.backgroundColor = "transparent";
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background:
                      suggestion.type === "artist" ? "#ff8533" : "#6c757d",
                  }}
                />
                {suggestion.value}
                <span
                  style={{
                    fontSize: "12px",
                    color: "#aaa",
                    marginLeft: "auto",
                  }}
                >
                  {suggestion.type === "artist" ? "Artista" : "Categoria"}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Selected Filters */}
      {(selectedArtists.length > 0 || selectedCategories.length > 0) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            padding: "16px",
            background: "rgba(255, 133, 51, 0.1)",
            borderRadius: "8px",
          }}
        >
          {selectedArtists.map((artist) => (
            <span
              key={artist}
              style={{
                background: "#ff8533",
                color: "white",
                padding: "6px 12px",
                borderRadius: "20px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
              }}
            >
              {artist}
              <span
                onClick={() => onRemoveArtist(artist)}
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                ×
              </span>
            </span>
          ))}

          {selectedCategories.map((category) => (
            <span
              key={category}
              style={{
                background: "#6c757d",
                color: "white",
                padding: "6px 12px",
                borderRadius: "20px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
              }}
            >
              {category}
              <span
                onClick={() => onRemoveCategory(category)}
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                ×
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Quick Select Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Random Artists */}
        {randomArtists.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#aaa",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Artistas
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {randomArtists.map((artist) => (
                <button
                  key={artist}
                  onClick={() => onAddArtist(artist)}
                  style={{
                    padding: "8px 16px",
                    background: "#2a2d31",
                    color: "#fff",
                    border: "1px solid #454d55",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget;
                    target.style.borderColor = "#ff8533";
                    target.style.backgroundColor = "rgba(255, 133, 51, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget;
                    target.style.borderColor = "#454d55";
                    target.style.backgroundColor = "#2a2d31";
                  }}
                >
                  {artist}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Categories */}
        {allCategories.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#aaa",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Categorias
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => onAddCategory(category)}
                  style={{
                    padding: "8px 16px",
                    background: "#2a2d31",
                    color: "#fff",
                    border: "1px solid #454d55",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget;
                    target.style.borderColor = "#6c757d";
                    target.style.backgroundColor = "rgba(108, 117, 125, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget;
                    target.style.borderColor = "#454d55";
                    target.style.backgroundColor = "#2a2d31";
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
