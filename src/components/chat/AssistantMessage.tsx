"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useHover } from "./hooks/useHover";
import { useCopyToClipboard } from "./hooks/useCopyToClipboard";
import { formatTimeLocalized } from "./utils/format";
import { markdownComponents } from "./utils/markdown";

interface AssistantMessageProps {
  message: string;
  timestamp: Date;
  onCopy?: () => void;
}

export function AssistantMessage({
  message,
  timestamp,
  onCopy,
}: AssistantMessageProps) {
  const { isHovered, onMouseEnter, onMouseLeave } = useHover();
  const { copied, copy } = useCopyToClipboard({ onCopy });

  const handleCopy = async () => {
    await copy(message);
  };

  return (
    <div
      className="group relative flex flex-col items-start gap-2 w-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Mensagem do assistente - sem bubble, alinhada à esquerda, com markdown */}
      <div className="w-full max-w-[80%] text-white text-sm leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
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
              {formatTimeLocalized(timestamp)}
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
