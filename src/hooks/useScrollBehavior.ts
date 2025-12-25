import { useEffect, useRef, useState } from 'react';
import type { LegendListRef } from '@legendapp/list';
import {
  calculateScrollOffsetForNewMessage,
  shouldScrollToNewMessage,
} from '../scrollCalculations';

type ScrollMetrics = {
  contentOffset: number;
  layoutMeasurement: number;
};

export const useScrollBehavior = ({
  messagesListRef,
  data,
  isStreaming,
  isExistingThread,
  placeholderHeight,
  anchorMessageHeight,
  containerHeight,
  containerPadding,
  paddingTop,
}: {
  messagesListRef: React.RefObject<LegendListRef | null>;
  data: unknown[];
  isStreaming: boolean;
  isExistingThread: boolean;
  placeholderHeight: number;
  anchorMessageHeight: number;
  containerHeight: number;
  containerPadding: number;
  paddingTop: number;
}) => {
  const scrollMetricsRef = useRef<ScrollMetrics>({
    contentOffset: 0,
    layoutMeasurement: 0,
  });

  const [hasPerformedInitialScrollToEnd, setHasPerformedInitialScrollToEnd] =
    useState(false);
  const [isPlaceholderStable, setIsPlaceholderStable] = useState(false);
  const needsScrollToNewMessageRef = useRef(false);

  const prevStreamingRef = useRef(isStreaming);
  const prevDataCountRef = useRef(data.length);

  useEffect(() => {
    const wasStreaming = prevStreamingRef.current;
    const prevCount = prevDataCountRef.current;
    prevStreamingRef.current = isStreaming;
    prevDataCountRef.current = data.length;

    const justStartedStreaming = isStreaming && !wasStreaming;
    const isExistingConversation = prevCount >= 2;

    if (justStartedStreaming && isExistingConversation) {
      needsScrollToNewMessageRef.current = true;
    }
  }, [isStreaming, data.length]);

  const performInitialScroll = (): boolean => {
    if (hasPerformedInitialScrollToEnd) {
      return false;
    }

    if (data.length === 0) {
      return false;
    }

    const isNewConversationFirstMessage = isStreaming && data.length <= 2;
    const shouldScrollToEnd =
      isExistingThread && !isNewConversationFirstMessage;

    if (shouldScrollToEnd) {
      messagesListRef.current?.scrollToEnd({ animated: false });
      setHasPerformedInitialScrollToEnd(true);
      return true;
    }

    setHasPerformedInitialScrollToEnd(true);
    return true;
  };

  const performScrollToNewMessage = (contentHeight: number): boolean => {
    const shouldScroll = shouldScrollToNewMessage({
      needsScrollToNewMessage: needsScrollToNewMessageRef.current,
      placeholderHeight,
      isPlaceholderStable,
      anchorMessageHeight,
      flatListHeight: containerHeight,
      containerPadding,
    });

    if (!shouldScroll) {
      return false;
    }

    const baseOffset = calculateScrollOffsetForNewMessage(
      contentHeight,
      placeholderHeight,
      anchorMessageHeight
    );
    const scrollOffset = Math.max(0, baseOffset - paddingTop);

    messagesListRef.current?.scrollToOffset({
      offset: scrollOffset,
      animated: true,
    });
    needsScrollToNewMessageRef.current = false;
    return true;
  };

  const updateScrollMetrics = (
    contentOffset: number,
    layoutHeight: number
  ): void => {
    scrollMetricsRef.current = {
      contentOffset,
      layoutMeasurement: layoutHeight,
    };
  };

  return {
    scrollMetricsRef,
    hasPerformedInitialScrollToEnd,
    performInitialScroll,
    performScrollToNewMessage,
    updateScrollMetrics,
    setHasPerformedInitialScrollToEnd,
    setIsPlaceholderStable,
  };
};
