import {
  FadeIn,
  FadeInDown,
  ReduceMotion,
  ZoomIn,
  type BaseAnimationBuilder,
} from 'react-native-reanimated';

export const STAGGER_MS = 70;

export const springEnter = {
  damping: 18,
  stiffness: 120,
  mass: 0.8,
} as const;

export function enterStagger(index: number): BaseAnimationBuilder {
  return FadeInDown.springify()
    .damping(springEnter.damping)
    .stiffness(springEnter.stiffness)
    .delay(index * STAGGER_MS)
    .reduceMotion(ReduceMotion.System);
}

export function enterFade(index: number): BaseAnimationBuilder {
  return FadeIn.delay(index * STAGGER_MS)
    .duration(400)
    .reduceMotion(ReduceMotion.System);
}

export const enterZoom = ZoomIn.springify()
  .damping(14)
  .stiffness(100)
  .reduceMotion(ReduceMotion.System);

export const pressSpring = {
  damping: 15,
  stiffness: 400,
  mass: 0.6,
} as const;
