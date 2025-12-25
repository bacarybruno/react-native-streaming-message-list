export const DEFAULT_SCROLL_THRESHOLD = 30;
const PLACEHOLDER_HEIGHT_TOLERANCE = 50;

type PlaceholderState = {
  shouldShowPlaceholder: boolean;
  placeholderHeight: number;
  flatListHeight: number;
  containerPadding: number;
  anchorMessageHeight: number;
  needsScrollToNewMessage: boolean;
  isPlaceholderStable: boolean;
};

export const calculateDistanceFromBottom = (
  contentHeight: number,
  contentOffset: number,
  layoutHeight: number,
  placeholderState: Pick<
    PlaceholderState,
    'shouldShowPlaceholder' | 'placeholderHeight'
  >
): number => {
  return (
    contentHeight -
    (contentOffset + layoutHeight) -
    (placeholderState.shouldShowPlaceholder
      ? placeholderState.placeholderHeight
      : 0)
  );
};

export const calculateScrollOffsetForNewMessage = (
  contentHeight: number,
  placeholderHeight: number,
  anchorMessageHeight: number
): number => {
  return contentHeight - placeholderHeight - anchorMessageHeight;
};

export const shouldScrollToNewMessage = (
  state: Pick<
    PlaceholderState,
    | 'needsScrollToNewMessage'
    | 'placeholderHeight'
    | 'isPlaceholderStable'
    | 'anchorMessageHeight'
    | 'flatListHeight'
    | 'containerPadding'
  >
): boolean => {
  if (
    !state.needsScrollToNewMessage ||
    state.placeholderHeight <= 0 ||
    !state.isPlaceholderStable ||
    state.anchorMessageHeight <= 0
  ) {
    return false;
  }

  const availableSpace = state.flatListHeight - state.containerPadding;
  const expectedMinPlaceholderHeight =
    availableSpace - state.anchorMessageHeight - PLACEHOLDER_HEIGHT_TOLERANCE;

  return state.placeholderHeight >= expectedMinPlaceholderHeight;
};
