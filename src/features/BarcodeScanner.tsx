import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, colors, spacing } from '@/ui';

interface BarcodeScannerProps {
  onScan: (value: string) => void;
  hint: string;
}

export function BarcodeScanner({ onScan, hint }: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const lock = useRef(false);
  const [ready, setReady] = useState(true);

  if (!permission) {
    return <Text style={styles.hint}>Проверяем доступ к камере…</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.hint}>Нужен доступ к камере, чтобы сканировать коды.</Text>
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
      <Text style={styles.hint}>{hint}</Text>
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
  hint: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  fallback: { gap: spacing.md },
});
