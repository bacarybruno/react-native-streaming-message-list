import { useRef } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  StreamingMessageList,
  AnchorItem,
  StreamingItem,
} from 'react-native-streaming-message-list';
import type { StreamingMessageListRef } from 'react-native-streaming-message-list';
import Animated from 'react-native-reanimated';
import { Header, MessageBubble, Composer } from './components';
import { theme } from './theme';
import type { Message } from '../shared/types';
import { useChatMessages } from '../shared/useChatMessages';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ChatGPTScreen = () => {
  const { messages, isStreaming, sendMessage, clearIsNew, getMessageMeta } =
    useChatMessages({
      initialDelay: 2000,
      chunkDelay: 80,
    });
  const listRef = useRef<StreamingMessageListRef>(null);

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const {
      isLastUserMessage,
      isLastAssistantMessage,
      isStreamingMessage,
      entering,
    } = getMessageMeta(item, index);

    if (item.isNew) {
      setTimeout(() => clearIsNew(item.id), 500);
    }

    let content = (
      <MessageBubble
        text={item.text}
        role={item.role}
        showActions={!isStreamingMessage}
        isStreaming={isStreamingMessage}
      />
    );

    if (isLastUserMessage) {
      content = <AnchorItem>{content}</AnchorItem>;
    } else if (isLastAssistantMessage) {
      content = <StreamingItem>{content}</StreamingItem>;
    }

    return <Animated.View entering={entering}>{content}</Animated.View>;
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Header />
          <View style={styles.listContainer}>
            <StreamingMessageList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              isStreaming={isStreaming}
              contentContainerStyle={styles.listContent}
            />
          </View>
          <Composer onSend={sendMessage} disabled={isStreaming} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  scrollButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.bgTertiary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
