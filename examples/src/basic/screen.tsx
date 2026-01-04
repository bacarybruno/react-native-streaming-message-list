import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  StreamingMessageList,
  StreamingMessageListProvider,
  AnchorItem,
  StreamingItem,
} from 'react-native-streaming-message-list';
import type { StreamingMessageListRef } from 'react-native-streaming-message-list';
import Animated from 'react-native-reanimated';
import type { Message } from '../shared/types';
import { useChatMessages } from '../shared/useChatMessages';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Ionicon from '@expo/vector-icons/Ionicons';
import { ScrollToBottomButton } from '../shared/ScrollToBottomButton';
import { StatusBar } from 'expo-status-bar';

export const BasicChatScreen = () => {
  const { messages, isStreaming, sendMessage, clearIsNew, getMessageMeta } =
    useChatMessages();
  const [input, setInput] = useState('');
  const listRef = useRef<StreamingMessageListRef>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const { isLastUserMessage, isLastAssistantMessage, entering } =
      getMessageMeta(item, index);

    if (item.isNew) {
      setTimeout(() => clearIsNew(item.id), 500);
    }

    if (!item.text) {
      return null;
    }

    let content = (
      <View
        style={[
          styles.bubble,
          item.role === 'user' ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            item.role === 'user' ? styles.userText : styles.assistantText,
          ]}
        >
          {item.text}
        </Text>
      </View>
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
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Streaming Chat Demo</Text>
            <Text style={styles.headerSubtitle}>
              ChatGPT-style smart scrolling
            </Text>
          </View>

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
                <Ionicon name="arrow-down" size={24} color="#fff" />
              </ScrollToBottomButton>
            </View>
          </StreamingMessageListProvider>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              onSubmitEditing={handleSend}
              editable={!isStreaming}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || isStreaming) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!input.trim() || isStreaming}
            >
              <Text style={styles.sendButtonText}>
                {isStreaming ? '...' : 'Send'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
  },
  scrollButton: {
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
