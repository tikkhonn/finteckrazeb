import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/** Must match the `expo-splash-screen` plugin config in app.json for a seamless handoff. */
const SPLASH_BG = '#0F1523';
const LOGO_SIZE = 160;
const LOGO_RADIUS = LOGO_SIZE * 0.27;

const logo = require('../../assets/images/splash-icon.png');

type Props = {
  /** App data is loaded and the UI underneath can be revealed. */
  ready: boolean;
  onFinish: () => void;
};

export function AnimatedSplash({ ready, onFinish }: Props) {
  const reduceMotion = useReducedMotion();
  const [introDone, setIntroDone] = useState(false);

  const logoScale = useSharedValue(1);
  const ring = useSharedValue(0);
  const caption = useSharedValue(reduceMotion ? 1 : 0);
  const exit = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    logoScale.value = withSequence(
      withTiming(0.9, { duration: 180, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 9, stiffness: 180 }),
    );
    ring.value = withDelay(180, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    caption.value = withDelay(
      320,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) scheduleOnRN(setIntroDone, true);
      }),
    );
  }, [reduceMotion, logoScale, ring, caption]);

  const canExit = ready && (introDone || reduceMotion);

  useEffect(() => {
    if (!canExit) return;
    exit.value = withDelay(
      reduceMotion ? 0 : 250,
      withTiming(
        1,
        { duration: reduceMotion ? 200 : 520, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) scheduleOnRN(onFinish);
        },
      ),
    );
  }, [canExit, reduceMotion, exit, onFinish]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(exit.value, [0.35, 1], [1, 0], 'clamp'),
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 1 : interpolate(exit.value, [0.4, 1], [1, 0], 'clamp'),
    transform: [{ scale: logoScale.value * (reduceMotion ? 1 : interpolate(exit.value, [0, 1], [1, 5])) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ring.value, [0, 0.15, 1], [0, 0.5, 0]),
    transform: [{ scale: interpolate(ring.value, [0, 1], [1, 1.7]) }],
  }));

  const captionStyle = useAnimatedStyle(() => ({
    opacity: caption.value * interpolate(exit.value, [0, 0.3], [1, 0], 'clamp'),
    transform: [{ translateY: interpolate(caption.value, [0, 1], [12, 0]) }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle, { pointerEvents: 'none' }]}>
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={logoStyle}>
        <Image
          source={logo}
          style={styles.logo}
          contentFit="contain"
          onDisplay={() => void SplashScreen.hideAsync()}
        />
      </Animated.View>
      <Animated.View style={[styles.captionWrap, captionStyle]}>
        <Text style={styles.title}>Pay and Go</Text>
        <Text style={styles.subtitle}>Покупки без касс</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPLASH_BG,
  },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },
  ring: {
    position: 'absolute',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_RADIUS,
    borderWidth: 2,
    borderColor: '#3BA4FF',
  },
  captionWrap: {
    position: 'absolute',
    top: '50%',
    marginTop: LOGO_SIZE / 2 + 28,
    alignItems: 'center',
  },
  title: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: 0.3 },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 },
});
