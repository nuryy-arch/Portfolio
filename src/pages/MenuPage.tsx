import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { apiService } from '../services/api';
import type { Product, ProductCategory } from '../types';
import { ProductCard } from '../components/ProductCard';

const CATEGORIES: { key: 'all' | ProductCategory; label: string }[] = [
  { key: 'all', label: 'Всё меню' },
  { key: 'coffee', label: 'Кофе' },
  { key: 'tea', label: 'Чай' },
  { key: 'cold', label: 'Холодные напитки' },
  { key: 'desserts', label: 'Десерты' },
];

export const MenuPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = (searchParams.get('category') || 'all') as 'all' | ProductCategory;

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await apiService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load menu products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const handleCategoryChange = (cat: 'all' | ProductCategory) => {
    if (cat === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        activeCategory === 'all' ? true : p.category === activeCategory;
      const matchQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="py-12 bg-[#F6F2EA] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7E7066] font-semibold block mb-2">
            Селекция напитков и выпечки
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#30251F] font-normal mb-4">
            Карта Меню
          </h1>
          <p className="text-sm sm:text-base text-[#7E7066] font-light leading-relaxed">
            Авторские рецепты, зерно свежей обжарки и ремесленные десерты, приготовленные с любовью к деталям.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#D8C6AE]/30 shadow-sm mb-12 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeCategory === cat.key
                      ? 'bg-[#30251F] text-[#F6F2EA] shadow-sm'
                      : 'bg-[#F6F2EA]/60 text-[#7E7066] hover:bg-[#F6F2EA] hover:text-[#30251F]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#7E7066] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по меню..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#F6F2EA]/50 rounded-xl border border-[#D8C6AE]/40 focus:outline-none focus:border-[#30251F] focus:bg-white text-[#30251F] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7E7066] hover:text-[#30251F]"
                >
                  Очистить
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-stone-200/50 animate-pulse rounded-2xl h-88 border border-stone-200"
              ></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#D8C6AE]/30 p-12 text-center max-w-md mx-auto my-12">
            <SlidersHorizontal className="w-12 h-12 text-[#D8C6AE] mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-[#30251F] mb-2">Ничего не найдено</h3>
            <p className="text-xs sm:text-sm text-[#7E7066] font-light mb-6">
              Попробуйте изменить поисковый запрос или выберите другую категорию меню.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange('all');
              }}
              className="px-5 py-2.5 bg-[#30251F] text-[#F6F2EA] rounded-full text-xs uppercase tracking-wider hover:bg-[#221A15]"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
