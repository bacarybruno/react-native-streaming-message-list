import { useState, useCallback } from 'react';
import type { Message } from './types';
import { simulateAIResponse } from './simulateAI';

type UseChatMessagesOptions = {
  initialDelay?: number;
  chunkDelay?: number;
};

export const useChatMessages = (options?: UseChatMessagesOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    (text: string) => {
      if (isStreaming || !text.trim()) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        text: text.trim(),
        role: 'user',
        isNew: true,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);

      simulateAIResponse(
        (chunk) => {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, text: lastMessage.text + chunk },
              ];
            } else {
              return [
                ...prev,
                {
                  id: `assistant-${Date.now()}`,
                  text: chunk,
                  role: 'assistant',
                  isNew: true,
                },
              ];
            }
          });
        },
        {
          initialDelay: options?.initialDelay,
          chunkDelay: options?.chunkDelay,
        }
      ).finally(() => setIsStreaming(false));
    },
    [isStreaming, options?.initialDelay, options?.chunkDelay]
  );

  const clearIsNew = useCallback((id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isNew: false } : m))
    );
  }, []);

  const getMessageMeta = useCallback(
    (item: Message, index: number) => {
      const isLastUserMessage =
        item.role === 'user' &&
        messages.findLastIndex((m) => m.role === 'user') === index;
      const isStreamingMessage =
        item.role === 'assistant' &&
        index === messages.length - 1 &&
        isStreaming;

      let animation: 'slideUp' | 'fadeIn' | 'none' = 'none';
      if (item.isNew) {
        animation = item.role === 'user' ? 'slideUp' : 'fadeIn';
      }

      return { isLastUserMessage, isStreamingMessage, animation };
    },
    [messages, isStreaming]
  );

  return {
    messages,
    isStreaming,
    sendMessage,
    clearIsNew,
    getMessageMeta,
  };
};
