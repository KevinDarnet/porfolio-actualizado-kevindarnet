import React, { useState, useMemo } from 'react';
import { Search, Clock, Calendar, ArrowUpRight, BookOpen, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Reveal from '../Reveal';

export default function BlogFeed({ posts, onSelectPost }) {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTech, setSelectedTech] = useState('ALL');

  // Categorías principales para la barra de píldoras
  const categories = useMemo(
    () => [
      { id: 'ALL', label: t.blog?.allFilter || (isEn ? 'All' : 'Todos') },
      { id: 'Desarrollo', label: isEn ? 'Development' : 'Desarrollo' },
      { id: 'Ciberseguridad', label: isEn ? 'Cybersecurity' : 'Ciberseguridad' },
      { id: 'Frontend', label: 'Frontend' },
      { id: 'UI/UX', label: 'UI/UX' },
    ],
    [isEn, t]
  );

  // Lista única y ordenada alfabéticamente de todas las tecnologías (tags secundarios)
  const allTechnologies = useMemo(() => {
    const techSet = new Set();
    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => techSet.add(tag));
      }
    });
    return Array.from(techSet).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  // Filtrado reactivo combinado: texto + categoría + tecnología
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const title = post.title || '';
      const summary = (isEn && post.summaryEn ? post.summaryEn : post.summary) || '';
      const category = post.category || '';
      const categoryEn = post.categoryEn || post.category || '';
      const tagsString = Array.isArray(post.tags) ? post.tags.join(' ') : '';
      const content = post.content || '';

      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        title.toLowerCase().includes(query) ||
        summary.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        categoryEn.toLowerCase().includes(query) ||
        tagsString.toLowerCase().includes(query) ||
        content.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'ALL' ||
        category.toLowerCase() === selectedCategory.toLowerCase() ||
        categoryEn.toLowerCase() === selectedCategory.toLowerCase();

      const matchesTech =
        selectedTech === 'ALL' ||
        (Array.isArray(post.tags) && post.tags.includes(selectedTech));

      return matchesSearch && matchesCategory && matchesTech;
    });
  }, [posts, searchTerm, selectedCategory, selectedTech, isEn]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || selectedCategory !== 'ALL' || selectedTech !== 'ALL';

  return (
    <div className="w-full">
      {/* Section Header */}
      <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
        <div>
          <span className="font-mono text-xs sm:text-sm text-[#888888] block mb-3">
            {t.blog?.breadcrumb || '... /Technical Blog & Research ...'}
          </span>
          <h2
            id="blog-heading"
            className="font-mono text-2xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight"
          >
            {t.blog?.title || 'Artículos & Publicaciones Técnicas'}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-[#A0A0A0] max-w-xl leading-relaxed">
          {t.blog?.subtitle ||
            'Reflexiones de ingeniería, análisis de seguridad en aplicaciones y patrones arquitectónicos probados en producción.'}
        </p>
      </Reveal>

      {/* Filter and Search Bar */}
      <Reveal delay={50} className="mb-10 space-y-4">
        {/* Controls Row: Search + Tech Dropdown + Quick Counter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#888888] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                t.blog?.searchPlaceholder || 'Buscar por título, contenido o tecnología...'
              }
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#141414] border border-[#2a2a2a] focus:border-emerald-500/60 focus:outline-none text-sm text-[#F5F5F5] placeholder-[#777777] font-mono transition-colors duration-200"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#888888] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Technology Dropdown Select */}
          <div className="relative">
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              aria-label={t.blog?.allTechnologies || 'Todas las tecnologías'}
              className={`w-full sm:w-auto appearance-none pl-3.5 pr-9 py-3 rounded-2xl text-xs font-mono transition-colors duration-200 cursor-pointer focus:outline-none ${
                selectedTech !== 'ALL'
                  ? 'bg-neutral-900 border border-emerald-500/50 text-emerald-400 font-medium'
                  : 'bg-[#141414] border border-[#2a2a2a] text-[#CFCFCF] hover:border-[#3a3a3a]'
              }`}
            >
              <option value="ALL" className="bg-[#141414] text-[#F5F5F5]">
                {t.blog?.allTechnologies || (isEn ? 'All technologies' : 'Todas las tecnologías')}
              </option>
              {allTechnologies.map((tech) => (
                <option key={tech} value={tech} className="bg-[#141414] text-[#F5F5F5]">
                  {tech}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#888888] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#141414] border border-[#2a2a2a] text-xs font-mono text-[#888888] whitespace-nowrap">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>
              {filteredPosts.length}{' '}
              {t.blog?.resultsCount || 'artículos encontrados'}
            </span>
          </div>
        </div>

        {/* Category Filter Pills (Single clean row) */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`font-mono text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800 font-semibold'
                      : 'bg-[#181818] text-[#888888] hover:text-[#F5F5F5] hover:border-[#3a3a3a] border border-[#2a2a2a]'
                  }`}
                >
                  [ {cat.label} ]
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedTech('ALL');
              }}
              className="font-mono text-xs text-[#888888] hover:text-emerald-400 transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0 px-2 py-1"
              title={t.blog?.clearSearch || 'Limpiar filtros'}
            >
              <span>✕</span>
              <span className="hidden sm:inline">{t.blog?.clearSearch || 'Limpiar filtros'}</span>
            </button>
          )}
        </div>
      </Reveal>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredPosts.map((post, idx) => {
            const displayTitle = post.title;
            const displaySummary = isEn && post.summaryEn ? post.summaryEn : post.summary;
            const displayCategory = isEn && post.categoryEn ? post.categoryEn : post.category;
            const displayReadTime = isEn && post.readTimeEn ? post.readTimeEn : post.readTime;

            return (
              <Reveal key={post.slug} delay={idx * 100} className="h-full">
                <article
                  onClick={() => onSelectPost(post.slug)}
                  className="h-full group rounded-3xl bg-[#161616] border border-[#2a2a2a] hover:border-[#4d4d4d] transition-all duration-300 ease-out p-6 sm:p-8 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top Category Badge & Metadata */}
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 rounded-full px-3 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {displayCategory}
                      </span>

                      <div className="flex items-center gap-3 text-xs font-mono text-[#888888]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.date}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {displayReadTime}
                        </span>
                      </div>
                    </div>

                    {/* Post Title */}
                    <h3 className="font-mono text-xl sm:text-2xl font-bold text-[#F5F5F5] group-hover:text-emerald-300 transition-colors duration-300 mb-3 leading-snug">
                      {displayTitle}
                    </h3>

                    {/* Post Summary */}
                    <p className="text-sm sm:text-base text-[#A0A0A0] leading-relaxed mb-6 font-sans">
                      {displaySummary}
                    </p>
                  </div>

                  <div>
                    {/* Technology Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-xs px-2.5 py-1 rounded-xl bg-[#1f1f1f] text-[#D4D4D4] border border-[#333333]"
                        >
                          [{tag}]
                        </span>
                      ))}
                    </div>

                    {/* Action Pill Button */}
                    <div className="pt-5 border-t border-[#242424] flex items-center justify-between">
                      <span className="font-mono text-xs text-[#888888] group-hover:text-[#CCCCCC] transition-colors">
                        // READ ARTICLE
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPost(post.slug);
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1e1e1e] group-hover:bg-[#F5F5F5] text-[#F5F5F5] group-hover:text-[#0d0d0d] border border-[#333333] px-5 py-2.5 font-mono text-xs font-semibold transition-all duration-300 ease-out"
                      >
                        <span>{t.blog?.readArticle || 'Leer artículo completo'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl bg-[#141414] border border-[#262626] p-12 text-center my-6">
          <p className="font-mono text-sm text-[#888888] mb-4">
            {t.blog?.noResults || 'No se encontraron artículos para tu búsqueda.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
              setSelectedTech('ALL');
            }}
            className="font-mono text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
          >
            {t.blog?.clearSearch || 'Limpiar filtros'}
          </button>
        </div>
      )}
    </div>
  );
}
