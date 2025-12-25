import { isValidElement, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { LegendList } from '@legendapp/list';
import type { LegendListRef } from '@legendapp/list';
import { usePlaceholderState } from './hooks/usePlaceholderState';
import { useScrollBehavior } from './hooks/useScrollBehavior';
import { StreamingMessageListContext } from './StreamingMessageListContext';
import type { StreamingMessageListInternalContext } from './StreamingMessageListContext';
import type {
  StreamingMessageListProps,
  StreamingMessageListRef,
} from './types';

const DEFAULT_PLACEHOLDER_STABLE_DELAY_MS = 200;

export const StreamingMessageList = <T,>({
  data,
  isStreaming = false,
  config,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onScroll,
  onContentSizeChange,
  contentContainerStyle,
  ref,
  ...restProps
}: StreamingMessageListProps<T> & {
  ref?: React.Ref<StreamingMessageListRef>;
}) => {
  const placeholderStableDelayMs =
    config?.placeholderStableDelayMs ?? DEFAULT_PLACEHOLDER_STABLE_DELAY_MS;

  const internalRef = useRef<LegendListRef>(null);
  const listRef = (ref ?? internalRef) as React.RefObject<LegendListRef | null>;

  const prevDataLengthRef = useRef(0);

  const {
    placeholderHeight,
    containerHeight,
    anchorMessageHeight,
    shouldShowPlaceholder,
    setContainerHeight,
    setAnchorMessageHeight,
    setStreamingContentHeight,
    setShouldShowPlaceholder,
    containerPadding,
    paddingTop,
    setContainerPadding,
  } = usePlaceholderState(config);

  const {
    scrollMetricsRef,
    performInitialScroll,
    performScrollToNewMessage,
    updateScrollMetrics,
    setHasPerformedInitialScrollToEnd,
    setIsPlaceholderStable,
  } = useScrollBehavior({
    messagesListRef: listRef,
    data,
    isStreaming,
    isExistingThread: data.length > 0,
    placeholderHeight,
    anchorMessageHeight,
    containerHeight,
    containerPadding,
    paddingTop,
  });

  const prevStreamingRef = useRef(isStreaming);
  useEffect(() => {
    const prevLength = prevDataLengthRef.current;
    const wasStreaming = prevStreamingRef.current;
    prevDataLengthRef.current = data.length;
    prevStreamingRef.current = isStreaming;

    const isNewConversationFirstMessage =
      isStreaming && prevLength === 0 && data.length === 1;
    const isNewMessageInExistingConversation =
      isStreaming && !wasStreaming && prevLength >= 2;

    if (isNewConversationFirstMessage || isNewMessageInExistingConversation) {
      setShouldShowPlaceholder(true);
      setAnchorMessageHeight(0);
      setStreamingContentHeight(0, true);
    }
  }, [
    data.length,
    isStreaming,
    setShouldShowPlaceholder,
    setAnchorMessageHeight,
    setStreamingContentHeight,
  ]);

  const handleContentSizeChange = (width: number, height: number) => {
    onContentSizeChange?.(width, height);

    const didPerformInitialScroll = performInitialScroll();

    if (!didPerformInitialScroll) {
      performScrollToNewMessage(height);
    }
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    setContainerHeight(height);
    updateScrollMetrics(scrollMetricsRef.current.contentOffset, height);

    if (contentContainerStyle) {
      const style = StyleSheet.flatten(contentContainerStyle);
      const padding = style.padding ?? 0;
      const paddingBottom = style.paddingBottom ?? padding;
      const topPadding = style.paddingTop ?? padding;
      setContainerPadding(
        (paddingBottom as number) + (topPadding as number),
        topPadding as number
      );
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScroll?.(event);

    const { contentOffset, layoutMeasurement } = event.nativeEvent;

    updateScrollMetrics(contentOffset.y, layoutMeasurement.height);
  };

  const handleEndReached = () => {
    setHasPerformedInitialScrollToEnd(true);
  };

  const renderListFooterComponent = () => {
    if (!shouldShowPlaceholder || placeholderHeight <= 0) {
      return null;
    }

    const listFooterComponent = ListFooterComponent ? (
      isValidElement(ListFooterComponent) ? (
        ListFooterComponent
      ) : (
        <ListFooterComponent />
      )
    ) : null;

    return (
      <View style={{ height: placeholderHeight }}>{listFooterComponent}</View>
    );
  };

  useEffect(() => {
    if (placeholderHeight > 0) {
      const timer = setTimeout(() => {
        setIsPlaceholderStable(true);
      }, placeholderStableDelayMs);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [placeholderHeight, setIsPlaceholderStable, placeholderStableDelayMs]);

  const contextValue: StreamingMessageListInternalContext = {
    setAnchorMessageHeight,
    setStreamingContentHeight,
  };

  if (!renderItem) {
    throw new Error('renderItem is required for StreamingMessageList');
  }

  return (
    <StreamingMessageListContext.Provider value={contextValue}>
      <LegendList<T>
        ref={listRef}
        {...restProps}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={renderListFooterComponent()}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={contentContainerStyle}
        data={data}
        extraData={isStreaming}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={handleContentSizeChange}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.2}
        onLayout={handleLayout}
        onScroll={handleScroll}
        renderItem={renderItem}
        scrollEventThrottle={16}
      />
    </StreamingMessageListContext.Provider>
  );
};
