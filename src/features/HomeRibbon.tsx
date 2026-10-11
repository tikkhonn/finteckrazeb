import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import { contentPad, spacing, useTheme } from '@/ui';

import { BANK_NEWS } from './homeContent';

const CARD_WIDTH = 72;
const CARD_GAP = 12;
const RING = 2;
const GAP = 2;
const SPEED = 0.45;

/** Ширина одного набора из 4 новостей (gap только между карточками). */
const SET_WIDTH = BANK_NEWS.length * CARD_WIDTH + (BANK_NEWS.length - 1) * CARD_GAP;

function wrapOffset(value: number): number {
  'worklet';
  let next = value;
  if (next >= SET_WIDTH * 2) {
    next -= SET_WIDTH;
  } else if (next < SET_WIDTH) {
    next += SET_WIDTH;
  }
  return next;
}

function loopCopiesForScreen(screenWidth: number): number {
  const minTrack = screenWidth + SET_WIDTH * 2;
  return Math.max(3, Math.ceil(minTrack / SET_WIDTH));
}

export function HomeRibbon() {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const copies = loopCopiesForScreen(screenWidth);
  const loop = useMemo(
    () => Array.from({ length: copies }, () => BANK_NEWS).flat(),
    [copies],
  );

  const reduceMotion = useReducedMotion();
  const offset = useSharedValue(SET_WIDTH);
  const paused = useSharedValue(false);
  const dragStart = useSharedValue(SET_WIDTH);

  useFrameCallback(() => {
    if (paused.get()) {
      return;
    }
    offset.set(wrapOffset(offset.get() + SPEED));
  }, !reduceMotion);

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      paused.set(true);
      dragStart.set(offset.get());
    })
    .onUpdate((event) => {
      offset.set(wrapOffset(dragStart.get() - event.translationX));
    })
    .onEnd((event) => {
      if (Math.abs(event.velocityX) > 120) {
        offset.set(wrapOffset(offset.get() - event.velocityX * 0.02));
      }
    })
    .onFinalize(() => {
      offset.set(wrapOffset(offset.get()));
      paused.set(false);
    });

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -offset.value }],
  }));

  const cards = loop.map((item, index) => (
    <Pressable
      key={`${item.id}-${index}`}
      accessibilityRole="button"
      accessibilityLabel={item.tileTitle}
      onPress={() => router.push(`/info/${item.id}`)}
      style={({ pressed }) => [styles.press, pressed && styles.pressed]}
    >
      <View style={[styles.ring, { borderColor: colors.accent }]}>
        <View style={[styles.tile, { backgroundColor: colors.primary }]}>
          <Image source={item.image} style={styles.image} contentFit="cover" />
        </View>
      </View>
      <Text style={[styles.caption, { color: colors.text }]} numberOfLines={2}>
        {item.tileTitle}
      </Text>
    </Pressable>
  ));

  return (
    <View style={[styles.wrap, { width: screenWidth, marginHorizontal: -contentPad }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Новости</Text>
      <View style={styles.viewport}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.row, trackStyle]}>{cards}</Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    paddingHorizontal: contentPad,
    fontSize: 13,
    fontWeight: '600',
  },
  viewport: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: CARD_GAP,
  },
  press: {
    width: CARD_WIDTH,
    gap: 6,
  },
  pressed: { opacity: 0.85 },
  ring: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    borderRadius: 22,
    borderWidth: RING,
    padding: GAP,
  },
  tile: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    textAlign: 'center',
  },
});
