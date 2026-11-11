import React from 'react';
import { Layout, Server, Database, ShieldCheck, CheckCircle2, Wrench } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Reveal from './Reveal';

const iconMap = {
  frontend: Layout,
  backend: Server,
  database: Database,
  security: ShieldCheck,
};

export default function TechStack() {
  const { t } = useLanguage();

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 w-full min-h-screen flex flex-col justify-start scroll-mt-16 md:scroll-mt-24 border-b border-[#222222] lg:border-b-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <span className="font-mono text-xs sm:text-sm text-[#888888] block mb-3">
              {t.skills.breadcrumb}
            </span>
            <h2
              id="skills-heading"
              className="font-mono text-2xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight"
            >
              {t.skills.title}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#A0A0A0] max-w-xl leading-relaxed">
            {t.skills.subtitle}
          </p>
        </Reveal>

        {/* 4 Modular Cards Grid with Stagger */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {t.skills.categories.map((category, index) => {
            const Icon = iconMap[category.id] || ShieldCheck;
            const isSecurity = category.id === 'security';

            return (
              <Reveal
                key={category.id}
                delay={index * 110}
                className="h-full"
              >
                <article
                  className={`h-full rounded-3xl p-6 sm:p-9 border transition-all duration-300 ease-out flex flex-col justify-between ${
                    isSecurity
                      ? 'bg-[#1a1a1a] border-[#3d3d3d] hover:border-[#F5F5F5]'
                      : 'bg-[#151515] border-[#282828] hover:border-[#484848]'
                  }`}
                >
                  <div>
                    {/* Top Bar: Code Tag + Icon */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <span className="font-mono text-xs tracking-wider text-[#888888] bg-[#202020] border border-[#303030] rounded-full px-3.5 py-1">
                        {category.code}
                      </span>

                      <div
                        className={`p-2.5 rounded-2xl border transition-colors duration-300 ${
                          isSecurity
                            ? 'bg-[#F5F5F5] text-[#0d0d0d] border-[#F5F5F5]'
                            : 'bg-[#202020] text-[#F5F5F5] border-[#333333]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Card Title & Subtitle */}
                    <h3 className="font-mono text-xl sm:text-2xl font-bold text-[#F5F5F5] mb-2.5">
                      {category.title}
                    </h3>
                    <p className="text-sm text-[#A0A0A0] leading-relaxed mb-6">
                      {category.description}
                    </p>

                    {/* Bullet List of Core Capabilities */}
                    <ul className="space-y-3 mb-7">
                      {category.skills.map((skill) => (
                        <li
                          key={skill}
                          className="flex items-start gap-3 text-sm text-[#D8D8D8] leading-relaxed"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#A0A0A0] shrink-0 mt-0.5" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom Footer: Tags or Security Tools */}
                  <div className="pt-5 border-t border-[#262626]">
                    {category.tags && (
                      <div className="flex flex-wrap gap-2">
                        {category.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-xs px-3 py-1 rounded-full bg-[#202020] text-[#CFCFCF] border border-[#333333]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {category.tools && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#888888] mr-1">
                          <Wrench className="w-3.5 h-3.5" />
                          {category.toolsLabel}
                        </span>
                        {category.tools.map((tool) => (
                          <span
                            key={tool}
                            className="font-mono text-xs px-3 py-1 rounded-full bg-[#242424] text-[#F5F5F5] border border-[#3a3a3a]"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
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
