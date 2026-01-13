/**
 * Hook para gerenciar estado de hover
 */

import { useState, useCallback } from "react";

interface UseHoverReturn {
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Hook que gerencia o estado de hover de um elemento
 */
export function useHover(): UseHoverReturn {
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return {
    isHovered,
    onMouseEnter,
    onMouseLeave,
  };
}
