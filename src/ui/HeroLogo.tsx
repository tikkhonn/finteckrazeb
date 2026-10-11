import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { FloatHero } from './FloatHero';
import { shadow } from './tokens';

const logoSource = require('../../assets/images/app-logo.png');

interface HeroLogoProps {
  size?: number;
  float?: boolean;
}

export function HeroLogo({ size = 72, float = true }: HeroLogoProps) {
  const image = (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.22 }]}>
      <Image source={logoSource} style={{ width: size, height: size }} contentFit="cover" />
    </View>
  );

  if (!float) {
    return image;
  }

  return <FloatHero amplitude={5}>{image}</FloatHero>;
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    ...shadow.soft,
  },
});
