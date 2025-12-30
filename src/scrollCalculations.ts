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

export const isWhitespaceInViewport = ({ contentOffset, layoutMeasurement, contentSize, placeholderHeight }: {
  contentOffset: number;
  layoutMeasurement: number;
  contentSize: number;
  placeholderHeight: number;
}): boolean => {
  if (placeholderHeight <= 0 || contentSize <= 0) {
    return false;
  }

  const viewportBottom = contentOffset + layoutMeasurement;
  const whitespaceStart = contentSize - placeholderHeight;

  return viewportBottom > whitespaceStart;
};
