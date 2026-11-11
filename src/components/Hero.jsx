import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Github,
  Linkedin,
  Mail,
  Code2,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';
import Reveal from './Reveal';

const pointIcons = [Code2, ShieldCheck, CheckCircle2];

export default function Hero() {
  const { t } = useLanguage();
  const { navigateTo } = useNavigation();
  const [isCvMenuOpen, setIsCvMenuOpen] = useState(false);
  const cvMenuRef = useRef(null);

  useEffect(() => {
    if (!isCvMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (cvMenuRef.current && !cvMenuRef.current.contains(event.target)) {
        setIsCvMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsCvMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCvMenuOpen]);

  const socialLinks = [
    {
      label: t.hero.socials.github,
      href: 'https://github.com/KevinDarnet',
      icon: Github,
    },
    {
      label: t.hero.socials.linkedin,
      href: 'https://www.linkedin.com/in/kevin-darnet',
      icon: Linkedin,
    },
    {
      label: t.hero.socials.email,
      href: `mailto:${t.contact.emailAddress}`,
      icon: Mail,
    },
  ];

  const defaultPoints = [
    {
      label: 'Desarrollo Core',
      value: 'Node.js, Express, React, MongoDB, arquitectura modular.',
    },
    {
      label: 'Defensa en Código',
      value: 'Criptografía aplicada, control de inyecciones (SQL/NoSQL/XSS), gestión segura de sesiones.',
    },
    {
      label: 'Roadmap Académico',
      value: 'Licenciatura en Ciberdefensa (ingreso 2027), especialización continua en seguridad y desarrollo web.',
    },
  ];

  const profilePoints = t.hero.profilePoints || defaultPoints;

  return (
    <section
      id="about"
      aria-labelledby="hero-heading"
      className="relative pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 w-full min-h-screen flex flex-col justify-start scroll-mt-16 md:scroll-mt-24 border-b border-[#222222] lg:border-b-0"
    >
      {/* Subtle geometric background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 select-none"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-[#2a2a2a]" />
        <div className="absolute top-40 -right-12 w-72 h-72 rounded-full border border-[#222222]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
        {/* Main Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column (8 cols): Imposing Title, Tagline, Pill CTAs & Social Chips */}
          <Reveal delay={50} className="relative z-20 lg:col-span-8 flex flex-col justify-between rounded-3xl bg-[#141414] border border-[#262626] p-6 sm:p-10 lg:p-12 hover:border-[#383838] transition-colors duration-300">
            <div>
              {/* Status indicator */}
              <div className="inline-flex items-center gap-2 font-mono text-xs text-[#A0A0A0] mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{t.hero.status}</span>
              </div>

              {/* Imposing Clean Sans-serif Title */}
              <h1
                id="hero-heading"
                className="font-sans font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#F5F5F5]"
              >
                <span className="block">{t.hero.rolePrefix}</span>
                <span className="block text-[#A0A0A0] mt-1 sm:mt-1.5">
                  {t.hero.roleHighlight}
                </span>
              </h1>

              {/* Tagline */}
              <p className="mt-6 sm:mt-8 text-base sm:text-lg text-[#A0A0A0] max-w-2xl leading-relaxed font-normal">
                {t.hero.tagline}
              </p>
            </div>

            {/* CTAs & Quick Links */}
            <div className="mt-10 pt-8 border-t border-[#242424] flex flex-col gap-5">
              {/* Primary & Secondary Outline CTAs */}
              <div className="flex flex-wrap items-center gap-3.5">
                <a
                  href="#projects"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('projects');
                  }}
                  className="group inline-flex items-center gap-3 rounded-full bg-[#F5F5F5] text-[#0d0d0d] px-6 py-3.5 font-mono text-xs sm:text-sm font-semibold tracking-wide hover:bg-white transition-all duration-300"
                >
                  <span>{t.hero.ctaPrimary}</span>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0d0d0d] text-[#F5F5F5] group-hover:translate-x-0.5 transition-transform duration-300">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  </span>
                </a>

                {/* Dropdown selector de formato de CV estático */}
                <div ref={cvMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCvMenuOpen((prev) => !prev)}
                    aria-expanded={isCvMenuOpen}
                    aria-haspopup="menu"
                    className={`group inline-flex items-center gap-2.5 rounded-full bg-[#1e1e1e] text-[#F5F5F5] border px-6 py-3.5 font-mono text-xs sm:text-sm font-medium transition-all duration-300 ${
                      isCvMenuOpen
                        ? 'border-emerald-500/50 bg-[#232323]'
                        : 'border-[#333333] hover:border-[#F5F5F5]'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-[#A0A0A0] group-hover:text-emerald-400 transition-colors duration-300" />
                    <span>{t.hero.ctaCv || 'CV Técnico'}</span>
                    <span
                      aria-hidden="true"
                      className={`text-xs text-[#A0A0A0] group-hover:text-[#F5F5F5] transition-transform duration-200 ${
                        isCvMenuOpen ? 'rotate-180 text-emerald-400' : ''
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  {isCvMenuOpen && (
                    <div
                      role="menu"
                      aria-label={t.hero.ctaCv || 'CV Técnico'}
                      className="absolute left-0 top-full mt-2.5 w-64 sm:w-72 z-30 rounded-xl bg-[#111317] border border-white/10 shadow-2xl p-1.5 backdrop-blur-md"
                    >
                      <a
                        role="menuitem"
                        href="/cv-kevin-darnet.html?theme=dark"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsCvMenuOpen(false)}
                        className="flex items-center justify-between gap-2 w-full rounded-lg px-3.5 py-2.5 font-mono text-xs text-[#E5E5E5] hover:bg-emerald-500/10 hover:text-emerald-300 border border-transparent hover:border-emerald-500/20 transition-all duration-200"
                      >
                        <span>{t.hero.ctaCvDark || '🌙 Versión Oscura (Tema Web)'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      </a>

                      <a
                        role="menuitem"
                        href="/cv-kevin-darnet.html?theme=light"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsCvMenuOpen(false)}
                        className="mt-1 flex items-center justify-between gap-2 w-full rounded-lg px-3.5 py-2.5 font-mono text-xs text-[#E5E5E5] hover:bg-emerald-500/10 hover:text-emerald-300 border border-transparent hover:border-emerald-500/20 transition-all duration-200"
                      >
                        <span>{t.hero.ctaCvLight || '☀️ Versión Clara (ATS / Imprimible)'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Access Links: Contáctame + Social Quick Chips */}
              <div className="flex flex-wrap items-center gap-2" aria-label="Accesos rápidos y redes profesionales">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('contact');
                  }}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-[#1b1b1b] border border-[#2e2e2e] hover:border-[#F5F5F5] px-3.5 py-2 font-mono text-xs text-[#F5F5F5] transition-all duration-300"
                >
                  <span>{t.hero.ctaSecondary}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#A0A0A0] group-hover:text-[#F5F5F5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </a>

                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target={social.href.startsWith('http') ? '_blank' : undefined}
                      rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1b1b1b] border border-[#2e2e2e] hover:border-[#F5F5F5] px-3.5 py-2 font-mono text-xs text-[#A0A0A0] hover:text-[#F5F5F5] transition-all duration-300"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{social.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Right Column (4 cols): Unified Clean Technical Profile Card */}
          <Reveal delay={180} className="lg:col-span-4 flex">
            <div className="w-full rounded-3xl bg-[#141414] border border-[#262626] p-6 sm:p-8 lg:p-8 flex flex-col justify-start hover:border-[#383838] transition-colors duration-300">
              {/* Header row: // PERFIL TÉCNICO + Badge sutil */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#888888] whitespace-nowrap">
                  {t.hero.profileHeader || '// PERFIL TÉCNICO'}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-emerald-400 bg-[#111f17] border border-emerald-500/30 rounded-full px-2.5 py-0.5 whitespace-nowrap shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t.hero.profileBadge || 'AppSec & Ciberdefensa'}
                </span>
              </div>

              {/* Breve resumen enfocado */}
              <p className="text-sm sm:text-base text-[#CFCFCF] leading-relaxed font-normal">
                {t.hero.profileSummary ||
                  'Enfoque defensivo aplicado al código: análisis de superficie de ataque, control de acceso robusto y pipelines seguros para entornos de producción.'}
              </p>

              {/* Divisor sutil natural */}
              <div className="my-6 border-t border-[#242424]" />

              {/* Minimalist 3 Key Points agrupados con separación uniforme */}
              <div className="space-y-4">
                {profilePoints.map((point, idx) => {
                  const Icon = pointIcons[idx] || CheckCircle2;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#1b1b1b] border border-[#2e2e2e] text-[#F5F5F5] shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-[#A0A0A0]" />
                      </div>
                      <div className="text-xs sm:text-sm leading-relaxed">
                        <span className="font-mono font-semibold text-[#F5F5F5] mr-1.5">
                          {point.label}:
                        </span>
                        <span className="text-[#A0A0A0]">{point.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
