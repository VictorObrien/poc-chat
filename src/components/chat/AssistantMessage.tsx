"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AssistantMessageProps {
  message: string;
  timestamp: Date;
  onCopy?: () => void;
}

// Componente para blocos de código com botão de copiar
function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    if (codeRef.current) {
      // Extrair o texto do código
      const codeElement = codeRef.current.querySelector("code");
      const textToCopy = codeElement?.textContent || "";

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group/codeblock mb-3">
      <pre
        ref={codeRef}
        className="bg-[#1a1a4a] border border-[#2a2a5a] rounded-lg p-4 overflow-x-auto"
      >
        {children}
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 text-gray-400 hover:text-yellow-400 hover:bg-[#2a2a5a] opacity-0 group-hover/codeblock:opacity-100 transition-opacity"
        onClick={handleCopy}
        title="Copiar código"
      >
        {copied ? (
          <Check className="size-4 text-yellow-400" />
        ) : (
          <Copy className="size-4" />
        )}
      </Button>
    </div>
  );
}

export function AssistantMessage({
  message,
  timestamp,
  onCopy,
}: AssistantMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="group relative flex flex-col items-start gap-2 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mensagem do assistente - sem bubble, alinhada à esquerda, com markdown */}
      <div className="w-full max-w-[80%] text-white text-sm leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Estilizar parágrafos
            p: ({ children }) => (
              <p className="text-white mb-3 last:mb-0">{children}</p>
            ),
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
            li: ({ children }) => (
              <li className="text-white ml-4">{children}</li>
            ),
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
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 underline"
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
              <td className="border border-[#2a2a5a] px-4 py-2 text-white">
                {children}
              </td>
            ),
            // Estilizar linhas horizontais
            hr: () => <hr className="border-[#2a2a5a] my-4" />,
            // Estilizar texto forte e ênfase
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="text-gray-300 italic">{children}</em>
            ),
          }}
        >
          {message}
        </ReactMarkdown>
      </div>

      {/* Container com altura fixa para evitar layout shift */}
      <div className="h-[40px] flex flex-col items-start justify-start">
        {/* Opções no hover - apenas copiar */}
        {isHovered && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="text-xs text-gray-400">
              {timestamp.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-yellow-400 hover:bg-[#2a2a5a]"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="size-4 text-yellow-400" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
