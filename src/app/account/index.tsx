import { StyleSheet, Text } from 'react-native';

import { AccountActions } from '@/features/AccountActions';
import { AccountOperations } from '@/features/AccountOperations';
import { FlippableBankCard } from '@/features/FlippableBankCard';
import { MaskedAmount } from '@/features/MaskedAmount';
import { useActiveProfile } from '@/store/profileStore';
import { Screen, spacing, useTheme } from '@/ui';

export default function AccountScreen() {
  const profile = useActiveProfile();
  const { colors, typography } = useTheme();

  return (
    <Screen background="sky">
      <FlippableBankCard profile={profile} />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Смахните карту в сторону — на обороте номер, срок и CVV
      </Text>
      <MaskedAmount value={profile.balance} style={[typography.amount, styles.balance]} />
      <AccountActions />
      <AccountOperations />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  balance: { alignSelf: 'flex-start', marginTop: spacing.sm },
});
