import * as Haptics from 'expo-haptics';

import { usePrefsStore } from '@/store/prefsStore';

export function applyFlipHide() {
  const { hideBalances, setHideBalances } = usePrefsStore.getState();
  setHideBalances(!hideBalances);
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    // Нет Taptic / вибрации — жест всё равно переключил флаг.
  });
}
