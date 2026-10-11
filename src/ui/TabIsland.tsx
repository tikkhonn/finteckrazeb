import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { Image, type ImageSource } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme } from './theme';
import { radius } from './tokens';
import type { ThemeColors } from './tokens';

const PAD = 6;
const SPRING_SNAP = { damping: 20, stiffness: 320, mass: 0.6 };
const SPRING_FOLLOW = { damping: 22, stiffness: 520, mass: 0.5 };
const SPRING_LENS = { damping: 15, stiffness: 260, mass: 0.6 };

const TABS: {
  name: string;
  title: string;
  symbol?: SFSymbol;
  glyph?: string;
  image?: ImageSource;
}[] = [
  { name: 'index', title: 'Главная', symbol: 'house.fill', glyph: '⌂' },
  { name: 'scan-and-go', title: 'Scan & Go', image: require('../../assets/images/icon-scan-and-go.png') },
  { name: 'take-and-go', title: 'Take & Go', image: require('../../assets/images/icon-take-and-go.png') },
  { name: 'settings', title: 'Профиль', symbol: 'person.fill', glyph: '☺' },
];

type TabIslandProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
  insets: { bottom: number };
};

function useGlassIsland(): boolean {
  if (Platform.OS !== 'ios') {
    return false;
  }
  try {
    return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

export function TabIsland({ state, navigation, insets }: TabIslandProps) {
  const { colors, shadow } = useTheme();
  const glass = useGlassIsland();
  const { width: windowWidth } = useWindowDimensions();
  const islandWidth = Math.min(windowWidth - 40, 420);
  const count = state.routes.length;
  const slotWidth = (islandWidth - PAD * 2) / count;
  const maxX = PAD + (count - 1) * slotWidth;

  const capsuleX = useSharedValue(PAD + state.index * slotWidth);
  const lens = useSharedValue(0);
  const targetX = useSharedValue(PAD + state.index * slotWidth);
  const dragging = useSharedValue(false);

  function select(index: number) {
    const next = Math.max(0, Math.min(index, count - 1));
    const route = state.routes[next];
    if (!route) {
      return;
    }
    if (next === state.index) {
      return;
    }
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true as const,
    });
    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  }

  useEffect(() => {
    if (dragging.get()) {
      return;
    }
    const rest = PAD + state.index * slotWidth;
    targetX.set(rest);
    capsuleX.set(withSpring(rest, SPRING_SNAP));
  }, [capsuleX, dragging, slotWidth, state.index, targetX]);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-12, 12])
    .onStart(() => {
      dragging.set(true);
      lens.set(withSpring(1, SPRING_LENS));
    })
    .onUpdate((event) => {
      const target = Math.max(PAD, Math.min(maxX, event.x - slotWidth / 2));
      targetX.set(target);
      capsuleX.set(withSpring(target, SPRING_FOLLOW));
    })
    .onEnd(() => {
      const idx = Math.max(0, Math.min(count - 1, Math.round((capsuleX.get() - PAD) / slotWidth)));
      targetX.set(PAD + idx * slotWidth);
      capsuleX.set(withSpring(PAD + idx * slotWidth, SPRING_SNAP));
      scheduleOnRN(select, idx);
    })
    .onFinalize(() => {
      dragging.set(false);
      lens.set(withSpring(0, SPRING_LENS));
    });

  const capsuleStyle = useAnimatedStyle(() => {
    const stretch = Math.min(1, Math.abs(targetX.value - capsuleX.value) / (slotWidth * 1.5));
    const grow = 1 + 0.32 * lens.value;
    return {
      width: slotWidth,
      transform: [
        { translateX: capsuleX.value },
        { scaleX: grow * (1 + 0.3 * stretch) },
        { scaleY: grow * (1 - 0.12 * stretch) },
      ],
    };
  });

  const shell = (
    <>
      <Animated.View style={[styles.capsuleWrap, capsuleStyle]}>
        {glass ? (
          <GlassView
            style={styles.capsuleGlass}
            glassEffectStyle="clear"
            tintColor={colors.capsule}
            isInteractive={false}
          />
        ) : (
          <View
            style={[
              styles.capsuleGlass,
              styles.capsuleFallback,
              { backgroundColor: colors.capsule, ...shadow.soft },
            ]}
          />
        )}
      </Animated.View>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const meta = TABS.find((tab) => tab.name === route.name) ?? TABS[index];
          return (
            <TabSlot
              key={route.key}
              title={meta.title}
              symbol={meta.symbol}
              glyph={meta.glyph}
              image={meta.image}
              slotX={PAD + index * slotWidth}
              slotWidth={slotWidth}
              capsuleX={capsuleX}
              active={state.index === index}
              colors={colors}
              onPress={() => select(index)}
            />
          );
        })}
      </View>
    </>
  );

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <GestureDetector gesture={pan}>
        <View style={[styles.islandShadow, shadow.card, { width: islandWidth }]} collapsable={false}>
          <View style={styles.islandClip}>
            {glass ? (
              <GlassView
                style={[StyleSheet.absoluteFill, styles.noPointer]}
                glassEffectStyle="regular"
                tintColor={colors.islandTint}
                isInteractive={false}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.noPointer, { backgroundColor: colors.island }]} />
            )}
            <View style={styles.islandPad}>{shell}</View>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

function TabSlot({
  title,
  symbol,
  glyph,
  image,
  slotX,
  slotWidth,
  capsuleX,
  active,
  colors,
  onPress,
}: {
  title: string;
  symbol?: SFSymbol;
  glyph?: string;
  image?: ImageSource;
  slotX: number;
  slotWidth: number;
  capsuleX: { value: number };
  active: boolean;
  colors: ThemeColors;
  onPress: () => void;
}) {
  const near = useAnimatedStyle(() => {
    const closeness = Math.max(0, 1 - Math.abs(capsuleX.value - slotX) / slotWidth);
    return {
      transform: [{ scale: 1 + 0.1 * closeness }],
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const closeness = Math.max(0, 1 - Math.abs(capsuleX.value - slotX) / slotWidth);
    return {
      color: interpolateColor(closeness, [0, 1], [colors.onPrimary, colors.primary]),
    };
  });

  const baseIcon = useAnimatedStyle(() => {
    const closeness = Math.max(0, 1 - Math.abs(capsuleX.value - slotX) / slotWidth);
    return { opacity: 1 - closeness };
  });

  const activeIcon = useAnimatedStyle(() => {
    const closeness = Math.max(0, 1 - Math.abs(capsuleX.value - slotX) / slotWidth);
    return { opacity: closeness };
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.slot}
    >
      <Animated.View style={[image ? styles.imageWrap : styles.iconWrap, near]}>
        {image ? (
          <>
            <Animated.View style={baseIcon}>
              <Image
                source={image}
                style={styles.tabImage}
                contentFit="contain"
                tintColor={colors.onPrimary}
              />
            </Animated.View>
            <Animated.View style={[styles.symbolTop, activeIcon]}>
              <Image
                source={image}
                style={styles.tabImage}
                contentFit="contain"
                tintColor={colors.primary}
              />
            </Animated.View>
          </>
        ) : Platform.OS === 'web' ? (
          <>
            <Animated.Text style={[styles.glyph, { color: colors.onPrimary }, baseIcon]}>
              {glyph}
            </Animated.Text>
            <Animated.Text
              style={[styles.glyph, styles.glyphTop, { color: colors.primary }, activeIcon]}
            >
              {glyph}
            </Animated.Text>
          </>
        ) : (
          <>
            <Animated.View style={baseIcon}>
              <SymbolView
                name={symbol ?? 'circle'}
                tintColor={colors.onPrimary}
                size={22}
                style={styles.symbol}
              />
            </Animated.View>
            <Animated.View style={[styles.symbolTop, activeIcon]}>
              <SymbolView
                name={symbol ?? 'circle'}
                tintColor={colors.primary}
                size={22}
                style={styles.symbol}
              />
            </Animated.View>
          </>
        )}
      </Animated.View>
      <Animated.Text style={[styles.label, labelStyle]} numberOfLines={1}>
        {title}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  islandShadow: {
    borderRadius: radius.pill,
  },
  islandClip: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  islandPad: {
    paddingVertical: 6,
    paddingHorizontal: PAD,
  },
  capsuleWrap: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    pointerEvents: 'none',
  },
  capsuleGlass: {
    flex: 1,
    borderRadius: radius.pill,
    pointerEvents: 'none',
  },
  noPointer: {
    pointerEvents: 'none',
  },
  capsuleFallback: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    gap: 3,
  },
  iconWrap: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: 32,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabImage: {
    width: 32,
    height: 22,
  },
  symbol: {
    width: 24,
    height: 24,
  },
  symbolTop: {
    position: 'absolute',
  },
  glyph: {
    fontSize: 18,
    fontWeight: '700',
  },
  glyphTop: {
    position: 'absolute',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
