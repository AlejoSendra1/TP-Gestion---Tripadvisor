import { useState, useEffect } from 'react';
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { PublicationList } from "@/components/PublicationList";
import { usePublications, SearchFilters as SearchFiltersType } from "@/hooks/usePublications";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/SearchBar";
import { AdvancedFilters } from "@/components/AdvancedFilters";

interface SearchFiltersProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: string | undefined) => void;
  onFiltersChange?: (filters: any) => void;
  selectedCategory?: string;
}

export const SearchFilters = ({ onSearch, onCategorySelect, onFiltersChange, selectedCategory }: SearchFiltersProps) => {
    return (
        <div className="space-y-6 w-full">
            {/* 1. Barra de Búsqueda - Fondo transparente */}
            <div className="">
                <SearchBar onSearch={onSearch} />
            </div>

            {/* 2. Categorías - Fondo transparente */}
            <div className="">
                <Categories 
                selectedCategory={selectedCategory}
                onCategorySelect={onCategorySelect} 
                />
            </div>

            {/* 3. Filtros Avanzados - Fondo transparente */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-hero border border-white/30">
                <AdvancedFilters 
                    onFiltersChange={onFiltersChange}
                />
            </div>
        </div>
    );
};

export default SearchFilters;