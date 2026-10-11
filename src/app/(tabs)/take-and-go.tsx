import { PlaceholderSection } from '@/features/PlaceholderSection';

export default function TakeAndGoScreen() {
  return (
    <PlaceholderSection
      inTabs
      title="Take & Go"
      subtitle="Автономный магазин: корзина формируется по камерам и датчикам, оплата — в приложении банка."
      bullets={[
        'Привязка визита к банковской сессии',
        'Итоговая корзина перед списанием',
        'Контроль спорных позиций вместо автосписания',
      ]}
    />
  );
}
