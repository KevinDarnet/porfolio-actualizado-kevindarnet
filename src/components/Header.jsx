import React, { useState, useEffect } from 'react';
import { Menu, X, Terminal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { t } = useLanguage();
  const { activeSection, setActiveSection, isDesktop, navigateTo } = useNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'about', href: '#about', label: t.nav.about },
    { id: 'production', href: '#production', label: t.nav.production },
    { id: 'projects', href: '#projects', label: t.nav.projects },
    { id: 'blog', href: '#blog', label: t.nav.blog },
    { id: 'skills', href: '#skills', label: t.nav.skills },
    { id: 'experience', href: '#experience', label: t.nav.experience },
    { id: 'contact', href: '#contact', label: t.nav.contact },
  ];

  // Scrollspy: activo exclusivamente en mobile (en desktop no hay scroll vertical de página)
  useEffect(() => {
    if (isDesktop) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // 1. Si está al inicio (< 100px), activar 'about'
      if (scrollY < 100) {
        setActiveSection('about');
        return;
      }

      // 2. Si está al final de la página, activar 'contact'
      const isAtBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 70;
      if (isAtBottom) {
        setActiveSection('contact');
        return;
      }

      // 3. Calcular posición de cada sección con offset adaptado a mobile (~90-100px)
      const navOffset = 100;
      const sectionIds = ['about', 'production', 'projects', 'blog', 'skills', 'experience', 'contact'];

      let current = 'about';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - navOffset;
          if (scrollY >= top) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDesktop, setActiveSection]);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    navigateTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d]/80 backdrop-blur-md py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between" aria-label="Main Navigation">
          {/* Brand Logo */}
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, 'about')}
            className="group flex items-center gap-2.5 focus:outline-none"
            aria-label="Kevin Darnet - Inicio"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e1e1e] border border-[#333333] group-hover:border-[#F5F5F5] transition-colors duration-300">
              <Terminal className="w-4 h-4 text-[#F5F5F5]" />
            </span>
            <span className="font-mono text-sm sm:text-base font-bold tracking-tight text-[#F5F5F5] group-hover:text-white transition-colors duration-300 whitespace-nowrap">
              {t.nav.brand}
              <span className="text-[#888888] font-normal">_</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <ul className="hidden lg:flex items-center gap-1 rounded-full bg-[#161616]/90 border border-[#2a2a2a] px-3 py-1.5">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-300 inline-block ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold border border-white/15 shadow-sm'
                        : 'text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#242424] border border-transparent'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right Actions: Language Switcher + Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-xl bg-[#1e1e1e] border border-[#333333] text-[#F5F5F5] hover:border-[#F5F5F5] transition-colors duration-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 rounded-2xl bg-[#181818] border border-[#333333] p-4 shadow-2xl">
            <ul className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.id)}
                      className={`block px-4 py-2.5 rounded-xl font-mono text-sm transition-colors duration-300 ${
                        isActive
                          ? 'bg-white/10 text-white font-semibold border border-white/15'
                          : 'text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#242424]'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
