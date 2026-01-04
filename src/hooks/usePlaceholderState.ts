import { useState, useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';
import type { StreamingMessageListConfig, WhitespacePhase } from '../types';

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

  const [debouncedPlaceholderHeight, setDebouncedPlaceholderHeight] =
    useState(0);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const [containerHeight, setContainerHeightState] = useState(0);
  const [anchorMessageHeight, setAnchorMessageHeightState] = useState(0);
  const [whitespacePhase, setWhitespacePhase] =
    useState<WhitespacePhase>('none');
  const [containerPadding, setContainerPaddingState] = useState(0);
  const [paddingTop, setPaddingTopState] = useState(0);

  const containerHeightRef = useRef(0);
  const anchorMessageHeightRef = useRef(0);
  const streamingContentHeightRef = useRef(0);
  const containerPaddingRef = useRef(0);
  const placeholderHeightRef = useRef(0);

  const debouncedSetPlaceholderHeight = debounce((height: number) => {
    setDebouncedPlaceholderHeight(height);
  }, debounceMs);

  useEffect(() => {
    return () => {
      debouncedSetPlaceholderHeight.cancel();
    };
  }, [debouncedSetPlaceholderHeight]);

  const recalculatePlaceholder = () => {
    const height = calculatePlaceholderHeight(
      containerHeightRef.current,
      anchorMessageHeightRef.current,
      streamingContentHeightRef.current,
      containerPaddingRef.current
    );

    placeholderHeightRef.current = height;
    setPlaceholderHeight(height);
    debouncedSetPlaceholderHeight(height);
  };

  const getPlaceholderHeight = () => placeholderHeightRef.current;

  const setContainerHeight = (height: number) => {
    containerHeightRef.current = height;
    setContainerHeightState(height);
    recalculatePlaceholder();
  };

  const setAnchorMessageHeight = (height: number) => {
    anchorMessageHeightRef.current = height;
    streamingContentHeightRef.current = 0;
    setAnchorMessageHeightState(height);
    recalculatePlaceholder();
  };

  const setStreamingContentHeight = (height: number, force = false) => {
    if (!force && streamingContentHeightRef.current > height) {
      return;
    }

    streamingContentHeightRef.current = height;
    recalculatePlaceholder();
  };

  const setContainerPadding = (padding: number, topPadding: number) => {
    containerPaddingRef.current = padding;
    setContainerPaddingState(padding);
    setPaddingTopState(topPadding);
    recalculatePlaceholder();
  };

  return {
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
  };
};
