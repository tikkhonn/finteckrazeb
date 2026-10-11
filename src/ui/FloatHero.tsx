import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface FloatHeroProps {
  children: ReactNode;
  amplitude?: number;
}

export function FloatHero({ children, amplitude = 6 }: FloatHeroProps) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withSequence(
        withTiming(-amplitude, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(amplitude, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [amplitude, offset]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
