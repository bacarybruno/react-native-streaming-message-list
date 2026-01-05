import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type StreamingMessageListInternalContextType = {
  setAnchorMessageHeight: (height: number) => void;
  setStreamingContentHeight: (height: number, force?: boolean) => void;
};

export const StreamingMessageListInternalContext =
  createContext<StreamingMessageListInternalContextType | null>(null);

export const useStreamingMessageListInternal =
  (): StreamingMessageListInternalContextType => {
    const context = useContext(StreamingMessageListInternalContext);

    if (!context) {
      throw new Error(
        'useStreamingMessageListInternal must be used within StreamingMessageList'
      );
    }

    return context;
  };

export type ScrollMetrics = {
  isAtEnd: boolean;
  contentFillsViewport: boolean;
};

type ScrollMetricsContextType = ScrollMetrics & {
  setIsAtEnd: (value: boolean) => void;
  setContentFillsViewport: (value: boolean) => void;
};

export const StreamingMessageListPublicContext =
  createContext<ScrollMetricsContextType | null>(null);

export const useStreamingMessageList = (): ScrollMetrics => {
  const context = useContext(StreamingMessageListPublicContext);

  if (!context) {
    throw new Error(
      'useStreamingMessageList must be used within StreamingMessageListProvider'
    );
  }

  return {
    isAtEnd: context.isAtEnd,
    contentFillsViewport: context.contentFillsViewport,
  };
};

type StreamingMessageListProviderProps = {
  children: ReactNode;
};

export const StreamingMessageListProvider = ({
  children,
}: StreamingMessageListProviderProps) => {
  const [isAtEnd, setIsAtEnd] = useState(true);
  const [contentFillsViewport, setContentFillsViewport] = useState(false);

  const value: ScrollMetricsContextType = {
    isAtEnd,
    contentFillsViewport,
    setIsAtEnd,
    setContentFillsViewport,
  };

  return (
    <StreamingMessageListPublicContext.Provider value={value}>
      {children}
    </StreamingMessageListPublicContext.Provider>
  );
};
