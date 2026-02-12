import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import Fuse from "fuse.js";
import type { VideoItem } from "../types/video";

interface SearchCache {
  query: string;
  results: VideoItem[];
  timestamp: number;
}

const CACHE_DURATION = 60000; // 1 minuto
const MAX_RESULTS = 15;
const SEARCH_HISTORY_KEY = "video_search_history";

export function useAdvancedSearch(videos: VideoItem[]) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const cacheRef = useRef<Map<string, SearchCache>>(new Map());
  const fuseRef = useRef<Fuse<VideoItem> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carregar histórico do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        // Ignorar erro de parse
      }
    }
  }, []);

  // Criar instância Fuse com índice otimizado
  useMemo(() => {
    fuseRef.current = new Fuse(videos, {
      keys: [
        { name: "title", weight: 0.4 },      // Título é mais importante
        { name: "autor", weight: 0.3 },      // Autor é importante
        { name: "categoria", weight: 0.2 },  // Categoria menos importante
        { name: "id", weight: 0.1 },         // ID como fallback
      ],
      threshold: 0.3,  // Permitir 30% de "erro" em fuzzy match
      ignoreLocation: true,
      minMatchCharLength: 2,
      useExtendedSearch: true,  // Permite mais operadores de busca
    });
  }, [videos]);

  // Limpar cache expirado
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    for (const [key, value] of cacheRef.current.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        cacheRef.current.delete(key);
      }
    }
  }, []);

  // Adicionar ao histórico
  const addToHistory = useCallback((query: string) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((q) => q !== query);
      const newHistory = [query, ...filtered].slice(0, 5);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // Função principal de busca
  const search = useCallback(
    (query: string): VideoItem[] => {
      const normalized = query.trim();

      // Se vazio, retorna histórico + videos populares
      if (normalized.length === 0) {
        return videos.slice(0, MAX_RESULTS);
      }

      // Verificar cache
      const cached = cacheRef.current.get(normalized);
      if (cached) {
        return cached.results;
      }

      if (!fuseRef.current) return [];

      // Busca com Fuse.js (fuzzy + ranking automático)
      const fuseResults = fuseRef.current.search(normalized);
      let results = fuseResults.map((result) => result.item);

      // Boost adicional: busca exata em começo de palavra
      const lowerQuery = normalized.toLowerCase();
      results = results.sort((a, b) => {
        const aTitle = (a.title || "").toLowerCase();
        const bTitle = (b.title || "").toLowerCase();

        const aStarts = aTitle.startsWith(lowerQuery) ? 0 : 1;
        const bStarts = bTitle.startsWith(lowerQuery) ? 0 : 1;

        return aStarts - bStarts;
      });

      // Limitar e cachear
      const finalResults = results.slice(0, MAX_RESULTS);
      cacheRef.current.set(normalized, {
        query: normalized,
        results: finalResults,
        timestamp: Date.now(),
      });

      cleanExpiredCache();
      return finalResults;
    },
    [videos, cleanExpiredCache]
  );

  // Debounced search (para performance)
  const debouncedSearch = useCallback(
    (query: string, callback: (results: VideoItem[]) => void) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const results = search(query);
        callback(results);
        if (query.trim()) {
          addToHistory(query.trim());
        }
      }, 2500); // 4 segundos debounce
    },
    [search, addToHistory]
  );

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    search,
    debouncedSearch,
    searchHistory,
    clearHistory,
    clearCache,
  };
}
