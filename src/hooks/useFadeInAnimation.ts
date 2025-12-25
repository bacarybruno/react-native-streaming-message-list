import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

export const useFadeInAnimation = ({
  onAnimationComplete,
}: {
  onAnimationComplete?: () => void;
}) => {
  const opacity = useSharedValue(0);
  const hasAnimated = useSharedValue(false);

  useEffect(() => {
    if (hasAnimated.value) {
      return;
    }

    hasAnimated.value = true;

    opacity.value = withTiming(1, { duration: 350 }, () => {
      if (onAnimationComplete) {
        runOnJS(onAnimationComplete)();
      }
    });
  }, [opacity, hasAnimated, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return {
    animatedStyle,
  };
};
