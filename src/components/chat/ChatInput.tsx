"use client";

import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatInput } from "./hooks/useChatInput";

interface ChatInputProps {
  onSend?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  placeholder = "Digite sua mensagem...",
  disabled = false,
}: ChatInputProps) {
  const {
    message,
    setMessage,
    sendMessage,
    isLoading,
    textareaRef,
    handleKeyDown,
  } = useChatInput({ onSend, disabled });

  return (
    <div className="relative flex w-full items-end gap-2 rounded-2xl bg-[#1a1a4a] p-2 shadow-sm transition-all duration-500 ease-in-out">
      <div className="flex w-full items-end gap-2 rounded-2xl bg-[#1a1a4a]">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
          rows={1}
        />
        <Button
          onClick={sendMessage}
          size="icon"
          className="shrink-0 bg-yellow-400 text-black cursor-pointer transition-colors hover:bg-yellow-500 hover:text-black focus-visible:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-400"
          disabled={!message.trim() || isLoading || disabled}
        >
          <Send className="size-4" />
          <span className="sr-only">Enviar mensagem</span>
        </Button>
      </div>
    </div>
  );
}
