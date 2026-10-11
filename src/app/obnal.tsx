import { PlaceholderSection } from '@/features/PlaceholderSection';

export default function ObnalScreen() {
  return (
    <PlaceholderSection
      title="OOObnal"
      subtitle="Снятие наличных в партнёрской точке по подтверждённой операции в приложении."
      bullets={[
        'Выбор точки и суммы',
        'Проверка кассиром по коду',
        'Отдельный сценарий от оплаты покупки',
      ]}
    />
  );
}
