/**
 * Funções utilitárias para formatação
 */

import { format } from "date-fns";

/**
 * Formata timestamp para exibição (HH:mm)
 */
export function formatTime(timestamp: Date): string {
  return format(timestamp, "HH:mm");
}

/**
 * Formata timestamp para exibição localizada
 */
export function formatTimeLocalized(timestamp: Date): string {
  return timestamp.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
