import type { ReactNode } from 'react';
import type {
  LegendListRenderItemProps,
  LegendListProps,
  LegendListRef,
} from '@legendapp/list';

export type WhitespacePhase =
  | 'none'
  | 'active'
  | 'visible_static'
  | 'dismissed';

export type StreamingMessageListConfig = {
  debounceMs?: number;
  placeholderStableDelayMs?: number;
};

export type StreamingMessageListProps<T> = Omit<
  LegendListProps<T>,
  'data' | 'renderItem' | 'children'
> & {
  data: T[];
  isStreaming?: boolean;
  config?: StreamingMessageListConfig;
  renderItem?: (info: LegendListRenderItemProps<T>) => ReactNode | null;
};

export type StreamingMessageListRef = LegendListRef;
