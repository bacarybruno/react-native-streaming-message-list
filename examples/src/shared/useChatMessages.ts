import { useState, useCallback } from 'react';
import { FadeIn } from 'react-native-reanimated';
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

      const now = Date.now();
      const userMessage: Message = {
        id: `user-${now}`,
        text: text.trim(),
        role: 'user',
        isNew: true,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${now}`,
            text: '',
            role: 'assistant',
            isNew: false,
          },
        ]);
      }, 50);

      simulateAIResponse(
        (chunk) => {
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (!lastMessage || lastMessage.role !== 'assistant') return prev;

            return [
              ...prev.slice(0, -1),
              { ...lastMessage, text: lastMessage.text + chunk },
            ];
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
      const isLastAssistantMessage =
        item.role === 'assistant' &&
        messages.findLastIndex((m) => m.role === 'assistant') === index;
      const isStreamingMessage =
        item.role === 'assistant' &&
        index === messages.length - 1 &&
        isStreaming;

      let entering;
      if (item.isNew && item.text && item.role === 'user') {
        const isFirstUserMessage =
          messages.findIndex((m) => m.role === 'user') === index;
        if (isFirstUserMessage) {
          entering = FadeIn.duration(350);
        }
      }

      return {
        isLastUserMessage,
        isLastAssistantMessage,
        isStreamingMessage,
        entering,
      };
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
