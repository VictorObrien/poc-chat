/**
 * Hook para gerenciar scroll automático no nível do browser (window)
 */

import { useEffect } from "react";

interface UseAutoScrollOptions {
  /**
   * Array de dependências que quando mudarem, o scroll será executado
   */
  dependencies?: unknown[];
  /**
   * Se deve fazer scroll suave
   */
  smooth?: boolean;
  /**
   * Delay em ms antes de fazer scroll (útil para aguardar renderização)
   */
  delay?: number;
  /**
   * Se deve fazer scroll apenas se já estiver próximo do final
   */
  onlyIfNearBottom?: boolean;
  /**
   * Threshold em pixels para considerar "próximo do final"
   */
  threshold?: number;
}

/**
 * Hook que gerencia scroll automático para o final da página (window)
 */
export function useAutoScroll(options: UseAutoScrollOptions = {}): void {
  const {
    dependencies = [],
    smooth = true,
    delay = 100,
    onlyIfNearBottom = false,
    threshold = 100,
  } = options;

  useEffect(() => {
    // Delay para aguardar renderização
    const timeoutId = setTimeout(() => {
      // Verifica se estamos no browser
      if (typeof window === "undefined") return;

      // Se onlyIfNearBottom, verifica se está próximo do final
      if (onlyIfNearBottom) {
        const { scrollTop, scrollHeight, clientHeight } =
          document.documentElement;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        // Se não estiver próximo do final, não faz scroll
        if (distanceFromBottom > threshold) {
          return;
        }
      }

      // Scroll para o final da página
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }, delay);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
