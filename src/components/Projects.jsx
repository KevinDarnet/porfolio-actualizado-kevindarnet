import React from 'react';
import { ArrowUpRight, Github, Code2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Reveal from './Reveal';

export default function Projects() {
  const { t } = useLanguage();

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 w-full min-h-screen flex flex-col justify-start scroll-mt-16 md:scroll-mt-24 border-b border-[#222222] lg:border-b-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <span className="font-mono text-xs sm:text-sm text-[#888888] block mb-3">
              {t.projects.breadcrumb}
            </span>
            <h2
              id="projects-heading"
              className="font-mono text-2xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight"
            >
              {t.projects.title}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#A0A0A0] max-w-xl leading-relaxed">
            {t.projects.subtitle}
          </p>
        </Reveal>

        {/* 2x2 Interactive Modular Grid with Stagger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {t.projects.items.map((project, idx) => {
            const hasValidDemo =
              Boolean(project.demoUrl) &&
              project.demoUrl.trim() !== '' &&
              project.demoUrl !== '#';

            return (
              <Reveal
                key={project.id}
                delay={idx * 100}
                className="h-full"
              >
                <article className="h-full group rounded-3xl bg-[#161616] border border-[#2a2a2a] hover:border-[#4d4d4d] transition-all duration-300 ease-out p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    {/* Top Index & Architectural Highlight */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <span className="font-mono text-xs text-[#888888] bg-[#202020] border border-[#303030] rounded-full px-3 py-1">
                        /{project.number}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#A0A0A0]">
                        <Code2 className="w-3.5 h-3.5 text-[#888888]" />
                        {project.highlight}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="font-mono text-xl sm:text-2xl font-bold text-[#F5F5F5] group-hover:text-white transition-colors duration-300 mb-3">
                      {project.title}
                    </h3>

                    {/* Synthetic 2-3 Line Technical Description */}
                    <p className="text-sm sm:text-base text-[#A0A0A0] leading-relaxed mb-4">
                      {project.description}
                    </p>

                    {/* Key Features / Highlights */}
                    {project.features && (
                      <ul className="space-y-1.5 mb-5 text-xs text-[#B5B5B5]">
                        {project.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold shrink-0 leading-tight">•</span>
                            <span className="leading-relaxed">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    {/* Technology Tags */}
                    <div className="flex flex-wrap gap-2 mb-7">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-xs px-3 py-1 rounded-xl bg-[#1f1f1f] text-[#D4D4D4] border border-[#333333]"
                        >
                          [{tag}]
                        </span>
                      ))}
                    </div>

                    {/* Quick Access Pill Buttons */}
                    <div className="pt-5 border-t border-[#242424] flex flex-wrap items-center justify-between gap-3">
                      {hasValidDemo ? (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/demo inline-flex items-center gap-2 rounded-full bg-[#F5F5F5] text-[#0d0d0d] px-5 py-2.5 font-mono text-xs font-semibold hover:bg-white transition-all duration-300 ease-out"
                        >
                          <span>{t.projects.demoBtn}</span>
                          <ArrowUpRight className="w-4 h-4 group-hover/demo:translate-x-0.5 group-hover/demo:-translate-y-0.5 transition-transform duration-300" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          title="Host / Demo en preparación"
                          className="inline-flex items-center gap-2 rounded-full bg-[#181818] text-[#777777] border border-[#2a2a2a] px-4 py-2.5 font-mono text-xs font-medium cursor-not-allowed select-none opacity-60"
                        >
                          <span>{t.projects.demoBtn}</span>
                          <span className="text-[10px] text-[#555555]">// Próximamente</span>
                        </button>
                      )}

                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/repo inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] text-[#F5F5F5] border border-[#333333] hover:border-[#F5F5F5] px-5 py-2.5 font-mono text-xs font-medium transition-all duration-300 ease-out"
                      >
                        <Github className="w-3.5 h-3.5 text-[#A0A0A0] group-hover/repo:text-[#F5F5F5] transition-colors duration-300" />
                        <span>{t.projects.codeBtn}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#A0A0A0] group-hover/repo:text-[#F5F5F5] group-hover/repo:translate-x-0.5 group-hover/repo:-translate-y-0.5 transition-transform duration-300" />
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
