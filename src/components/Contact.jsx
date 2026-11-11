import React, { useState } from 'react';
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Copy,
  Check,
  MapPin,
  Terminal,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Reveal from './Reveal';

export default function Contact() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(t.contact.emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API fails
    }
  };

  return (
    <footer
      id="contact"
      aria-labelledby="contact-heading"
      className="pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 w-full min-h-screen flex flex-col justify-start scroll-mt-16 md:scroll-mt-24 bg-[#0d0d0d]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Contact Modular Container with Reveal */}
        <Reveal>
          <div className="rounded-3xl bg-[#161616] border border-[#2c2c2c] p-6 sm:p-10 lg:p-14 hover:border-[#3a3a3a] transition-colors duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column (7 cols): Monospace Header, Availability & Description */}
              <div className="lg:col-span-7">
                {/* Minimalist Monospace Header "... /Contacts..." */}
                <span className="font-mono text-sm sm:text-base text-[#888888] block mb-4">
                  {t.contact.breadcrumb}
                </span>

                {/* Availability Status Badge */}
                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#111f17] border border-emerald-500/30 px-4 py-1.5 mb-6">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="font-mono text-xs text-emerald-300">
                    {t.contact.availability}
                  </span>
                </div>

                <h2
                  id="contact-heading"
                  className="font-mono text-3xl sm:text-5xl font-bold text-[#F5F5F5] tracking-tight leading-tight mb-5"
                >
                  {t.contact.title}
                </h2>

                <p className="text-sm sm:text-base text-[#A0A0A0] max-w-xl leading-relaxed mb-6">
                  {t.contact.description}
                </p>

                <div className="inline-flex items-center gap-2 font-mono text-xs text-[#888888]">
                  <MapPin className="w-4 h-4 text-[#A0A0A0]" />
                  <span>{t.contact.location}</span>
                </div>
              </div>

              {/* Right Column (5 cols): Direct Email & Social Pill Buttons */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6 rounded-2xl bg-[#1e1e1e] border border-[#333333] p-6 sm:p-8">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#888888] block mb-2">
                    {t.contact.emailLabel}
                  </span>
                  <a
                    href={`mailto:${t.contact.emailAddress}`}
                    className="font-mono text-base sm:text-lg font-bold text-[#F5F5F5] hover:underline break-all inline-block transition-colors duration-300"
                  >
                    {t.contact.emailAddress}
                  </a>

                  {/* Email Action Pill Buttons */}
                  <div className="flex flex-wrap items-center gap-3 mt-5">
                    <a
                      href={`mailto:${t.contact.emailAddress}`}
                      className="group inline-flex items-center gap-2.5 rounded-full bg-[#F5F5F5] text-[#0d0d0d] px-5 py-2.5 font-mono text-xs font-semibold hover:bg-white transition-all duration-300 ease-out"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{t.contact.emailAddress}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-2 rounded-full bg-[#141414] text-[#F5F5F5] border border-[#333333] hover:border-[#F5F5F5] px-4 py-2.5 font-mono text-xs transition-all duration-300 ease-out"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">{t.contact.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#A0A0A0]" />
                          <span>{t.contact.copyEmail}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Direct GitHub & LinkedIn Pill Buttons */}
                <div className="pt-6 border-t border-[#2d2d2d]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="https://github.com/KevinDarnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-full bg-[#141414] border border-[#333333] hover:border-[#F5F5F5] px-5 py-3 font-mono text-xs text-[#F5F5F5] transition-all duration-300 ease-out"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Github className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#F5F5F5] transition-colors duration-300" />
                        <span>GitHub</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-[#888888] group-hover:text-[#F5F5F5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </a>

                    <a
                      href="https://www.linkedin.com/in/kevin-darnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-full bg-[#141414] border border-[#333333] hover:border-[#F5F5F5] px-5 py-3 font-mono text-xs text-[#F5F5F5] transition-all duration-300 ease-out"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#F5F5F5] transition-colors duration-300" />
                        <span>LinkedIn</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-[#888888] group-hover:text-[#F5F5F5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Clean Bottom Footer Attribution */}
        <div className="mt-10 pt-6 border-t border-[#1e1e1e] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#888888]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#A0A0A0]" />
            <span className="text-[#F5F5F5] font-medium">{t.contact.footerAttribution}</span>
            <span>· {new Date().getFullYear()}</span>
          </div>

          <div className="text-center sm:text-right">
            <span>{t.contact.footerRights}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
