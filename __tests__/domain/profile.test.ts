import {
  INSUFFICIENT_FUNDS,
  addExtraDocument,
  addableDocumentTypes,
  applyCashOp,
  applyCompletedRefund,
  applySucceededPayment,
  emptyOverlays,
  findCashOp,
  parseOverlays,
  resolveProfile,
  resolveProfileItem,
  switchActive,
} from '@/domain/profile';

describe('addExtraDocument', () => {
  it('добавляет СНИЛС к текущему профилю', () => {
    const next = addExtraDocument(emptyOverlays(), 'snils');
    const profile = resolveProfile(next);
    expect(profile.documents.map((item) => item.type)).toEqual(['passport', 'inn', 'snils']);
    expect(profile.documents[profile.documents.length - 1]?.value).toBe('152-394-281 64');
  });

  it('не даёт добавить паспорт повторно', () => {
    expect(() => addExtraDocument(emptyOverlays(), 'passport')).toThrow('DOCUMENT_ALREADY_ADDED');
  });

  it('не даёт добавить тот же опциональный тип дважды', () => {
    const once = addExtraDocument(emptyOverlays(), 'driver');
    expect(() => addExtraDocument(once, 'driver')).toThrow('DOCUMENT_ALREADY_ADDED');
  });
});

describe('addableDocumentTypes', () => {
  it('предлагает только ещё не добавленные типы', () => {
    expect(addableDocumentTypes(['passport', 'inn'])).toEqual(['snils', 'driver', 'foreign']);
    expect(addableDocumentTypes(['passport', 'inn', 'snils', 'driver', 'foreign'])).toEqual([]);
  });
});

describe('switchActive', () => {
  it('меняет activeId и карту', () => {
    const next = switchActive(emptyOverlays(), 'dmitry');
    expect(next.activeId).toBe('dmitry');
    const profile = resolveProfile(next);
    expect(profile.firstName).toBe('Дмитрий');
    expect(profile.cardLast4).toBe('8891');
    expect(profile.balance).toBe(54320);
  });

  it('не трогает оверлеи другого профиля', () => {
    const withAvatar = {
      ...emptyOverlays(),
      avatarById: { anna: 'file://anna.jpg' },
    };
    const next = switchActive(withAvatar, 'maria');
    expect(next.avatarById.anna).toBe('file://anna.jpg');
    expect(resolveProfile(next).avatarUri).toBeNull();
  });
});

describe('parseOverlays', () => {
  it('отбрасывает неизвестные id и типы', () => {
    const parsed = parseOverlays({
      activeId: 'ghost',
      avatarById: { anna: 'file://ok.jpg', ghost: 'x' },
      extraDocsById: { anna: ['snils', 'passport', 'nope'] },
    });
    expect(parsed.activeId).toBe('anna');
    expect(parsed.avatarById).toEqual({ anna: 'file://ok.jpg' });
    expect(parsed.extraDocsById.anna).toEqual(['snils']);
  });
});

describe('resolveProfileItem', () => {
  it('находит телефон и паспорт', () => {
    const profile = resolveProfile(emptyOverlays());
    expect(resolveProfileItem(profile, 'phone')?.value).toBe('+7 916 123-45-67');
    expect(resolveProfileItem(profile, 'passport')?.title).toBe('Паспорт');
    expect(resolveProfileItem(profile, 'unknown')).toBeNull();
  });
});

describe('баланс и QR-операции', () => {
  it('пополнение увеличивает баланс и пишет операцию', () => {
    const { overlays, op } = applyCashOp(emptyOverlays(), {
      kind: 'topup',
      amount: 500,
      qr: 'CASH-IN',
      at: 1,
      id: 'cop_1',
    });
    expect(resolveProfile(overlays).balance).toBe(128950);
    expect(op.kind).toBe('topup');
    expect(findCashOp(overlays, 'cop_1')?.amount).toBe(500);
  });

  it('снятие больше баланса запрещено', () => {
    expect(() =>
      applyCashOp(emptyOverlays(), { kind: 'withdraw', amount: 200000, qr: 'CASH-OUT' }),
    ).toThrow(INSUFFICIENT_FUNDS);
    expect(resolveProfile(emptyOverlays()).balance).toBe(128450);
  });

  it('оплата списывает один раз и не уходит ниже нуля', () => {
    const once = applySucceededPayment(emptyOverlays(), 'pay_1', 450);
    expect(resolveProfile(once).balance).toBe(128000);
    const twice = applySucceededPayment(once, 'pay_1', 450);
    expect(resolveProfile(twice).balance).toBe(128000);
    const drained = applySucceededPayment(emptyOverlays(), 'pay_2', 500000);
    expect(resolveProfile(drained).balance).toBe(0);
  });

  it('возврат зачисляет один раз', () => {
    const afterPay = applySucceededPayment(emptyOverlays(), 'pay_1', 1000);
    const afterRefund = applyCompletedRefund(afterPay, 'rfd_1', 400);
    expect(resolveProfile(afterRefund).balance).toBe(127850);
    const again = applyCompletedRefund(afterRefund, 'rfd_1', 400);
    expect(resolveProfile(again).balance).toBe(127850);
  });

  it('parseOverlays поднимает баланс и операции', () => {
    const parsed = parseOverlays({
      activeId: 'dmitry',
      balanceById: { dmitry: 100 },
      cashOpsById: {
        dmitry: [{ id: 'cop_x', kind: 'topup', amount: 100, qr: 'QR', at: 9 }],
      },
      appliedPayments: { pay_1: true },
    });
    expect(parsed.activeId).toBe('dmitry');
    expect(resolveProfile(parsed).balance).toBe(100);
    expect(findCashOp(parsed, 'cop_x')?.qr).toBe('QR');
    expect(parsed.appliedPayments.pay_1).toBe(true);
  });
});
