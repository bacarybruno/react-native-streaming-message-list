import { isValidElement, useContext, useEffect, useRef } from 'react';
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
import { isWhitespaceInViewport } from './scrollCalculations';
import {
  StreamingMessageListInternalContext,
  StreamingMessageListPublicContext,
} from './StreamingMessageListContext';
import type { StreamingMessageListInternalContextType } from './StreamingMessageListContext';
import type {
  StreamingMessageListProps,
  StreamingMessageListRef,
} from './types';

const DEFAULT_PLACEHOLDER_STABLE_DELAY_MS = 200;
const DEFAULT_IS_AT_END_THRESHOLD = 10;

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
  const isAtEndThreshold =
    config?.isAtEndThreshold ?? DEFAULT_IS_AT_END_THRESHOLD;

  const internalRef = useRef<LegendListRef>(null);
  const listRef = (ref ?? internalRef) as React.RefObject<LegendListRef | null>;

  const prevDataLengthRef = useRef(0);

  const {
    debouncedPlaceholderHeight,
    placeholderHeight,
    getPlaceholderHeight,
    containerHeight,
    anchorMessageHeight,
    whitespacePhase,
    setContainerHeight,
    setAnchorMessageHeight,
    setStreamingContentHeight,
    setWhitespacePhase,
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
    checkWhitespaceDismissal,
    resetWhitespaceVisibility,
  } = useScrollBehavior({
    messagesListRef: listRef,
    data,
    isStreaming,
    isExistingThread: data.length > 0,
    placeholderHeight: debouncedPlaceholderHeight,
    anchorMessageHeight,
    containerHeight,
    containerPadding,
    paddingTop,
  });

  const publicContext = useContext(StreamingMessageListPublicContext);

  const updateScrollMetricsState = (
    contentOffsetY: number,
    layoutHeight: number,
    contentHeight: number
  ) => {
    if (!publicContext) return;

    const currentPlaceholderHeight = getPlaceholderHeight();
    const targetContentHeight =
      contentHeight - debouncedPlaceholderHeight + currentPlaceholderHeight;

    const atEnd =
      contentOffsetY + layoutHeight >= targetContentHeight - isAtEndThreshold;
    const fills = targetContentHeight > layoutHeight;

    publicContext.setIsAtEnd(atEnd);
    publicContext.setContentFillsViewport(fills);
  };

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
      setWhitespacePhase('active');
      resetWhitespaceVisibility();
      setAnchorMessageHeight(0);
      setStreamingContentHeight(0, true);
    }

    if (wasStreaming && !isStreaming && whitespacePhase !== 'dismissed') {
      if (placeholderHeight > 0) {
        setWhitespacePhase('visible_static');
      } else {
        setWhitespacePhase('none');
      }
    }
  }, [
    data.length,
    isStreaming,
    placeholderHeight,
    whitespacePhase,
    setWhitespacePhase,
    resetWhitespaceVisibility,
    setAnchorMessageHeight,
    setStreamingContentHeight,
  ]);

  const handleContentSizeChange = (width: number, height: number) => {
    onContentSizeChange?.(width, height);

    const didPerformInitialScroll = performInitialScroll();

    if (!didPerformInitialScroll) {
      performScrollToNewMessage(height);
    }

    updateScrollMetricsState(
      scrollMetricsRef.current.contentOffset,
      scrollMetricsRef.current.layoutMeasurement,
      height
    );
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    setContainerHeight(height);
    updateScrollMetrics(scrollMetricsRef.current.contentOffset, height);

    if (contentContainerStyle) {
      const style = StyleSheet.flatten(contentContainerStyle);
      const padding = typeof style.padding === 'number' ? style.padding : 0;
      const paddingBottom =
        typeof style.paddingBottom === 'number' ? style.paddingBottom : padding;
      const topPadding =
        typeof style.paddingTop === 'number' ? style.paddingTop : padding;
      setContainerPadding(paddingBottom + topPadding, topPadding);
    }

    updateScrollMetricsState(
      scrollMetricsRef.current.contentOffset,
      height,
      scrollMetricsRef.current.contentSize
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScroll?.(event);

    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;

    updateScrollMetrics(
      contentOffset.y,
      layoutMeasurement.height,
      contentSize.height
    );

    updateScrollMetricsState(
      contentOffset.y,
      layoutMeasurement.height,
      contentSize.height
    );

    if (whitespacePhase === 'visible_static' || whitespacePhase === 'active') {
      const isVisible = isWhitespaceInViewport({
        contentOffset: contentOffset.y,
        layoutMeasurement: layoutMeasurement.height,
        contentSize: contentSize.height,
        placeholderHeight: debouncedPlaceholderHeight,
      });

      checkWhitespaceDismissal(isVisible, whitespacePhase, () => {
        setWhitespacePhase('dismissed');
      });
    }
  };

  const handleEndReached = () => {
    setHasPerformedInitialScrollToEnd(true);
  };

  const renderListFooterComponent = () => {
    const listFooterComponent = ListFooterComponent ? (
      isValidElement(ListFooterComponent) ? (
        ListFooterComponent
      ) : (
        <ListFooterComponent />
      )
    ) : null;

    const shouldRenderPlaceholder =
      (whitespacePhase === 'active' || whitespacePhase === 'visible_static') &&
      debouncedPlaceholderHeight > 0;

    if (!shouldRenderPlaceholder) {
      return listFooterComponent;
    }

    return (
      <View style={{ height: debouncedPlaceholderHeight }}>
        {listFooterComponent}
      </View>
    );
  };

  useEffect(() => {
    if (debouncedPlaceholderHeight > 0) {
      const timer = setTimeout(() => {
        setIsPlaceholderStable(true);
      }, placeholderStableDelayMs);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [
    debouncedPlaceholderHeight,
    setIsPlaceholderStable,
    placeholderStableDelayMs,
  ]);

  const internalContextValue: StreamingMessageListInternalContextType = {
    setAnchorMessageHeight,
    setStreamingContentHeight,
  };

  if (!renderItem) {
    throw new Error('renderItem is required for StreamingMessageList');
  }

  return (
    <StreamingMessageListInternalContext.Provider value={internalContextValue}>
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
    </StreamingMessageListInternalContext.Provider>
  );
};
