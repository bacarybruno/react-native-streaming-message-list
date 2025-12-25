import { createContext, useContext } from 'react';

export type StreamingMessageListInternalContext = {
  setAnchorMessageHeight: (height: number) => void;
  setStreamingContentHeight: (height: number, force?: boolean) => void;
};

export const StreamingMessageListContext =
  createContext<StreamingMessageListInternalContext | null>(null);

export const useStreamingMessageList =
  (): StreamingMessageListInternalContext => {
    const context = useContext(StreamingMessageListContext);

    if (!context) {
      throw new Error(
        'useStreamingMessageList must be used within StreamingMessageList'
      );
    }

    return context;
  };
