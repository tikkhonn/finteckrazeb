import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Button, spacing, useTheme } from '@/ui';

interface BarcodeScannerProps {
  onScan: (value: string) => void;
  hint: string;
}

/** На телефоне — камера и авто-скан. В браузере — только подсказка, без доступа к камере Mac. */
export function BarcodeScanner({ onScan, hint }: BarcodeScannerProps) {
  const { colors } = useTheme();
  if (Platform.OS === 'web') {
    return (
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {hint}. В браузере введите код в поле ниже.
      </Text>
    );
  }

  return <BarcodeScannerNative onScan={onScan} hint={hint} />;
}

function BarcodeScannerNative({ onScan, hint }: BarcodeScannerProps) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const lock = useRef(false);
  const [ready, setReady] = useState(true);

  if (!permission) {
    return <Text style={[styles.hint, { color: colors.textMuted }]}>Проверяем доступ к камере…</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.fallback}>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Нужен доступ к камере, чтобы сканировать коды.
        </Text>
        <Button title="Разрешить камеру" onPress={() => void requestPermission()} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'code128'],
        }}
        onBarcodeScanned={({ data }) => {
          if (!ready || lock.current || !data) {
            return;
          }
          lock.current = true;
          setReady(false);
          onScan(data);
          setTimeout(() => {
            lock.current = false;
            setReady(true);
          }, 1600);
        }}
      />
      <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  camera: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  hint: { fontSize: 13, textAlign: 'center' },
  fallback: { gap: spacing.md },
});
