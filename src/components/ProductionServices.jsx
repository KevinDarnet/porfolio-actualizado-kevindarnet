import React from 'react';
import {
  ArrowUpRight,
  Server,
  Shield,
  Activity,
  GraduationCap,
  ShieldCheck,
  Github,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Reveal from './Reveal';

const serviceIcons = {
  'prod-1': GraduationCap,
  'prod-2': ShieldCheck,
};

export default function ProductionServices() {
  const { t } = useLanguage();

  return (
    <section
      id="production"
      aria-labelledby="production-heading"
      className="pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 w-full min-h-screen flex flex-col justify-start scroll-mt-16 md:scroll-mt-24 border-b border-[#222222] lg:border-b-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <span className="font-mono text-xs sm:text-sm text-[#888888] block mb-3">
              {t.production.breadcrumb}
            </span>
            <h2
              id="production-heading"
              className="font-mono text-2xl sm:text-4xl font-bold text-[#F5F5F5] tracking-tight"
            >
              {t.production.title}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#A0A0A0] max-w-xl leading-relaxed">
            {t.production.subtitle}
          </p>
        </Reveal>

        {/* 2 Production Service Modular Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {t.production.items.map((service, index) => {
            const Icon = serviceIcons[service.id] || Server;
            const isGitHubCode = service.ctaSecondary?.toLowerCase().includes('github');

            return (
              <Reveal
                key={service.id}
                delay={index * 140}
                className="h-full"
              >
                <article className="h-full group relative rounded-3xl bg-[#181818] border border-[#2e2e2e] hover:border-[#525252] transition-all duration-300 ease-out p-6 sm:p-9 flex flex-col justify-between">
                  <div>
                    {/* Top Status Bar: Active in Production Badge + Category */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                      <div className="inline-flex items-center gap-2.5 rounded-full bg-[#111f17] border border-emerald-500/30 px-3.5 py-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <span className="font-mono text-xs font-medium text-emerald-300 tracking-wide">
                          {t.production.statusBadge}
                        </span>
                      </div>

                      <span className="font-mono text-xs text-[#888888] bg-[#222222] border border-[#333333] rounded-full px-3 py-1">
                        {service.category}
                      </span>
                    </div>

                    {/* Service Title with specialized icon */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="mt-1 p-2.5 rounded-2xl bg-[#222222] border border-[#333333] text-[#F5F5F5] shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono text-xl sm:text-2xl font-bold text-[#F5F5F5] leading-snug">
                        {service.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-[#A0A0A0] leading-relaxed mb-4">
                      {service.description}
                    </p>

                    {/* Impact & Architecture Block */}
                    <div className="rounded-2xl bg-[#121212] border border-[#262626] p-4 mb-6">
                      <p className="text-xs sm:text-sm text-[#CFCFCF] leading-relaxed">
                        <span className="font-mono text-[#888888] mr-2 block sm:inline font-medium">
                          // Architecture &amp; Impact:
                        </span>
                        {service.problemSolved}
                      </p>
                    </div>
                  </div>

                  <div>
                    {/* Key Metric Pill + Tech Stack */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#292929]">
                      <div className="flex flex-wrap gap-1.5" aria-label={t.production.techLabel}>
                        {service.stack.map((tech) => (
                          <span
                            key={tech}
                            className="font-mono text-xs px-3 py-1 rounded-full bg-[#222222] text-[#E0E0E0] border border-[#333333]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full bg-[#242424] border border-[#383838] px-3.5 py-1.5 shrink-0 self-start sm:self-auto">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-xs font-semibold text-[#F5F5F5]">
                          {service.metric}
                        </span>
                      </div>
                    </div>

                    {/* Action Pill Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={service.liveUrl}
                        target={service.liveUrl.startsWith('http') ? '_blank' : undefined}
                        rel={service.liveUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="group/btn inline-flex items-center gap-2.5 rounded-full bg-[#F5F5F5] text-[#0d0d0d] px-5 py-2.5 font-mono text-xs font-semibold hover:bg-white transition-all duration-300 ease-out"
                      >
                        <span>{service.ctaPrimary}</span>
                        <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                      </a>

                      {service.ctaSecondary && (
                        <a
                          href={service.demoUrl}
                          target={service.demoUrl?.startsWith('http') ? '_blank' : undefined}
                          rel={service.demoUrl?.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="group/code inline-flex items-center gap-2 rounded-full bg-[#222222] text-[#F5F5F5] border border-[#333333] hover:border-[#F5F5F5] px-5 py-2.5 font-mono text-xs font-medium transition-all duration-300 ease-out"
                        >
                          {isGitHubCode ? (
                            <Github className="w-3.5 h-3.5 text-[#A0A0A0] group-hover/code:text-[#F5F5F5] transition-colors duration-300" />
                          ) : (
                            <Shield className="w-3.5 h-3.5 text-[#A0A0A0]" />
                          )}
                          <span>{service.ctaSecondary}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#888888] group-hover/code:text-[#F5F5F5] group-hover/code:translate-x-0.5 group-hover/code:-translate-y-0.5 transition-transform duration-300" />
                        </a>
                      )}
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
