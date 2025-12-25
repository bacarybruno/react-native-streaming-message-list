import { useState, useRef, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import type { StreamingMessageListConfig } from '../types';

const DEFAULT_DEBOUNCE_MS = 150;

const calculatePlaceholderHeight = (
  containerHeight: number,
  anchorMessageHeight: number,
  streamingContentHeight: number,
  containerPadding: number
): number => {
  const contentHeight = anchorMessageHeight + streamingContentHeight;
  const availableSpace = containerHeight - containerPadding;
  return Math.max(0, availableSpace - contentHeight);
};

export const usePlaceholderState = (config?: StreamingMessageListConfig) => {
  const debounceMs = config?.debounceMs ?? DEFAULT_DEBOUNCE_MS;

  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const [containerHeight, setContainerHeightState] = useState(0);
  const [anchorMessageHeight, setAnchorMessageHeightState] = useState(0);
  const [shouldShowPlaceholder, setShouldShowPlaceholder] = useState(false);
  const [containerPadding, setContainerPaddingState] = useState(0);
  const [paddingTop, setPaddingTopState] = useState(0);

  const streamingContentHeightRef = useRef(0);

  const debouncedSetPlaceholderHeight = useMemo(
    () =>
      debounce((height: number) => {
        if (height > 0) {
          setPlaceholderHeight(height);
        }
      }, debounceMs),
    [debounceMs]
  );

  useEffect(() => {
    return () => {
      debouncedSetPlaceholderHeight.cancel();
    };
  }, [debouncedSetPlaceholderHeight]);

  const recalculatePlaceholder = (
    newContainerHeight?: number,
    newAnchorMessageHeight?: number,
    newStreamingContentHeight?: number
  ) => {
    const height = calculatePlaceholderHeight(
      newContainerHeight ?? containerHeight,
      newAnchorMessageHeight ?? anchorMessageHeight,
      newStreamingContentHeight ?? streamingContentHeightRef.current,
      containerPadding
    );

    if (height !== placeholderHeight) {
      debouncedSetPlaceholderHeight(height);
    }
  };

  const setContainerHeight = (height: number) => {
    setContainerHeightState(height);
    recalculatePlaceholder(height, undefined, undefined);
  };

  const setAnchorMessageHeight = (height: number) => {
    setAnchorMessageHeightState(height);
    streamingContentHeightRef.current = 0;
    recalculatePlaceholder(undefined, height, 0);
  };

  const setStreamingContentHeight = (height: number, force = false) => {
    if (!force && streamingContentHeightRef.current > height) {
      return;
    }

    streamingContentHeightRef.current = height;
    recalculatePlaceholder(undefined, undefined, height);
  };

  const setContainerPadding = (padding: number, topPadding: number) => {
    setContainerPaddingState(padding);
    setPaddingTopState(topPadding);
    recalculatePlaceholder();
  };

  return {
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
  };
};
