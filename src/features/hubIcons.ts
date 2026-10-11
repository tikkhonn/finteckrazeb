import type { SFSymbol } from 'sf-symbols-typescript';

export type HubGlyph = {
  symbol: SFSymbol;
  glyph: string;
  tint: string;
};

export const HUB_GLYPHS = {
  cards: { symbol: 'creditcard.fill', glyph: '▣', tint: '#0033A0' },
  limits: { symbol: 'chart.bar.fill', glyph: '▁', tint: '#6E56CF' },
  certs: { symbol: 'doc.text.fill', glyph: '☰', tint: '#0F8A4B' },
  support: { symbol: 'bubble.left.and.bubble.right.fill', glyph: '◉', tint: '#009FDF' },
  settings: { symbol: 'gearshape.fill', glyph: '⚙', tint: '#6B7789' },
  about: { symbol: 'info.circle.fill', glyph: 'i', tint: '#3D7EFF' },
  faceId: { symbol: 'faceid', glyph: '◯', tint: '#0033A0' },
  hide: { symbol: 'eye.slash.fill', glyph: '⊘', tint: '#5C6B80' },
  pin: { symbol: 'lock.fill', glyph: '●', tint: '#1A5BBF' },
  ops: { symbol: 'bell.badge.fill', glyph: '⚑', tint: '#B86E00' },
  scan: { symbol: 'barcode.viewfinder', glyph: '⊞', tint: '#0033A0' },
  offer: { symbol: 'creditcard.fill', glyph: '★', tint: '#009FDF' },
  cash: { symbol: 'banknote.fill', glyph: '₽', tint: '#6E56CF' },
} as const satisfies Record<string, HubGlyph>;

export const FAQ_GLYPHS: Record<string, HubGlyph> = {
  scan: { symbol: 'barcode.viewfinder', glyph: '⊞', tint: '#0033A0' },
  pay: { symbol: 'creditcard.fill', glyph: '▣', tint: '#1A5BBF' },
  receipt: { symbol: 'doc.plaintext.fill', glyph: '☰', tint: '#0F8A4B' },
  card: { symbol: 'heart.fill', glyph: '♡', tint: '#E45D73' },
  cash: { symbol: 'banknote.fill', glyph: '₽', tint: '#6E56CF' },
  docs: { symbol: 'person.text.rectangle.fill', glyph: '▤', tint: '#5C6B80' },
  take: { symbol: 'bag.fill', glyph: '◻', tint: '#009FDF' },
  all: { symbol: 'ellipsis.circle.fill', glyph: '…', tint: '#6B7789' },
};
