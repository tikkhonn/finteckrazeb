import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { LinearGradient } from 'expo-linear-gradient';

import { formatCardPan, type ResolvedProfile } from '@/domain/profile';
import { BankCardFace } from '@/features/BankCard';
import { colors, radius, spacing, textOutline, useTheme } from '@/ui';

const SNAP = { damping: 18, stiffness: 220, mass: 0.7 } as const;

function snapRotation(current: number, velocityX: number): number {
  'worklet';
  const projected = current - velocityX * 0.12;
  const wrapped = ((projected % 360) + 360) % 360;
  return wrapped > 90 && wrapped < 270 ? 180 : 0;
}

function pulseHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

function CardBack({
  profile,
  cvvOpen,
  onToggleCvv,
}: {
  profile: ResolvedProfile;
  cvvOpen: boolean;
  onToggleCvv: () => void;
}) {
  const { shadow } = useTheme();
  return (
    <View style={[styles.back, shadow.card]}>
      <LinearGradient
        colors={['rgba(11,31,58,0.55)', 'rgba(11,31,58,0.2)', 'rgba(11,31,58,0.5)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.backTop}>
        <Text style={styles.pan}>{formatCardPan(profile.cardPan)}</Text>
        <Text style={styles.network}>{profile.cardNetwork}</Text>
      </View>
      <View style={styles.backBottom}>
        <View style={styles.expBlock}>
          <Text style={styles.fieldLabel}>Срок</Text>
          <Text style={styles.fieldValue}>{profile.cardExp}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cvvOpen ? 'Скрыть CVV' : 'Показать CVV'}
          onPress={onToggleCvv}
          style={({ pressed }) => [styles.cvvBlock, pressed && styles.cvvPressed]}
        >
          <Text style={styles.fieldLabel}>CVV</Text>
          <Text style={styles.fieldValue}>{cvvOpen ? profile.cardCvv : '•••'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function FlippableBankCard({ profile }: { profile: ResolvedProfile }) {
  const rotation = useSharedValue(0);
  const start = useSharedValue(0);
  const width = useSharedValue(1);
  const [face, setFace] = useState<'front' | 'back'>('front');
  const [cvvOpen, setCvvOpen] = useState(false);

  function onSnapped(target: number) {
    pulseHaptic();
    if (target < 90) {
      setFace('front');
      setCvvOpen(false);
    } else {
      setFace('back');
    }
  }

  const pan = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .failOffsetY([-12, 12])
    .onStart(() => {
      start.value = rotation.value;
    })
    .onUpdate((event) => {
      const next = start.value - (event.translationX / Math.max(width.value, 1)) * 180;
      rotation.value = Math.max(-30, Math.min(210, next));
    })
    .onEnd((event) => {
      const target = snapRotation(rotation.value, event.velocityX);
      rotation.value = withSpring(target, SNAP, (finished) => {
        if (finished) {
          scheduleOnRN(onSnapped, target);
        }
      });
    });

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
    opacity: rotation.value > 90 ? 0 : 1,
    zIndex: rotation.value > 90 ? 0 : 1,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value + 180}deg` }],
    opacity: rotation.value > 90 ? 1 : 0,
    zIndex: rotation.value > 90 ? 1 : 0,
  }));

  return (
    <GestureDetector gesture={pan}>
      <View
        accessibilityLabel={
          face === 'back' ? 'Оборот карты, смахните чтобы вернуть' : 'Карта, смахните чтобы увидеть реквизиты'
        }
        onLayout={(event) => {
          width.value = event.nativeEvent.layout.width;
        }}
        style={styles.stage}
      >
        <Animated.View
          style={[styles.face, frontStyle, { pointerEvents: face === 'front' ? 'auto' : 'none' }]}
        >
          <BankCardFace profile={profile} />
        </Animated.View>
        <Animated.View
          style={[styles.face, backStyle, { pointerEvents: face === 'back' ? 'auto' : 'none' }]}
        >
          <CardBack profile={profile} cvvOpen={cvvOpen} onToggleCvv={() => setCvvOpen((value) => !value)} />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    aspectRatio: 1.586,
  },
  face: {
    ...StyleSheet.absoluteFill,
    backfaceVisibility: 'hidden',
  },
  back: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  backTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  pan: {
    flex: 1,
    color: colors.onPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1.8,
    ...textOutline(2),
  },
  network: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    ...textOutline(2),
  },
  backBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  expBlock: {
    gap: 4,
  },
  cvvBlock: {
    alignItems: 'flex-end',
    gap: 4,
    paddingVertical: 4,
    paddingLeft: spacing.md,
  },
  cvvPressed: {
    opacity: 0.85,
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    ...textOutline(2),
  },
  fieldValue: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
    ...textOutline(2),
  },
});
