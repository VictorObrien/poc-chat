"use client";

import { useState } from "react";
import { RotateCw, Pencil, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ChatBubbleProps {
  message: string;
  timestamp: Date;
  onResend?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
}

export function ChatBubble({
  message,
  timestamp,
  onResend,
  onEdit,
  onCopy,
}: ChatBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = format(timestamp, "HH:mm");

  return (
    <div
      className="group relative flex flex-col items-end gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bubble da mensagem */}
      <div className="rounded-2xl bg-[#1a1a4a] px-4 py-3 max-w-[80%]">
        <p className="text-white text-sm leading-relaxed">{message}</p>
      </div>

      {/* Container com altura fixa para evitar layout shift */}
      <div className="h-[60px] flex flex-col items-end justify-start">
        {/* Opções no hover */}
        {isHovered && (
          <div className="flex flex-col items-end gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{formattedTime}</span>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-yellow-400 hover:bg-[#2a2a5a]"
                  onClick={onResend}
                  onMouseEnter={() => setHoveredAction("reenviar")}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <RotateCw className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-yellow-400 hover:bg-[#2a2a5a]"
                  onClick={onEdit}
                  onMouseEnter={() => setHoveredAction("editar")}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <Pencil className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-yellow-400 hover:bg-[#2a2a5a]"
                  onClick={handleCopy}
                  onMouseEnter={() => setHoveredAction("copiar")}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  {copied ? (
                    <Check className="size-4 text-yellow-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Label que aparece quando hover sobre os botões */}
            {hoveredAction && (
              <div className="mt-1 px-3 py-1.5 rounded-lg bg-[#1a1a4a] text-white text-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
                {hoveredAction === "reenviar" && "Reenviar"}
                {hoveredAction === "editar" && "Editar"}
                {hoveredAction === "copiar" && (copied ? "Copiado" : "Copiar")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
