import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      const baseSection = hash.split('/')[0];
      if (['about', 'production', 'projects', 'blog', 'skills', 'experience', 'contact'].includes(baseSection)) {
        return baseSection;
      }
    }
    return 'about';
  });

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 1024px)').matches;
    }
    return true;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleMediaChange = (e) => {
      setIsDesktop(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  // Función utilitaria para resetear el scroll de forma inmediata a la parte superior
  const resetScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, []);

  const navigateTo = useCallback((sectionId) => {
    setActiveSection(sectionId);

    if (window.history.pushState) {
      window.history.pushState(null, '', `#${sectionId}`);
    }

    if (window.matchMedia('(min-width: 1024px)').matches) {
      // En Desktop: vista por pestañas individuales, resetear inmediatamente al inicio superior
      resetScrollToTop();
    } else {
      // En Mobile: todas las secciones apiladas, scroll suave respetando scroll-margin-top
      const el = document.getElementById(sectionId);
      if (el) {
        if (sectionId === 'about') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [resetScrollToTop]);

  // Listener para sincronizar cambios de hash y navegación por historial (Atrás/Adelante)
  useEffect(() => {
    const handleHashOrPopState = () => {
      const hash = window.location.hash.replace('#', '');
      const baseSection = hash.split('/')[0];
      if (['about', 'production', 'projects', 'blog', 'skills', 'experience', 'contact'].includes(baseSection)) {
        setActiveSection(baseSection);
        if (window.matchMedia('(min-width: 1024px)').matches) {
          resetScrollToTop();
        } else {
          const el = document.getElementById(baseSection);
          if (el) {
            if (baseSection === 'about') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashOrPopState);
    window.addEventListener('popstate', handleHashOrPopState);

    return () => {
      window.removeEventListener('hashchange', handleHashOrPopState);
      window.removeEventListener('popstate', handleHashOrPopState);
    };
  }, [resetScrollToTop]);

  return (
    <NavigationContext.Provider
      value={{
        activeSection,
        setActiveSection,
        isDesktop,
        navigateTo,
        resetScrollToTop,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
