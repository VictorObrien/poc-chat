"use client";

import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemMessageProps {
  message: string;
  timestamp: Date;
  options?: string[];
  onOptionSelect?: (option: string) => void;
}

export function SystemMessage({
  message,
  options,
  onOptionSelect,
}: SystemMessageProps) {
  return (
    <div className="flex gap-3 w-full">
      {/* Avatar do sistema */}
      <div className="flex-shrink-0 size-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
        <Bot className="size-4 text-black" />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-3 max-w-[80%]">
        <div className="bg-[#1a1a4a]/80 rounded-2xl rounded-tl-sm px-4 py-3 text-gray-100">
          <p className="text-sm leading-relaxed">{message}</p>
        </div>

        {/* Opções como botões */}
        {options && options.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <Button
                key={option}
                variant="outline"
                size="sm"
                onClick={() => onOptionSelect?.(option)}
                className="bg-[#1a1a4a] border-[#2a2a5a] hover:bg-[#2a2a5a] hover:text-yellow-400 hover:border-yellow-400/50 transition-all"
              >
                {option}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
