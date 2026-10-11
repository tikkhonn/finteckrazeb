export type WalletKind = 'card' | 'savings' | 'piggy';

export type HubWallet = {
  id: string;
  name: string;
  bank: string;
  last4: string;
  kind: WalletKind;
  tint: string;
  mark: string;
  caption: string;
};

export const HUB_WALLETS: HubWallet[] = [
  {
    id: 'sber',
    name: 'Сбербанк',
    bank: 'Сбербанк',
    last4: '4389',
    kind: 'card',
    tint: '#21A038',
    mark: 'С',
    caption: 'Карта другого банка',
  },
  {
    id: 'alfa',
    name: 'Альфа-Банк',
    bank: 'Альфа-Банк',
    last4: '1965',
    kind: 'card',
    tint: '#EF3124',
    mark: 'А',
    caption: 'Карта другого банка',
  },
  {
    id: 'piggy',
    name: 'Копилка',
    bank: 'ВТБ',
    last4: '7126',
    kind: 'piggy',
    tint: '#0033A0',
    mark: 'Я',
    caption: 'Цифровая · копилка',
  },
  {
    id: 'savings',
    name: 'Накопительный',
    bank: 'ВТБ',
    last4: '5913',
    kind: 'savings',
    tint: '#6B7789',
    mark: '⌂',
    caption: 'Накопительный счёт',
  },
];

export function findWallet(id: string): HubWallet | undefined {
  return HUB_WALLETS.find((item) => item.id === id);
}

export type HubCertificate = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
};

export const HUB_CERTIFICATES: HubCertificate[] = [
  {
    id: 'contract',
    title: 'О заключении договора',
    subtitle: 'Подтверждает его наличие',
    body: 'Справка подтверждает, что у вас открыт счёт и карта ВТБ Go. Демо: файл на почту не уходит.',
  },
  {
    id: 'balance',
    title: 'О доступном остатке',
    subtitle: 'Подходит для получения визы',
    body: 'Показывает остаток по карте ВТБ на дату заказа. Для визы обычно просят период 3 месяца — в демо достаточно одной даты.',
  },
  {
    id: 'credit',
    title: 'О задолженности по кредитам',
    subtitle: 'Подтверждает её наличие или отсутствие',
    body: 'В демо кредитов нет — справка фиксирует отсутствие задолженности.',
  },
  {
    id: 'statement',
    title: 'Выписка по договору',
    subtitle: 'О движении средств за выбранный период',
    body: 'В выписку попадут покупки Scan & Go и операции по QR. Период в демо всегда «текущий месяц».',
  },
  {
    id: 'civil',
    title: 'Сведения для госслужащих',
    subtitle: 'О наличии счетов и иной информации',
    body: 'Набор сведений для декларации: карта, накопительный счёт и копилка из демо-профиля.',
  },
];

export function findCertificate(id: string): HubCertificate | undefined {
  return HUB_CERTIFICATES.find((item) => item.id === id);
}

export type HubFaq = {
  id: string;
  title: string;
  lead: string;
  body: string;
};

export const HUB_FAQS: HubFaq[] = [
  {
    id: 'scan',
    title: 'Scan & Go',
    lead: 'Оплата в магазине без кассы',
    body: 'На входе отсканируйте QR магазина, добавляйте товары по штрихкоду и подтвердите оплату в приложении. Касса не нужна: чек придёт в историю после списания.',
  },
  {
    id: 'pay',
    title: 'Оплата',
    lead: 'Карта, СБП и статус платежа',
    body: 'Если статус «обрабатывается», не запускайте новую оплату — это та же операция. Повторите запрос статуса. При отказе банка деньги не списываются, можно выбрать другой способ.',
  },
  {
    id: 'receipt',
    title: 'Чек и возврат',
    lead: 'Электронный чек и одна позиция',
    body: 'Чек демо-формата. Возврат — запрос в магазин по одной позиции, не мгновенное зачисление. Магазин подтверждает товар, банк проводит возврат на карту.',
  },
  {
    id: 'card',
    title: 'Карта и кешбэк',
    lead: 'Категории месяца и лимиты',
    body: 'Кешбэк считается по категориям месяца. Карта ВТБ в приложении — та же, что на главной. Реквизиты смотрите в разделе карты, не пересылайте CVV.',
  },
  {
    id: 'cash',
    title: 'Снятие и пополнение',
    lead: 'QR в партнёрской точке',
    body: 'Сумму задаёте в приложении, затем сканируете QR точки. Снятие списывает баланс, пополнение зачисляет. Пустой QR не проходит.',
  },
  {
    id: 'docs',
    title: 'Документы',
    lead: 'Паспорт, ИНН и остальные',
    body: 'Список документов — в «Ваших данных». Добавление в демо создаёт карточку, поля нельзя редактировать. Это нужно для справок и идентификации.',
  },
  {
    id: 'take',
    title: 'Take & Go',
    lead: 'Магазин без сканера товаров',
    body: 'Корзина собирается камерами и датчиками, перед списанием вы подтверждаете итог. Раздел ещё в разработке — сейчас покупка идёт через Scan & Go.',
  },
  {
    id: 'all',
    title: 'Все вопросы',
    lead: 'Оплата, настройки, карты',
    body: 'Не нашли тему — напишите вопрос кнопкой внизу поддержки. В демо сообщение не уходит в банк, но фиксирует сценарий обращения.',
  },
];

export function findFaq(id: string): HubFaq | undefined {
  return HUB_FAQS.find((item) => item.id === id);
}
