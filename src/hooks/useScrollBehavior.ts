import { useEffect, useRef, useState } from 'react';
import type { LegendListRef } from '@legendapp/list';
import type { StreamingMessageListConfig } from '../types';
import {
  calculateDistanceFromBottom,
  calculateScrollOffsetForNewMessage,
  DEFAULT_SCROLL_THRESHOLD,
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
  shouldShowPlaceholder,
  containerHeight,
  containerPadding,
  paddingTop,
  hasScrolledInSession,
  setHasScrolledInSession,
  config,
}: {
  messagesListRef: React.RefObject<LegendListRef | null>;
  data: unknown[];
  isStreaming: boolean;
  isExistingThread: boolean;
  placeholderHeight: number;
  anchorMessageHeight: number;
  shouldShowPlaceholder: boolean;
  containerHeight: number;
  containerPadding: number;
  paddingTop: number;
  hasScrolledInSession: boolean;
  setHasScrolledInSession: (value: boolean) => void;
  config?: StreamingMessageListConfig;
}) => {
  const scrollThreshold = config?.scrollThreshold ?? DEFAULT_SCROLL_THRESHOLD;
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

  const checkIfUserScrolledAway = (
    contentHeight: number,
    contentOffset: number,
    layoutHeight: number
  ): void => {
    if (hasScrolledInSession) {
      return;
    }

    const distanceFromBottom = calculateDistanceFromBottom(
      contentHeight,
      contentOffset,
      layoutHeight,
      {
        shouldShowPlaceholder,
        placeholderHeight,
      }
    );

    if (distanceFromBottom > scrollThreshold) {
      setHasScrolledInSession(true);
    }
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
    isPlaceholderStable,
    performInitialScroll,
    performScrollToNewMessage,
    checkIfUserScrolledAway,
    updateScrollMetrics,
    setHasPerformedInitialScrollToEnd,
    setIsPlaceholderStable,
  };
};
