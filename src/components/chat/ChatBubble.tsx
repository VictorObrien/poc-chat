"use client";

import { useState } from "react";
import { RotateCw, Pencil, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useHover } from "./hooks/useHover";
import { useCopyToClipboard } from "./hooks/useCopyToClipboard";
import { useMessageEdit } from "./hooks/useMessageEdit";
import { formatTime } from "./utils/format";

interface ChatBubbleProps {
  message: string;
  timestamp: Date;
  onResend?: () => void;
  onEdit?: (newMessage: string) => void;
  onCopy?: () => void;
}

export function ChatBubble({
  message,
  timestamp,
  onResend,
  onEdit,
  onCopy,
}: ChatBubbleProps) {
  const { isHovered, onMouseEnter, onMouseLeave } = useHover();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const { copied, copy } = useCopyToClipboard({ onCopy });
  const {
    isEditing,
    editedMessage,
    setEditedMessage,
    startEditing,
    cancelEditing,
    saveEditing,
    textareaRef,
    canSave,
  } = useMessageEdit({
    initialMessage: message,
    onSave: onEdit,
  });

  const handleCopy = async () => {
    await copy(message);
  };

  const formattedTime = formatTime(timestamp);

  // Se estiver editando, mostrar input de edição
  if (isEditing) {
    return (
      <div className="flex flex-col items-end self-end gap-2 w-full max-w-[80%]">
        <div className="relative flex w-full items-end gap-2 rounded-2xl bg-[#1a1a4a] p-2 shadow-sm">
          <div className="flex w-full items-end gap-2 rounded-2xl bg-[#1a1a4a]">
            <Textarea
              ref={textareaRef}
              value={editedMessage}
              onChange={(e) => {
                setEditedMessage(e.target.value);
                // Auto-resize
                if (textareaRef.current) {
                  textareaRef.current.style.height = "auto";
                  textareaRef.current.style.height = `${Math.min(
                    textareaRef.current.scrollHeight,
                    200
                  )}px`;
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveEditing();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelEditing();
                }
              }}
              placeholder="Digite sua mensagem..."
              className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-gray-500"
              rows={1}
            />

            {/* Botões Cancelar e Salvar dentro do wrapper */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="bg-[#1a1a4a] border-0 text-white hover:bg-[#2a2a5a] hover:text-yellow-400"
                onClick={cancelEditing}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-yellow-400 text-black cursor-pointer transition-colors hover:bg-yellow-500 hover:text-black focus-visible:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-400"
                onClick={saveEditing}
                disabled={!canSave}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative flex flex-col items-end gap-2"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
                  onClick={startEditing}
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
