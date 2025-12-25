import Animated from 'react-native-reanimated';
import type { AnimatedMessageProps } from './types';
import { useSlideUpAnimation } from './hooks/useSlideUpAnimation';
import { useFadeInAnimation } from './hooks/useFadeInAnimation';

export const AnimatedMessage = ({
  animation,
  onAnimationComplete,
  children,
}: AnimatedMessageProps) => {
  const { animatedStyle: slideUpStyle, onLayout } = useSlideUpAnimation({
    onAnimationComplete:
      animation === 'slideUp' ? onAnimationComplete : undefined,
  });

  const { animatedStyle: fadeInStyle } = useFadeInAnimation({
    onAnimationComplete:
      animation === 'fadeIn' ? onAnimationComplete : undefined,
  });

  if (animation === 'slideUp') {
    return (
      <Animated.View onLayout={onLayout} style={slideUpStyle}>
        {children}
      </Animated.View>
    );
  }

  if (animation === 'fadeIn') {
    return <Animated.View style={fadeInStyle}>{children}</Animated.View>;
  }

  return <>{children}</>;
};
