import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  StreamingMessageList,
  AnchorItem,
  StreamingItem,
  AnimatedMessage,
} from 'react-native-streaming-message-list';
import { Header, MessageBubble, Composer } from './components';
import { theme } from './theme';
import type { Message } from '../shared/types';
import { useChatMessages } from '../shared/useChatMessages';

export const ChatGPTScreen = () => {
  const { messages, isStreaming, sendMessage, clearIsNew, getMessageMeta } =
    useChatMessages({
      initialDelay: 3000,
      chunkDelay: 80,
    });

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const { isLastUserMessage, isStreamingMessage, animation } = getMessageMeta(
      item,
      index
    );

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
    } else if (isStreamingMessage) {
      content = <StreamingItem>{content}</StreamingItem>;
    }

    return <AnimatedMessage animation={animation}>{content}</AnimatedMessage>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Header />

        <StreamingMessageList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          isStreaming={isStreaming}
          contentContainerStyle={styles.listContent}
        />

        <Composer onSend={sendMessage} disabled={isStreaming} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
  },
});
