import { DeviceMotion } from 'expo-sensors';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { createFlipDetector } from '@/domain/flipHide';

import { applyFlipHide } from './applyFlipHide';

export function useFlipHideSensor() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let subscription: { remove: () => void } | null = null;
    let detector = createFlipDetector();
    let starting = false;

    async function start() {
      if (starting || subscription) {
        return;
      }
      starting = true;
      try {
        const available = await DeviceMotion.isAvailableAsync();
        if (!available) {
          return;
        }
        // Не вызывать get/requestPermissionsAsync: на iOS это RCTFatal без NSMotionUsageDescription,
        // а поток CMMotionManager разрешения не требует.
        detector = createFlipDetector();
        DeviceMotion.setUpdateInterval(50);
        subscription = DeviceMotion.addListener((data) => {
          const z = data.accelerationIncludingGravity.z;
          if (typeof z !== 'number') {
            return;
          }
          if (detector.push(z, Date.now())) {
            applyFlipHide();
          }
        });
      } catch {
        // Датчик или разрешение недоступны — тумблер остаётся.
      } finally {
        starting = false;
      }
    }

    function stop() {
      subscription?.remove();
      subscription = null;
      detector.reset();
    }

    const app = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void start();
      } else {
        stop();
      }
    });

    if (AppState.currentState === 'active') {
      void start();
    }

    return () => {
      app.remove();
      stop();
    };
  }, []);
}
