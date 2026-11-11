import React, { useEffect, useState, useCallback } from 'react';
import { ArrowDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';

const SCROLL_OVERFLOW_THRESHOLD_PX = 48;
const BOTTOM_PROXIMITY_THRESHOLD_PX = 80;

/**
 * Indicador global flotante de scroll ("scroll affordance").
 * Se muestra automáticamente en cualquier sección o vista cuyo contenido exceda
 * la altura del viewport y desaparece suavemente al llegar cerca del final.
 */
export default function ScrollAffordance() {
  const { t } = useLanguage();
  const { activeSection, isDesktop } = useNavigation();
  const [isVisible, setIsVisible] = useState(false);

  const evaluateScrollState = useCallback(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const docEl = document.documentElement;
    const scrollHeight = docEl.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY || docEl.scrollTop || 0;

    const requiresScroll = scrollHeight - viewportHeight > SCROLL_OVERFLOW_THRESHOLD_PX;
    const distanceToBottom = scrollHeight - (scrollTop + viewportHeight);
    const isNearBottom = distanceToBottom <= BOTTOM_PROXIMITY_THRESHOLD_PX;

    setIsVisible(requiresScroll && !isNearBottom);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    let rafId = null;

    const scheduleEvaluate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        evaluateScrollState();
      });
    };

    // Evaluación inicial y tras el frame de montaje/cambio de vista
    scheduleEvaluate();

    window.addEventListener('scroll', scheduleEvaluate, { passive: true });
    window.addEventListener('resize', scheduleEvaluate, { passive: true });
    window.addEventListener('hashchange', scheduleEvaluate, { passive: true });

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && document.body) {
      resizeObserver = new ResizeObserver(scheduleEvaluate);
      resizeObserver.observe(document.body);
    }

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', scheduleEvaluate);
      window.removeEventListener('resize', scheduleEvaluate);
      window.removeEventListener('hashchange', scheduleEvaluate);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [activeSection, isDesktop, evaluateScrollState]);

  const handleScrollDown = () => {
    window.scrollBy({ top: 350, behavior: 'smooth' });
  };

  const label = t.scrollAffordance?.label || '// SCROLL PARA CONTINUAR';

  return (
    <button
      type="button"
      onClick={handleScrollDown}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      aria-label={label}
      className={`scroll-affordance-pill inline-flex items-center gap-2 sm:gap-2.5 rounded-full border border-[#2a2a2a] hover:border-emerald-500/45 px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-xl shadow-black/60 max-w-[calc(100vw-2rem)] ${
        isVisible ? '' : 'is-hidden'
      }`}
    >
      <span className="font-mono text-[11px] sm:text-xs tracking-wide text-[#D4D4D4] whitespace-nowrap">
        {label}
      </span>
      <ArrowDown className="w-3.5 h-3.5 text-emerald-400 shrink-0 scroll-affordance-arrow" />
    </button>
  );
}
