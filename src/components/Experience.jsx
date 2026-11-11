import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Reveal from './Reveal';

export default function Experience() {
  const { t } = useLanguage();

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 w-full min-h-screen flex flex-col justify-start overflow-y-auto overscroll-y-auto scroll-mt-16 md:scroll-mt-24 border-b border-[#222222] lg:border-b-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <span className="font-mono text-xs sm:text-sm text-[#888888] block mb-3">
              {t.experience.breadcrumb}
            </span>
            <h2
              id="experience-heading"
              className="font-mono text-2xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight"
            >
              {t.experience.title}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#A0A0A0] max-w-xl leading-relaxed">
            {t.experience.subtitle}
          </p>
        </Reveal>

        {/* Sober Modular Table Container */}
        <Reveal delay={100}>
          <div className="rounded-3xl bg-[#141414] border border-[#282828] overflow-x-auto overflow-y-visible overscroll-y-auto">
            {/* Desktop Column Headers */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-6 px-8 py-4 bg-[#1a1a1a] border-b border-[#282828] font-mono text-xs uppercase tracking-wider text-[#888888]">
              <div className="lg:col-span-2">{t.experience.columns.period}</div>
              <div className="lg:col-span-3">{t.experience.columns.role}</div>
              <div className="lg:col-span-3">{t.experience.columns.entity}</div>
              <div className="lg:col-span-4">{t.experience.columns.impact}</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#242424]">
              {t.experience.items.map((item, idx) => (
                <article
                  key={idx}
                  className="group grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 p-6 sm:p-8 hover:bg-[#1b1b1b] transition-colors duration-200 items-start"
                >
                  {/* Period & Duration */}
                  <div className="lg:col-span-2">
                    <div className="font-mono text-sm font-semibold text-[#F5F5F5]">
                      {item.period}
                    </div>
                    <div className="font-mono text-xs text-[#888888] mt-1">
                      {item.duration}
                    </div>
                  </div>

                  {/* Role */}
                  <div className="lg:col-span-3">
                    <h3 className="font-mono text-base sm:text-lg font-bold text-[#F5F5F5] group-hover:text-white transition-colors duration-200">
                      {item.role}
                    </h3>
                  </div>

                  {/* Entity / Independent Project */}
                  <div className="lg:col-span-3">
                    <p className="font-mono text-xs sm:text-sm text-[#CFCFCF]">
                      {item.entity}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#222222] text-[#A0A0A0] border border-[#333333]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Impact Description */}
                  <div className="lg:col-span-4">
                    <p className="text-sm text-[#A0A0A0] leading-relaxed">
                      {item.impact}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
