import { Text } from 'react-native';

import { Card, Screen, colors } from '@/ui';

export default function HelpScreen() {
  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Проблема с покупкой</Text>
      <Text style={{ color: colors.textMuted }}>
        Обратитесь к сотруднику магазина. Банк видит статус оплаты, магазин отвечает за товар и чек.
      </Text>
      <Card>
        <Text style={{ fontWeight: '700', color: colors.text }}>Если оплата «обрабатывается»</Text>
        <Text style={{ color: colors.textMuted }}>
          Не нажимайте оплату повторно с новой попыткой. Повторите запрос статуса — это та же операция.
        </Text>
      </Card>
      <Card>
        <Text style={{ fontWeight: '700', color: colors.text }}>Если товар не найден</Text>
        <Text style={{ color: colors.textMuted }}>
          Кассир может добавить позицию до оплаты. Сумма обновится, и её нужно подтвердить заново.
        </Text>
      </Card>
      <Card>
        <Text style={{ fontWeight: '700', color: colors.text }}>Выборочная проверка</Text>
        <Text style={{ color: colors.textMuted }}>
          Покажите экран оплаченной покупки. Банк не гарантирует полноту физической корзины.
        </Text>
      </Card>
    </Screen>
  );
}
