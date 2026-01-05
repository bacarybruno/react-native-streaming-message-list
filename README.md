<p align="center">
  <h1 align="center">react-native-streaming-message-list</h1>
</p>

<p align="center">
  <strong>ChatGPT and Claude-style smart scrolling for React Native message lists.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-native-streaming-message-list">
    <img src="https://img.shields.io/npm/v/react-native-streaming-message-list?style=flat&colorA=000000&colorB=000000" alt="Version" />
  </a>
  <a href="https://bundlejs.com/?q=react-native-streaming-message-list&config={%22esbuild%22:{%22external%22:[%22react%22,%22react-native%22,%22react-native-reanimated%22,%22react-native-web%22]}}">
    <img src="https://deno.bundlejs.com/?q=react-native-streaming-message-list&config={%22esbuild%22:{%22external%22:[%22react%22,%22react-native%22,%22react-native-reanimated%22,%22react-native-web%22]}}&badge=true" alt="bundle size" />
  </a>
  <a href="https://github.com/bacarybruno/react-native-streaming-message-list/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/bacarybruno/react-native-streaming-message-list/ci.yml?branch=main&style=flat&colorA=000000&colorB=000000" alt="Build Status" />
  </a>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/038161ee-a2ef-4386-a9a4-72cc63c44d3b" alt="demo" width="250" />
</p>

<p align="center">
A FlatList-compatible React Native component that replicates ChatGPT/Claude-like "new message snaps to top" scrolling behavior for conversational UIs where the last item can grow over time (e.g., streaming AI responses).
</p>

<p align="center">
  <strong>Try it live on Expo Snack:</strong> 
  <a href="https://snack.expo.dev/@bacarybruno/react-native-streaming-message-list-demo?platform=android">Android</a> • 
  <a href="https://snack.expo.dev/@bacarybruno/react-native-streaming-message-list-demo?platform=ios">iOS</a> • 
  <a href="https://snack.expo.dev/@bacarybruno/react-native-streaming-message-list-demo?platform=web">Web</a>
</p>

## Features

- **Smart scroll behavior**: New messages snap to top with dynamic blank space management
- **Streaming-friendly**: Handles growing/updating content without scroll jank
- **FlatList-like API**: Familiar props, works with any message data structure

## Installation

```sh
npm install react-native-streaming-message-list react-native-reanimated
```

This library requires [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/). Follow their installation guide if you haven't already.

## Examples

We provide multiple example apps showcasing different use cases:

- **[Basic Example](./examples/basic/)** - Simple, minimal implementation showing core functionality
- **[ChatGPT Example](./examples/chatgpt/)** - ChatGPT-inspired UI

See the [examples README](./examples/README.md) for how to run and switch between demos.

## Quick Start

> 💡 **For a complete working example**, check out the [examples folder](./examples).

### 1. Replace your list component

Replace `FlatList` with `StreamingMessageList`. This component is built on [`@legendapp/list`](https://github.com/LegendApp/legend-list) and accepts the same FlatList-like props:

```diff
- import { FlatList } from 'react-native';
+ import { StreamingMessageList } from 'react-native-streaming-message-list';

- <FlatList
+ <StreamingMessageList
    data={messages}
    keyExtractor={(item) => item.id}
    renderItem={renderMessage}
  />
```

### 2. Add streaming state

Create a state variable to track when messages are actively streaming:

```tsx
const [isStreaming, setIsStreaming] = useState(false);
```

Pass it to `StreamingMessageList`:

```diff
  <StreamingMessageList
    data={messages}
    keyExtractor={(item) => item.id}
    renderItem={renderMessage}
+   isStreaming={isStreaming}
  />
```

### 3. Wrap your anchor and streaming items

To enable smart scrolling, wrap two special messages:

- **Last user message**: Wrap with `AnchorItem` (this message will stay near the top)
- **Last assistant message**: Wrap with `StreamingItem` (tracks height changes during and after streaming)

```tsx
import { AnchorItem, StreamingItem } from 'react-native-streaming-message-list';

const renderMessage = ({ item, index }) => {
  const isLastUserMessage =
    item.role === 'user' &&
    messages.findLastIndex(m => m.role === 'user') === index;
  const isLastAssistantMessage =
    item.role === 'assistant' &&
    messages.findLastIndex(m => m.role === 'assistant') === index;

  let content = <YourMessageBubble message={item} />;

  if (isLastUserMessage) {
    content = <AnchorItem>{content}</AnchorItem>;
  } else if (isLastAssistantMessage) {
    content = <StreamingItem>{content}</StreamingItem>;
  }

  return content;
};
```

That's it! The list will now handle ChatGPT-style scrolling automatically.

---

**Need more?** See the [examples folder](./examples) for complete, runnable chat apps with different UI styles.

## Common Patterns

### When to use each component

- **`StreamingMessageList`**: Your main list component. Use it instead of `FlatList` for any chat/message list where content can stream or grow.

- **`AnchorItem`**: Wrap the **last user message**. This keeps it visible near the top while the assistant response grows below it.

- **`StreamingItem`**: Wrap the **last assistant message**. Keep this wrapper even after streaming ends to track height changes (like action buttons appearing).

### Optional animations

For message animations, use `Animated.View` from `react-native-reanimated` with the `entering` prop. 

**Recommended approach:** Animate only the first user message with a fade-in. The "slide-in" effect for new messages happens naturally through the library's placeholder and scroll-to-bottom behavior, so additional slide animations are unnecessary:

```tsx
import Animated, { FadeIn } from 'react-native-reanimated';

const renderMessage = ({ item, index }) => {
  const isFirstUserMessage = 
    item.role === 'user' && 
    messages.findIndex(m => m.role === 'user') === index;

  let content = <YourMessageBubble message={item} />;

  return (
    <Animated.View entering={isFirstUserMessage ? FadeIn.duration(350) : undefined}>
      {content}
    </Animated.View>
  );
};
```

See the [Reanimated documentation](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/) for more animation options.

### Typical message flow

1. User sends a message → mark it as `AnchorItem`
2. Assistant starts responding → set `isStreaming={true}` and wrap the new assistant message with `StreamingItem`
3. Assistant finishes → set `isStreaming={false}`
4. Repeat for the next turn

### Scroll to bottom button

Use `useStreamingMessageList` to show a button when the user scrolls away from the bottom:

```tsx
import {
  StreamingMessageList,
  StreamingMessageListProvider,
  useStreamingMessageList,
} from 'react-native-streaming-message-list';

const ScrollToBottomButton = ({ listRef }) => {
  const { isAtEnd, contentFillsViewport } = useStreamingMessageList();

  if (isAtEnd || !contentFillsViewport) return null;

  return (
    <TouchableOpacity
      style={styles.scrollButton}
      onPress={() => listRef.current?.scrollToEnd({ animated: true })}
    >
      <Text>↓</Text>
    </TouchableOpacity>
  );
};

const listRef = useRef(null);

<StreamingMessageListProvider>
  <View style={{ flex: 1 }}>
    <StreamingMessageList ref={listRef} data={messages} ... />
    <ScrollToBottomButton listRef={listRef} />
  </View>
</StreamingMessageListProvider>
```

## API

### `<StreamingMessageList>`

Main component that wraps your message list with smart scroll behavior.

#### Props

Extends all `FlatList` props from `@legendapp/list`, plus:

| Prop           | Type                         | Required | Description                                                   |
| -------------- | ---------------------------- | -------- | ------------------------------------------------------------- |
| `data`         | `T[]`                        | Yes      | Array of message items                                        |
| `renderItem`   | `(info) => ReactNode`        | Yes      | Function to render each item                                  |
| `keyExtractor` | `(item, index) => string`    | Yes      | Unique key for each item                                      |
| `isStreaming`  | `boolean`                    | No       | Whether content is currently updating (triggers smart scroll) |
| `config`       | `StreamingMessageListConfig` | No       | Advanced configuration                                        |

#### Config Options

```typescript
type StreamingMessageListConfig = {
  debounceMs?: number; // Debounce for placeholder height calculations (default: 150)
  placeholderStableDelayMs?: number; // Delay before placeholder is considered stable (default: 200)
  isAtEndThreshold?: number; // Threshold in pixels for isAtEnd calculation (default: 10)
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

Wrapper for the last assistant message.

```tsx
<StreamingItem>
  <YourMessageBubble />
</StreamingItem>
```

### `<StreamingMessageListProvider>`

Optional provider that enables access to scroll metrics via `useStreamingMessageList`. Wrap your list and any components that need scroll metrics with this provider.

```tsx
<StreamingMessageListProvider>
  <StreamingMessageList ... />
  <YourScrollButton />
</StreamingMessageListProvider>
```

### `useStreamingMessageList()`

Hook to access scroll metrics. Must be used within `StreamingMessageListProvider`.

```tsx
import { useStreamingMessageList } from 'react-native-streaming-message-list';

const { isAtEnd, contentFillsViewport } = useStreamingMessageList();
```

| Property | Type | Description |
|----------|------|-------------|
| `isAtEnd` | `boolean` | `true` when scrolled to bottom (within threshold) |
| `contentFillsViewport` | `boolean` | `true` when content height exceeds viewport |

## How It Works

The component implements ChatGPT-style scrolling by:

1. **Measuring heights**: Tracks the "anchor" message (last user message) and "streaming" content (growing assistant response)
2. **Dynamic placeholder**: Injects blank space at the bottom so the anchor message lands near the top
3. **Auto-scrolling**: Automatically scrolls to show new messages
4. **Debounced updates**: Prevents jank during rapid content updates

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
