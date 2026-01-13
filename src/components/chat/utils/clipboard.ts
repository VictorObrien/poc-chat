/**
 * Funções utilitárias para operações de clipboard
 */

/**
 * Copia texto para a área de transferência
 */
export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
