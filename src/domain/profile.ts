export type ProfileId = 'anna' | 'dmitry' | 'maria';

export type DocumentType = 'passport' | 'inn' | 'snils' | 'driver' | 'foreign';

export type ProfileFieldId = 'phone' | 'email' | 'address' | 'work' | 'region' | 'gosuslugi';

export type GosuslugiStatus = 'connected' | 'not_connected';

export interface ProfileDocument {
  type: DocumentType;
  title: string;
  value: string;
}

export interface Profile {
  id: ProfileId;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  work: string;
  paymentRegion: string;
  gosuslugi: GosuslugiStatus;
  cardLast4: string;
  /** Полный номер карты (16 цифр), только для демо-реквизитов. */
  cardPan: string;
  cardCvv: string;
  /** Срок в формате MM/YY, только для оборота карты. */
  cardExp: string;
  cardNetwork: string;
  accountName: string;
  balance: number;
  documents: ProfileDocument[];
}

export type CashKind = 'withdraw' | 'topup';

export interface CashOp {
  id: string;
  kind: CashKind;
  amount: number;
  qr: string;
  at: number;
}

export interface ProfileOverlays {
  activeId: ProfileId;
  avatarById: Partial<Record<ProfileId, string>>;
  extraDocsById: Partial<Record<ProfileId, DocumentType[]>>;
  balanceById: Partial<Record<ProfileId, number>>;
  cashOpsById: Partial<Record<ProfileId, CashOp[]>>;
  appliedPayments: Record<string, true>;
  appliedRefunds: Record<string, true>;
}

export interface ResolvedProfile extends Profile {
  avatarUri: string | null;
}

export const INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS';
export const INVALID_AMOUNT = 'INVALID_AMOUNT';
export const EMPTY_QR = 'EMPTY_QR';

export interface ProfileItem {
  id: string;
  title: string;
  value: string;
  caption?: string;
}

export const DEFAULT_PROFILE_ID: ProfileId = 'anna';

export const DOCUMENT_TITLES: Record<DocumentType, string> = {
  passport: 'Паспорт',
  inn: 'ИНН',
  snils: 'СНИЛС',
  driver: 'Водительское удостоверение',
  foreign: 'Загранпаспорт',
};

export const OPTIONAL_DOCUMENT_TYPES = ['snils', 'driver', 'foreign'] as const;

export type OptionalDocumentType = (typeof OPTIONAL_DOCUMENT_TYPES)[number];

const PROFILE_IDS: ProfileId[] = ['anna', 'dmitry', 'maria'];

const DOCUMENT_TYPES: DocumentType[] = ['passport', 'inn', 'snils', 'driver', 'foreign'];

const EXTRA_DOCUMENT_VALUES: Record<ProfileId, Record<OptionalDocumentType, string>> = {
  anna: {
    snils: '152-394-281 64',
    driver: '77 24 193847',
    foreign: '70 1234567',
  },
  dmitry: {
    snils: '118-204-773 09',
    driver: '78 18 552190',
    foreign: '76 4451201',
  },
  maria: {
    snils: '203-881-440 22',
    driver: '16 21 009331',
    foreign: '72 9901244',
  },
};

function doc(type: DocumentType, value: string): ProfileDocument {
  return { type, title: DOCUMENT_TITLES[type], value };
}

export const PROFILES: Record<ProfileId, Profile> = {
  anna: {
    id: 'anna',
    firstName: 'Анна',
    lastName: 'Соколова',
    phone: '+7 916 123-45-67',
    email: 'anna.sokolova@example.ru',
    address: 'Москва, ул. Тверская, 12, кв. 45',
    work: 'ООО «Северные сети», аналитик',
    paymentRegion: 'Москва',
    gosuslugi: 'connected',
    cardLast4: '1234',
    cardPan: '2200123456781234',
    cardCvv: '847',
    cardExp: '12/28',
    cardNetwork: 'МИР',
    accountName: 'Текущий счёт',
    balance: 128450,
    documents: [doc('passport', '45 12 678901 · выдан 12.03.2016'), doc('inn', '770123456789')],
  },
  dmitry: {
    id: 'dmitry',
    firstName: 'Дмитрий',
    lastName: 'Орлов',
    phone: '+7 921 555-01-22',
    email: 'd.orlov@example.ru',
    address: 'Санкт-Петербург, Невский пр., 88, кв. 10',
    work: 'АО «Балтийский порт», инженер',
    paymentRegion: 'Санкт-Петербург',
    gosuslugi: 'connected',
    cardLast4: '8891',
    cardPan: '2200889123458891',
    cardCvv: '512',
    cardExp: '09/27',
    cardNetwork: 'МИР',
    accountName: 'Накопительный счёт',
    balance: 54320,
    documents: [doc('passport', '40 18 112233 · выдан 04.11.2018'), doc('inn', '780987654321')],
  },
  maria: {
    id: 'maria',
    firstName: 'Мария',
    lastName: 'Лебедева',
    phone: '+7 843 200-11-09',
    email: 'm.lebedeva@example.ru',
    address: 'Казань, ул. Баумана, 5, кв. 3',
    work: 'ИП Лебедева, дизайнер',
    paymentRegion: 'Казань',
    gosuslugi: 'not_connected',
    cardLast4: '4410',
    cardPan: '2200441098764410',
    cardCvv: '903',
    cardExp: '03/29',
    cardNetwork: 'МИР',
    accountName: 'Текущий счёт',
    balance: 9870,
    documents: [doc('passport', '92 20 445566 · выдан 21.06.2020'), doc('inn', '165012345678')],
  },
};

export function emptyOverlays(): ProfileOverlays {
  return {
    activeId: DEFAULT_PROFILE_ID,
    avatarById: {},
    extraDocsById: {},
    balanceById: {},
    cashOpsById: {},
    appliedPayments: {},
    appliedRefunds: {},
  };
}

export function isProfileId(value: string): value is ProfileId {
  return PROFILE_IDS.includes(value as ProfileId);
}

export function isDocumentType(value: string): value is DocumentType {
  return DOCUMENT_TYPES.includes(value as DocumentType);
}

export function fullName(profile: Pick<Profile, 'firstName' | 'lastName'>): string {
  return `${profile.firstName} ${profile.lastName}`;
}

export function formatCardPan(pan: string): string {
  const digits = pan.replace(/\D/g, '');
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function maskedCardSuffix(last4: string): string {
  return `•••• ${last4}`;
}

export function initials(profile: Pick<Profile, 'firstName' | 'lastName'>): string {
  return `${profile.firstName.slice(0, 1)}${profile.lastName.slice(0, 1)}`.toUpperCase();
}

export function gosuslugiLabel(status: GosuslugiStatus): string {
  return status === 'connected' ? 'Подключены' : 'Не подключены';
}

export function isOptionalDocument(type: DocumentType): type is OptionalDocumentType {
  return (OPTIONAL_DOCUMENT_TYPES as readonly DocumentType[]).includes(type);
}

export function extraDocument(profileId: ProfileId, type: OptionalDocumentType): ProfileDocument {
  return doc(type, EXTRA_DOCUMENT_VALUES[profileId][type]);
}

export function pickOverlays(overlays: ProfileOverlays): ProfileOverlays {
  return {
    activeId: overlays.activeId,
    avatarById: overlays.avatarById,
    extraDocsById: overlays.extraDocsById,
    balanceById: overlays.balanceById,
    cashOpsById: overlays.cashOpsById,
    appliedPayments: overlays.appliedPayments,
    appliedRefunds: overlays.appliedRefunds,
  };
}

export function resolvedBalance(overlays: ProfileOverlays, profileId = overlays.activeId): number {
  const id = isProfileId(profileId) ? profileId : DEFAULT_PROFILE_ID;
  const overlay = overlays.balanceById[id];
  return typeof overlay === 'number' ? overlay : PROFILES[id].balance;
}

export function listCashOps(overlays: ProfileOverlays, profileId = overlays.activeId): CashOp[] {
  return overlays.cashOpsById[profileId] ?? [];
}

export function findCashOp(overlays: ProfileOverlays, opId: string, profileId = overlays.activeId): CashOp | null {
  return listCashOps(overlays, profileId).find((item) => item.id === opId) ?? null;
}

export function applyCashOp(
  overlays: ProfileOverlays,
  input: { kind: CashKind; amount: number; qr: string; at?: number; id?: string },
  profileId = overlays.activeId,
): { overlays: ProfileOverlays; op: CashOp } {
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new Error(INVALID_AMOUNT);
  }
  const qr = input.qr.trim();
  if (!qr) {
    throw new Error(EMPTY_QR);
  }
  const current = resolvedBalance(overlays, profileId);
  const nextBalance = input.kind === 'withdraw' ? current - input.amount : current + input.amount;
  if (nextBalance < 0) {
    throw new Error(INSUFFICIENT_FUNDS);
  }
  const at = input.at ?? Date.now();
  const op: CashOp = {
    id: input.id ?? `cop_${at.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    kind: input.kind,
    amount: input.amount,
    qr,
    at,
  };
  const existing = listCashOps(overlays, profileId);
  return {
    overlays: {
      ...overlays,
      balanceById: { ...overlays.balanceById, [profileId]: nextBalance },
      cashOpsById: { ...overlays.cashOpsById, [profileId]: [op, ...existing] },
    },
    op,
  };
}

export function applySucceededPayment(
  overlays: ProfileOverlays,
  paymentId: string,
  amount: number,
  profileId = overlays.activeId,
): ProfileOverlays {
  if (overlays.appliedPayments[paymentId] || amount <= 0) {
    return overlays;
  }
  const next = Math.max(0, resolvedBalance(overlays, profileId) - amount);
  return {
    ...overlays,
    balanceById: { ...overlays.balanceById, [profileId]: next },
    appliedPayments: { ...overlays.appliedPayments, [paymentId]: true },
  };
}

export function applyCompletedRefund(
  overlays: ProfileOverlays,
  refundId: string,
  amount: number,
  profileId = overlays.activeId,
): ProfileOverlays {
  if (overlays.appliedRefunds[refundId] || amount <= 0) {
    return overlays;
  }
  const next = resolvedBalance(overlays, profileId) + amount;
  return {
    ...overlays,
    balanceById: { ...overlays.balanceById, [profileId]: next },
    appliedRefunds: { ...overlays.appliedRefunds, [refundId]: true },
  };
}

export function existingDocumentTypes(overlays: ProfileOverlays, profileId = overlays.activeId): DocumentType[] {
  const seed = PROFILES[profileId].documents.map((item) => item.type);
  const extra = overlays.extraDocsById[profileId] ?? [];
  return [...seed, ...extra];
}

export function addableDocumentTypes(existing: DocumentType[]): OptionalDocumentType[] {
  return OPTIONAL_DOCUMENT_TYPES.filter((type) => !existing.includes(type));
}

export function switchActive(overlays: ProfileOverlays, id: ProfileId): ProfileOverlays {
  if (id === overlays.activeId) return overlays;
  return { ...overlays, activeId: id };
}

export function setAvatarUri(overlays: ProfileOverlays, uri: string, profileId = overlays.activeId): ProfileOverlays {
  return {
    ...overlays,
    avatarById: { ...overlays.avatarById, [profileId]: uri },
  };
}

export function addExtraDocument(overlays: ProfileOverlays, type: DocumentType, profileId = overlays.activeId): ProfileOverlays {
  if (existingDocumentTypes(overlays, profileId).includes(type)) {
    throw new Error('DOCUMENT_ALREADY_ADDED');
  }
  if (!isOptionalDocument(type)) {
    throw new Error('DOCUMENT_NOT_OPTIONAL');
  }
  const current = overlays.extraDocsById[profileId] ?? [];
  return {
    ...overlays,
    extraDocsById: {
      ...overlays.extraDocsById,
      [profileId]: [...current, type],
    },
  };
}

export function resolveDocuments(overlays: ProfileOverlays, profileId = overlays.activeId): ProfileDocument[] {
  const base = PROFILES[profileId];
  const extras = (overlays.extraDocsById[profileId] ?? []).flatMap((type) => {
    if (base.documents.some((item) => item.type === type)) return [];
    if (!isOptionalDocument(type)) return [];
    return [extraDocument(profileId, type)];
  });
  return [...base.documents, ...extras];
}

export function resolveProfile(overlays: ProfileOverlays): ResolvedProfile {
  const id = isProfileId(overlays.activeId) ? overlays.activeId : DEFAULT_PROFILE_ID;
  const base = PROFILES[id];
  return {
    ...base,
    balance: resolvedBalance(overlays, id),
    avatarUri: overlays.avatarById[id] ?? null,
    documents: resolveDocuments({ ...overlays, activeId: id }, id),
  };
}

export function listProfiles(): Profile[] {
  return PROFILE_IDS.map((id) => PROFILES[id]);
}

const FIELD_TITLES: Record<ProfileFieldId, string> = {
  phone: 'Телефон',
  email: 'Почта',
  address: 'Адреса',
  work: 'Работа',
  region: 'Регион платежей',
  gosuslugi: 'Госуслуги',
};

export function profileFields(profile: Profile): ProfileItem[] {
  return [
    { id: 'phone', title: FIELD_TITLES.phone, value: profile.phone },
    { id: 'email', title: FIELD_TITLES.email, value: profile.email },
    { id: 'address', title: FIELD_TITLES.address, value: profile.address, caption: 'Адрес регистрации' },
    { id: 'work', title: FIELD_TITLES.work, value: profile.work },
    { id: 'region', title: FIELD_TITLES.region, value: profile.paymentRegion },
    {
      id: 'gosuslugi',
      title: FIELD_TITLES.gosuslugi,
      value: gosuslugiLabel(profile.gosuslugi),
      caption: profile.gosuslugi === 'connected' ? 'Данные подтверждены через Госуслуги' : 'Подключение недоступно в демо',
    },
  ];
}

export function resolveProfileItem(profile: ResolvedProfile, id: string): ProfileItem | null {
  const field = profileFields(profile).find((item) => item.id === id);
  if (field) return field;
  const document = profile.documents.find((item) => item.type === id);
  if (document) {
    return { id: document.type, title: document.title, value: document.value, caption: 'Демонстрационные данные' };
  }
  return null;
}

function isCashKind(value: string): value is CashKind {
  return value === 'withdraw' || value === 'topup';
}

function parseCashOp(raw: unknown): CashOp | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<CashOp>;
  if (typeof data.id !== 'string' || data.id.length === 0) return null;
  if (typeof data.kind !== 'string' || !isCashKind(data.kind)) return null;
  if (typeof data.amount !== 'number' || !Number.isInteger(data.amount) || data.amount <= 0) return null;
  if (typeof data.qr !== 'string' || data.qr.length === 0) return null;
  if (typeof data.at !== 'number' || !Number.isFinite(data.at)) return null;
  return { id: data.id, kind: data.kind, amount: data.amount, qr: data.qr, at: data.at };
}

export function parseOverlays(raw: unknown): ProfileOverlays {
  const fallback = emptyOverlays();
  if (!raw || typeof raw !== 'object') return fallback;
  const data = raw as Partial<ProfileOverlays>;
  const activeId = typeof data.activeId === 'string' && isProfileId(data.activeId) ? data.activeId : fallback.activeId;

  const avatarById: ProfileOverlays['avatarById'] = {};
  if (data.avatarById && typeof data.avatarById === 'object') {
    for (const id of PROFILE_IDS) {
      const uri = data.avatarById[id];
      if (typeof uri === 'string' && uri.length > 0) avatarById[id] = uri;
    }
  }

  const extraDocsById: ProfileOverlays['extraDocsById'] = {};
  if (data.extraDocsById && typeof data.extraDocsById === 'object') {
    for (const id of PROFILE_IDS) {
      const list = data.extraDocsById[id];
      if (!Array.isArray(list)) continue;
      const types = list.filter(
        (type): type is DocumentType =>
          typeof type === 'string' && isDocumentType(type) && isOptionalDocument(type),
      );
      if (types.length > 0) extraDocsById[id] = [...new Set(types)];
    }
  }

  const balanceById: ProfileOverlays['balanceById'] = {};
  if (data.balanceById && typeof data.balanceById === 'object') {
    for (const id of PROFILE_IDS) {
      const value = data.balanceById[id];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
        balanceById[id] = Math.floor(value);
      }
    }
  }

  const cashOpsById: ProfileOverlays['cashOpsById'] = {};
  if (data.cashOpsById && typeof data.cashOpsById === 'object') {
    for (const id of PROFILE_IDS) {
      const list = data.cashOpsById[id];
      if (!Array.isArray(list)) continue;
      const ops = list.map(parseCashOp).filter((item): item is CashOp => item !== null);
      if (ops.length > 0) cashOpsById[id] = ops;
    }
  }

  const appliedPayments: ProfileOverlays['appliedPayments'] = {};
  if (data.appliedPayments && typeof data.appliedPayments === 'object') {
    for (const [key, value] of Object.entries(data.appliedPayments)) {
      if (value) appliedPayments[key] = true;
    }
  }

  const appliedRefunds: ProfileOverlays['appliedRefunds'] = {};
  if (data.appliedRefunds && typeof data.appliedRefunds === 'object') {
    for (const [key, value] of Object.entries(data.appliedRefunds)) {
      if (value) appliedRefunds[key] = true;
    }
  }

  return {
    activeId,
    avatarById,
    extraDocsById,
    balanceById,
    cashOpsById,
    appliedPayments,
    appliedRefunds,
  };
}
