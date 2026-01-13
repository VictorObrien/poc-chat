"use client";

import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { useChatMessages } from "./hooks/useChatMessages";

interface ChatSectionProps {
  onMessageSent?: (hasMessages: boolean) => void;
}

export function ChatSection({ onMessageSent }: ChatSectionProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    resendMessage,
    editMessage,
    copyMessage,
  } = useChatMessages({ onMessageSent });

  return (
    <div className="flex flex-col gap-4 w-full">
      <MessageList
        messages={messages}
        onResend={resendMessage}
        onEdit={editMessage}
        onCopy={copyMessage}
      />
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm px-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
          <span>Pensando...</span>
        </div>
      )}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          Erro: {error.message}
        </div>
      )}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
