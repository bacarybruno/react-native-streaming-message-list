import { useWindowDimensions } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

type AnimationValues = {
  start: {
    translateY: number;
    opacity: number;
  };
  end: {
    translateY: number;
    opacity: number;
  };
  duration: number;
};

const getAnimationValues = (windowHeight: number): AnimationValues => {
  'worklet';
  const startTranslateY = Math.min(100, windowHeight * 0.1);

  return {
    start: {
      translateY: startTranslateY,
      opacity: 0,
    },
    end: {
      translateY: 0,
      opacity: 1,
    },
    duration: 400,
  };
};

export const useSlideUpAnimation = ({
  onAnimationComplete,
}: {
  onAnimationComplete?: () => void;
}) => {
  const windowHeight = useWindowDimensions().height;
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const hasAnimated = useSharedValue(false);
  const messageHeight = useSharedValue(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;

    if (messageHeight.value === 0 && height > 0) {
      messageHeight.value = height;
    }
  };

  useAnimatedReaction(
    () => messageHeight.value,
    (height) => {
      if (hasAnimated.value || height <= 0) {
        return;
      }

      const animationValues = getAnimationValues(windowHeight);
      const { start, end, duration } = animationValues;

      translateY.value = start.translateY;
      opacity.value = start.opacity;

      hasAnimated.value = true;

      translateY.value = withSpring(end.translateY, {
        damping: 20,
        stiffness: 90,
      });

      opacity.value = withTiming(end.opacity, { duration }, () => {
        if (onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      });
    },
    [windowHeight, onAnimationComplete]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return {
    animatedStyle,
    onLayout,
  };
};
