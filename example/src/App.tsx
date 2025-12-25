import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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

type Message = {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  isNew?: boolean;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input.trim(),
      role: 'user',
      isNew: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    simulateAIResponse((chunk) => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, text: lastMessage.text + chunk },
          ];
        } else {
          return [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              text: chunk,
              role: 'assistant',
              isNew: true,
            },
          ];
        }
      });
    }).finally(() => setIsStreaming(false));
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isLastUserMessage =
      item.role === 'user' &&
      messages.findLastIndex((m) => m.role === 'user') === index;
    const isStreamingMessage =
      item.role === 'assistant' && index === messages.length - 1 && isStreaming;

    let animation: 'slideUp' | 'fadeIn' | 'none' = 'none';
    if (item.isNew) {
      animation = item.role === 'user' ? 'slideUp' : 'fadeIn';
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, isNew: false } : m))
        );
      }, 500);
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Streaming Chat Demo</Text>
          <Text style={styles.headerSubtitle}>
            ChatGPT-style smart scrolling
          </Text>
        </View>

        <StreamingMessageList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          isStreaming={isStreaming}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            onSubmitEditing={sendMessage}
            editable={!isStreaming}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isStreaming) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || isStreaming}
          >
            <Text style={styles.sendButtonText}>
              {isStreaming ? '...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const responses = [
  'This is a simulated AI response that demonstrates the streaming behavior. ',
  'The list automatically keeps the latest content visible while you can scroll up to read previous messages. ',
  'Watch how the message grows smoothly without scroll jank! ',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?',
  'Pretty neat, right? 🎉',
];

let responseIndex = 0;

async function simulateAIResponse(
  onChunk: (chunk: string) => void
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return new Promise((resolve) => {
    const response = responses[responseIndex];
    responseIndex = (responseIndex + 1) % responses.length;

    const words = response?.split(' ') || [];
    let index = 0;

    const interval = setInterval(() => {
      if (index < words.length) {
        onChunk(words[index] + ' ');
        index++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 80);
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
