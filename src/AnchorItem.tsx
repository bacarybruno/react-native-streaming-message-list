import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { useStreamingMessageListInternal } from './StreamingMessageListContext';

type AnchorItemProps = {
  children: ReactNode;
};

export const AnchorItem = ({ children }: AnchorItemProps) => {
  const { setAnchorMessageHeight } = useStreamingMessageListInternal();

  const handleLayout = (event: LayoutChangeEvent) => {
    setAnchorMessageHeight(event.nativeEvent.layout.height);
  };

  return <View onLayout={handleLayout}>{children}</View>;
};
