# react-native-streaming-message-list

**ChatGPT and Claude-style smart scrolling for React Native message lists.**

A Flatlist compatible React Native component that replicates ChatGPT/Claude-like "new message snaps to top" scrolling behavior for conversational UIs where the last item can grow over time (e.g., streaming AI responses).

![demo](https://github.com/user-attachments/assets/038161ee-a2ef-4386-a9a4-72cc63c44d3b)

## Features

- **Smart scroll behavior**: New messages snap to top with dynamic blank space management
- **Streaming-friendly**: Handles growing/updating content without scroll jank
- **Respects user intent**: Preserves scroll position when users scroll away
- **Optional animations**: Built-in slide-up and fade-in animations for new messages
- **FlatList-like API**: Familiar props, works with any message data structure

## Installation


```sh
npm install react-native-streaming-message-list react-native-reanimated
```

### Setup

This library requires [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/). Follow their installation guide if you haven't already.

## Usage

> 💡 **For a complete working example**, check out the [example folder](./example) which includes a fully functional chat app demonstrating all features.

### Basic Example

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import {
  StreamingMessageList,
  AnchorItem,
  StreamingItem,
} from 'react-native-streaming-message-list';

type Message = {
  id: string;
  text: string;
  role: 'user' | 'assistant';
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      role: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Simulate streaming response
    simulateAIResponse((chunk) => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === 'assistant') {
          // Update existing assistant message
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, text: lastMessage.text + chunk },
          ];
        } else {
          // Create new assistant message
          return [
            ...prev,
            { id: Date.now().toString(), text: chunk, role: 'assistant' },
          ];
        }
      });
    }).finally(() => setIsStreaming(false));
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isLastUserMessage =
      item.role === 'user' && index === messages.length - 1;
    const isStreamingMessage = item.role === 'assistant' && isStreaming;

    let content = (
      <View
        style={[
          styles.bubble,
          item.role === 'user' ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );

    // Wrap messages for smart scroll behavior
    if (isLastUserMessage) {
      content = <AnchorItem>{content}</AnchorItem>;
    } else if (isStreamingMessage) {
      content = <StreamingItem>{content}</StreamingItem>;
    }

    return content;
  };

  return (
    <View style={styles.container}>
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
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

// Simulate AI streaming response
function simulateAIResponse(
  onChunk: (chunk: string) => void
): Promise<void> {
  return new Promise((resolve) => {
    const response = 'This is a simulated AI response. ';
    const words = response.split(' ');
    let index = 0;

    const interval = setInterval(() => {
      if (index < words.length) {
        onChunk(words[index] + ' ');
        index++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16 },
  bubble: { padding: 12, borderRadius: 16, marginBottom: 8, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA' },
  text: { fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12 },
});
```
## API

### `<StreamingMessageList>`

Main component that wraps your message list with smart scroll behavior.

#### Props

Extends all `FlatList` props from `@legendapp/list`, plus:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `T[]` | Yes | Array of message items |
| `renderItem` | `(info) => ReactNode` | Yes | Function to render each item |
| `keyExtractor` | `(item, index) => string` | Yes | Unique key for each item |
| `isStreaming` | `boolean` | No | Whether content is currently updating (triggers smart scroll) |
| `config` | `StreamingMessageListConfig` | No | Advanced configuration |

#### Config Options

```typescript
type StreamingMessageListConfig = {
  debounceMs?: number;              // Debounce for placeholder height calculations (default: 150)
  scrollThreshold?: number;          // Distance threshold for "scrolled away" detection (default: 30)
  placeholderStableDelayMs?: number; // Delay before placeholder is considered stable (default: 200)
};
```

### `<AnchorItem>`

Wrapper for the message that should be "anchored" near the top when a new conversation turn begins (typically the last user message).

```tsx
<AnchorItem>
  <YourMessageBubble />
</AnchorItem>
```

### `<StreamingItem>`

Wrapper for content that's actively growing/updating (typically the last assistant message while streaming).

```tsx
<StreamingItem>
  <YourMessageBubble />
</StreamingItem>
```

### `<AnimatedMessage>`

Optional animated wrapper for new messages.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `animation` | `'slideUp' \| 'fadeIn' \| 'none'` | Animation type |
| `onAnimationComplete` | `() => void` | Callback when animation finishes |
| `children` | `ReactNode` | Content to animate |

## How It Works

The component implements ChatGPT-style scrolling by:

1. **Measuring heights**: Tracks the "anchor" message (last user message) and "streaming" content (growing assistant response)
2. **Dynamic placeholder**: Injects blank space at the bottom so the anchor message lands near the top
3. **Smart scrolling**: Only auto-scrolls when appropriate (user hasn't scrolled away)
4. **Debounced updates**: Prevents jank during rapid content updates

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
