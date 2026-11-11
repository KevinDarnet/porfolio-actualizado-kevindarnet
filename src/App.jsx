import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductionServices from './components/ProductionServices';
import Projects from './components/Projects';
import Blog from './components/Blog';
import TechStack from './components/TechStack';
import Experience from './components/Experience';
import Contact from './components/Contact';
import ScrollAffordance from './components/ScrollAffordance';

function MainLayout() {
  const { activeSection, isDesktop } = useNavigation();

  // Reset de scroll garantizado ante cualquier cambio de pestaña en Desktop
  React.useEffect(() => {
    if (isDesktop) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [activeSection, isDesktop]);

  // Renderizado exclusivo de la vista activa en Desktop
  const renderActiveDesktopSection = () => {
    switch (activeSection) {
      case 'production':
        return <ProductionServices />;
      case 'projects':
        return <Projects />;
      case 'blog':
        return <Blog />;
      case 'skills':
        return <TechStack />;
      case 'experience':
        return <Experience />;
      case 'contact':
        return <Contact />;
      case 'about':
      default:
        return <Hero />;
    }
  };

  return (
    <div className="bg-[#0d0d0d] text-[#F5F5F5] min-h-screen">
      {/* VISTA DESKTOP (lg: y superior): Pestañas únicas con scroll vertical natural sin restricciones rígidas */}
      <div className="hidden lg:flex flex-col min-h-screen w-full">
        <Header />
        <main className="flex-1 w-full min-h-screen relative">
          <div
            key={activeSection}
            className="w-full animate-tab-enter"
          >
            {renderActiveDesktopSection()}
          </div>
        </main>
      </div>

      {/* VISTA MOBILE (inferior a lg): Scroll vertical estándar scrolleable con todas las secciones apiladas */}
      <div className="block lg:hidden min-h-screen">
        <Header />
        <main>
          <Hero />
          <ProductionServices />
          <Projects />
          <Blog />
          <TechStack />
          <Experience />
        </main>
        <Contact />
      </div>

      {/* Indicador global flotante de scroll para desktop y mobile */}
      <ScrollAffordance />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <NavigationProvider>
        <MainLayout />
      </NavigationProvider>
    </LanguageProvider>
  );
}
