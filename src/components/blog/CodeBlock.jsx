import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

/**
 * Tokenizador liviano de sintaxis para bloques de código en Dark Mode
 */
function highlightCode(code, language = '') {
  // Regex para tokens: comentarios, strings, keywords, booleans, números, tipos/clases, funciones
  const tokenRegex =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|import|export|from|default|class|extends|async|await|if|else|for|while|switch|case|break|try|catch|throw|new|typeof|instanceof|interface|type|public|private|match|allow|read|write|create|update|delete|service)\b)|(\b(?:true|false|null|undefined)\b)|(\b\d+(?:\.\d+)?\b)|(\b[A-Z][a-zA-Z0-9_$]*\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\())/g;

  let lastIndex = 0;
  const elements = [];
  let match;

  while ((match = tokenRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      elements.push({
        text: code.slice(lastIndex, match.index),
        type: 'plain',
      });
    }
    if (match[1]) elements.push({ text: match[1], type: 'comment' });
    else if (match[2]) elements.push({ text: match[2], type: 'string' });
    else if (match[3]) elements.push({ text: match[3], type: 'keyword' });
    else if (match[4]) elements.push({ text: match[4], type: 'boolean' });
    else if (match[5]) elements.push({ text: match[5], type: 'number' });
    else if (match[6]) elements.push({ text: match[6], type: 'type' });
    else if (match[7]) elements.push({ text: match[7], type: 'function' });
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < code.length) {
    elements.push({ text: code.slice(lastIndex), type: 'plain' });
  }

  return elements.map((t, idx) => {
    switch (t.type) {
      case 'comment':
        return (
          <span key={idx} className="text-[#71717A] italic">
            {t.text}
          </span>
        );
      case 'string':
        return (
          <span key={idx} className="text-emerald-300">
            {t.text}
          </span>
        );
      case 'keyword':
        return (
          <span key={idx} className="text-purple-400 font-semibold">
            {t.text}
          </span>
        );
      case 'boolean':
        return (
          <span key={idx} className="text-rose-400">
            {t.text}
          </span>
        );
      case 'number':
        return (
          <span key={idx} className="text-amber-400">
            {t.text}
          </span>
        );
      case 'type':
        return (
          <span key={idx} className="text-cyan-300">
            {t.text}
          </span>
        );
      case 'function':
        return (
          <span key={idx} className="text-blue-400">
            {t.text}
          </span>
        );
      case 'plain':
      default:
        return (
          <span key={idx} className="text-[#E5E5E5]">
            {t.text}
          </span>
        );
    }
  });
}

export default function CodeBlock({ node, inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const rawCode = String(children).replace(/\n$/, '');
  const [copied, setCopied] = useState(false);

  // Manejo de código inline (ej: `const a = 1`)
  const isInline = !match && !rawCode.includes('\n');
  if (isInline) {
    return (
      <code
        className="font-mono text-xs sm:text-[13px] px-1.5 py-0.5 rounded-md bg-[#1a1a1a] text-emerald-400 border border-[#333333]"
        {...props}
      >
        {children}
      </code>
    );
  }

  const language = match ? match[1].toLowerCase() : 'code';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden bg-[#111111] border border-[#2a2a2a] shadow-xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#181818] border-b border-[#262626]">
        {/* Terminal Mac-style Dots & Language Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3f3f46]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3f3f46]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3f3f46]" />
          </div>
          <span className="font-mono text-xs text-[#888888] uppercase tracking-wider flex items-center gap-1">
            <Terminal className="w-3 h-3 text-emerald-400" />
            {language}
          </span>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-[#A0A0A0] hover:text-[#F5F5F5] bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] transition-colors duration-200"
          aria-label="Copiar código al portapapeles"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Code Pre/Content */}
      <pre className="p-4 sm:p-5 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-[#2c2c2c]">
        <code>{highlightCode(rawCode, language)}</code>
      </pre>
    </div>
  );
}
