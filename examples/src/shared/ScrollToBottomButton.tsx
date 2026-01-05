import type { ReactNode } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  useStreamingMessageList,
  type StreamingMessageListRef,
} from 'react-native-streaming-message-list';

type ScrollToBottomButtonProps = {
  listRef: React.RefObject<StreamingMessageListRef | null>;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export const ScrollToBottomButton = ({
  listRef,
  children,
  style,
  onPress,
}: ScrollToBottomButtonProps) => {
  const { isAtEnd, contentFillsViewport } = useStreamingMessageList();

  if (isAtEnd || !contentFillsViewport) return null;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      listRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.defaultButton, style]}
      onPress={handlePress}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  defaultButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
});
