import { PlaceholderSection } from '@/features/PlaceholderSection';

export default function CashbackOfferScreen() {
  return (
    <PlaceholderSection
      title="Кешбэк"
      subtitle="Категории месяца и лимиты — как на сайте банка."
      bullets={[
        'Выбор категорий на месяц',
        'Лимиты по каждой категории',
        'Зачисление на карту после покупок',
      ]}
    />
  );
}
