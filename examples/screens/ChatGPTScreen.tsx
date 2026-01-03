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
import { Header, MessageBubble, Composer } from '../chatgpt/components';
import { theme } from '../chatgpt/theme';
import type { Message } from '../shared/types';
import { useChatMessages } from '../shared/useChatMessages';

export const ChatGPTScreen = () => {
  const { messages, isStreaming, sendMessage, clearIsNew, getMessageMeta } =
    useChatMessages();

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const { isLastUserMessage, isStreamingMessage, animation } = getMessageMeta(
      item,
      index
    );

    if (item.isNew) {
      setTimeout(() => clearIsNew(item.id), 500);
    }

    let content = (
      <MessageBubble text={item.text} role={item.role} showActions />
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
});
