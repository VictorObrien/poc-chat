/**
 * Funções utilitárias para manipulação de textarea
 */

const MAX_HEIGHT = 200;

/**
 * Ajusta a altura do textarea automaticamente baseado no conteúdo
 */
export function autoResizeTextarea(
  textarea: HTMLTextAreaElement | null,
  maxHeight: number = MAX_HEIGHT
): void {
  if (!textarea) return;

  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
}

/**
 * Reseta a altura do textarea
 */
export function resetTextareaHeight(
  textarea: HTMLTextAreaElement | null
): void {
  if (!textarea) return;
  textarea.style.height = "auto";
}
