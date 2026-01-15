/**
 * Configuração de componentes para ReactMarkdown
 */

import React from "react";
import type { Components } from "react-markdown";
import { CodeBlock } from "@/components/ui/code-block";

/**
 * Componentes customizados para renderização de markdown
 */
export const markdownComponents: Components = {
  // Estilizar parágrafos
  p: ({ children }) => <p className="text-white mb-3 last:mb-0">{children}</p>,
  // Estilizar cabeçalhos
  h1: ({ children }) => (
    <h1 className="text-white text-xl font-bold mb-2 mt-4 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-white text-lg font-bold mb-2 mt-4 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-white text-base font-semibold mb-2 mt-3 first:mt-0">
      {children}
    </h3>
  ),
  // Estilizar listas
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-3 space-y-1 text-white">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-3 space-y-1 text-white">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-white ml-4">{children}</li>,
  // Estilizar código inline
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="bg-[#2a2a5a] text-yellow-400 px-1.5 py-0.5 rounded text-xs font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  // Estilizar blocos de código com botão de copiar
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  // Estilizar links
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-yellow-400 hover:text-yellow-300 underline"
      {...props}
    >
      {children}
    </a>
  ),
  // Estilizar blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-gray-300 my-3">
      {children}
    </blockquote>
  ),
  // Estilizar tabelas
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full border-collapse border border-[#2a2a5a]">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-[#2a2a5a] px-4 py-2 bg-[#2a2a5a] text-white font-semibold text-left">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-[#2a2a5a] px-4 py-2 text-white">{children}</td>
  ),
  // Estilizar linhas horizontais
  hr: () => <hr className="border-[#2a2a5a] my-4" />,
  // Estilizar texto forte e ênfase
  strong: ({ children }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="text-gray-300 italic">{children}</em>,
};
