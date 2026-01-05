import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  StreamingMessageList,
  StreamingMessageListProvider,
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
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Ionicon from '@expo/vector-icons/Ionicons';
import { ScrollToBottomButton } from '../shared/ScrollToBottomButton';
import { StatusBar } from 'expo-status-bar';

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
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          <Header />

          <StreamingMessageListProvider>
            <View style={styles.listContainer}>
              <StreamingMessageList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                isStreaming={isStreaming}
                contentContainerStyle={styles.listContent}
              />
              <ScrollToBottomButton
                listRef={listRef}
                style={styles.scrollButton}
              >
                <Ionicon
                  name="arrow-down"
                  size={24}
                  color={theme.colors.textPrimary}
                />
              </ScrollToBottomButton>
            </View>
          </StreamingMessageListProvider>

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
