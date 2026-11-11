import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ArrowLeft, Calendar, Clock, Share2, Check, User, Terminal, Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import CodeBlock from './CodeBlock';
import Callout from './Callout';

/**
 * Normaliza bloques matemáticos escritos en una sola línea (`$$formula$$`)
 * a formato multilínea (`$$\nformula\n$$`) fuera de bloques de código cercados,
 * para que remark-math los interprete en modo display (bloque centrado) y no inline.
 */
function normalizeBlockMath(markdown = '') {
  const lines = markdown.split('\n');
  let activeFence = null;
  const output = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);

    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!activeFence) {
        activeFence = marker[0];
      } else if (trimmed.startsWith(activeFence.repeat(3))) {
        activeFence = null;
      }
      output.push(line);
      continue;
    }

    if (!activeFence) {
      const singleLineBlock = trimmed.match(/^\$\$(?!\$)(.+)\$\$$/);
      if (singleLineBlock && !singleLineBlock[1].includes('$$')) {
        output.push('$$');
        output.push(singleLineBlock[1].trim());
        output.push('$$');
        continue;
      }
    }

    output.push(line);
  }

  return output.join('\n');
}

export default function ArticleView({ post, onBack }) {
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const [copiedLink, setCopiedLink] = useState(false);

  const displayCategory = isEn && post.categoryEn ? post.categoryEn : post.category;
  const displayReadTime = isEn && post.readTimeEn ? post.readTimeEn : post.readTime;
  const processedContent = useMemo(() => normalizeBlockMath(post.content), [post.content]);

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  // Custom Markdown components mapping
  const markdownComponents = {
    code: CodeBlock,

    h1: ({ node, ...props }) => (
      <h1
        className="font-mono text-xl sm:text-2xl font-bold text-white mt-8 mb-3 tracking-tight border-b border-[#262626] pb-2.5"
        {...props}
      />
    ),

    h2: ({ node, ...props }) => (
      <h2
        className="font-mono text-lg sm:text-xl font-bold text-[#F5F5F5] mt-7 mb-3 tracking-tight border-b border-[#222222] pb-2"
        {...props}
      />
    ),

    h3: ({ node, ...props }) => (
      <h3
        className="font-mono text-base sm:text-lg font-semibold text-[#E5E5E5] mt-5 mb-2"
        {...props}
      />
    ),

    p: ({ node, ...props }) => (
      <p className="text-sm sm:text-base text-[#B5B5B5] leading-relaxed mb-4 font-sans" {...props} />
    ),

    ul: ({ node, ...props }) => <ul className="space-y-1.5 mb-5 list-none pl-1" {...props} />,

    ol: ({ node, ...props }) => (
      <ol className="space-y-1.5 mb-5 list-decimal pl-6 text-[#A0A0A0]" {...props} />
    ),

    li: ({ node, children, ...props }) => (
      <li className="flex items-start gap-2.5 text-sm sm:text-base text-[#B5B5B5]" {...props}>
        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
        <span className="leading-relaxed">{children}</span>
      </li>
    ),

    // Detection of Callouts / Admonitions inside blockquotes
    blockquote: ({ node, children, ...props }) => {
      // Inspect string content to see if it is a callout
      const textContent = Array.isArray(children)
        ? children.map((c) => (typeof c === 'string' ? c : c?.props?.children || '')).join(' ')
        : '';

      if (textContent.includes('[!SECURITY]') || textContent.includes('// Security')) {
        return (
          <Callout type="security" title="// SECURITY BASELINE (OWASP)">
            {children}
          </Callout>
        );
      }
      if (textContent.includes('[!ARCHITECTURE]') || textContent.includes('// Architecture')) {
        return (
          <Callout type="architecture" title="// ARCHITECTURE & IMPACT">
            {children}
          </Callout>
        );
      }
      if (textContent.includes('[!WARNING]') || textContent.includes('// Warning')) {
        return (
          <Callout type="warning" title="// SYSTEM ADVISORY">
            {children}
          </Callout>
        );
      }

      return (
        <blockquote
          className="my-5 rounded-2xl bg-[#141414] border-l-4 border-emerald-500 border-r border-t border-b border-[#262626] p-4 text-sm sm:text-base text-[#D4D4D4] italic font-sans"
          {...props}
        >
          {children}
        </blockquote>
      );
    },

    a: ({ node, ...props }) => (
      <a
        className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors font-medium"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),

    hr: () => <hr className="my-8 border-[#262626]" />,

    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-6 rounded-2xl border border-[#262626] bg-[#141414]">
        <table className="w-full text-left text-sm" {...props} />
      </div>
    ),

    th: ({ node, ...props }) => (
      <th
        className="bg-[#1c1c1c] p-3 text-xs font-mono uppercase text-[#888888] border-b border-[#262626]"
        {...props}
      />
    ),

    td: ({ node, ...props }) => (
      <td className="p-3 text-sm text-[#A0A0A0] border-b border-[#222222]" {...props} />
    ),
  };

  return (
    <article className="w-full max-w-4xl mx-auto">
      {/* Article Header: flujo vertical continuo sin dependencias de scroll */}
      <header className="mb-6">
        {/* Navigation & Action Bar: Botón 'Volver a artículos' con margen inferior mb-4 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2 rounded-full bg-[#161616] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#4d4d4d] px-3.5 py-1.5 font-mono text-xs text-[#A0A0A0] hover:text-[#F5F5F5] transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>{t.blog?.backToList || 'Volver a artículos'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#161616] hover:bg-[#222222] border border-[#2a2a2a] px-3 py-1.5 font-mono text-xs text-[#888888] hover:text-[#F5F5F5] transition-colors"
            title="Copiar enlace del artículo"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">
                  {t.blog?.copiedLink || 'Enlace copiado'}
                </span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.blog?.shareArticle || 'Compartir'}</span>
              </>
            )}
          </button>
        </div>

        {/* Category & Date Metadata */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs mb-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-full px-2.5 py-0.5 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {displayCategory}
          </span>
          <span className="text-[#555555]">•</span>
          <span className="inline-flex items-center gap-1.5 text-[#888888]">
            <Calendar className="w-3.5 h-3.5" />
            {post.date}
          </span>
          <span className="text-[#555555]">•</span>
          <span className="inline-flex items-center gap-1.5 text-[#888888]">
            <Clock className="w-3.5 h-3.5" />
            {displayReadTime}
          </span>
        </div>

        {/* Imposing Title */}
        <h1 className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug mb-3.5">
          {post.title}
        </h1>

        {/* Tags: Título y tags con margen inferior mb-6 */}
        <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-[#222222]">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[11px] px-2.5 py-0.5 rounded-lg bg-[#1c1c1c] text-[#A0A0A0] border border-[#2a2a2a]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </header>

      {/* Main Markdown Article Content: renderizado de inmediato al 100% de opacidad sin esperas */}
      <div className="mt-0 mb-12 rounded-3xl bg-[#141414] border border-[#242424] p-5 sm:p-8 lg:p-9 text-[#E0E0E0] opacity-100">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeKatex, { strict: false }]]}
          components={markdownComponents}
        >
          {processedContent}
        </ReactMarkdown>

        {/* Article Footer & Author Box */}
        <div className="mt-12 pt-8 border-t border-[#262626]">
          <div className="rounded-2xl bg-[#181818] border border-[#2c2c2c] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#222222] border border-[#333333] flex items-center justify-center shrink-0">
                <Terminal className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-mono text-sm font-bold text-[#F5F5F5]">
                  Kevin Darnet
                </h4>
                <p className="text-xs text-[#888888] font-mono mt-0.5">
                  {t.blog?.authorBio ||
                    'Full-Stack MERN Developer | Cybersecurity & AppSec Student'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full bg-[#222222] hover:bg-[#F5F5F5] text-[#F5F5F5] hover:text-[#0d0d0d] border border-[#333333] px-5 py-2 font-mono text-xs font-medium transition-all duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.blog?.backToList || 'Volver a artículos'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
