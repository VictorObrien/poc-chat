/**
 * Componente para blocos de código com botão de copiar
 */

"use client";

import { useRef } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/components/chat/hooks/useCopyToClipboard";

interface CodeBlockProps {
  children: React.ReactNode;
}

export function CodeBlock({ children }: CodeBlockProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = async () => {
    if (codeRef.current) {
      // Extrair o texto do código
      const codeElement = codeRef.current.querySelector("code");
      const textToCopy = codeElement?.textContent || "";
      await copy(textToCopy);
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
