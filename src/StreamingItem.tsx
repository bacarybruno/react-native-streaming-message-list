import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { useStreamingMessageListInternal } from './StreamingMessageListContext';

type StreamingItemProps = {
  children: ReactNode;
};

export const StreamingItem = ({ children }: StreamingItemProps) => {
  const { setStreamingContentHeight } = useStreamingMessageListInternal();

  const handleLayout = (event: LayoutChangeEvent) => {
    setStreamingContentHeight(event.nativeEvent.layout.height);
  };

  return <View onLayout={handleLayout}>{children}</View>;
};
