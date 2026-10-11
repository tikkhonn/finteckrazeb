import { parsePreference, resolveScheme } from '@/domain/theme';

describe('parsePreference', () => {
  it('по умолчанию следует системе', () => {
    expect(parsePreference(null)).toBe('system');
    expect(parsePreference(undefined)).toBe('system');
    expect(parsePreference('auto')).toBe('system');
  });

  it('принимает сохранённые значения', () => {
    expect(parsePreference('light')).toBe('light');
    expect(parsePreference('dark')).toBe('dark');
    expect(parsePreference('system')).toBe('system');
  });
});

describe('resolveScheme', () => {
  it('светлая и тёмная не зависят от системы', () => {
    expect(resolveScheme('light', 'dark')).toBe('light');
    expect(resolveScheme('dark', 'light')).toBe('dark');
  });

  it('режим «как в системе» берёт Appearance', () => {
    expect(resolveScheme('system', 'dark')).toBe('dark');
    expect(resolveScheme('system', 'light')).toBe('light');
    expect(resolveScheme('system', null)).toBe('light');
  });
});
