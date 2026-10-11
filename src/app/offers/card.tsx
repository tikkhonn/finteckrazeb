import { PlaceholderSection } from '@/features/PlaceholderSection';

export default function CardOfferScreen() {
  return (
    <PlaceholderSection
      title="Дебетовая карта"
      subtitle="Оформление карты ВТБ с кешбэком в любимых категориях."
      bullets={[
        'Онлайн-заявка без визита в отделение',
        'Доставка или получение в офисе',
        'Оплата Scan & Go сразу после выпуска',
      ]}
    />
  );
}
