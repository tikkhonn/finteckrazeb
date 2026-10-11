import { createFlipDetector, FLIP_COOLDOWN_MS, FLIP_WINDOW_MS } from '@/domain/flipHide';

describe('createFlipDetector', () => {
  it('срабатывает на быстрый экран вниз и обратно', () => {
    const detector = createFlipDetector();
    expect(detector.push(1, 0)).toBe(false);
    expect(detector.push(8, 200)).toBe(false);
    expect(detector.push(1, 900)).toBe(true);
  });

  it('не срабатывает, если телефон полежал экраном вниз дольше окна', () => {
    const detector = createFlipDetector();
    detector.push(1, 0);
    detector.push(8, 100);
    expect(detector.push(1, 100 + FLIP_WINDOW_MS + 50)).toBe(false);
  });

  it('игнорирует повтор в cooldowne', () => {
    const detector = createFlipDetector();
    detector.push(1, 0);
    detector.push(8, 100);
    expect(detector.push(1, 800)).toBe(true);
    detector.push(8, 900);
    expect(detector.push(1, 800 + FLIP_COOLDOWN_MS - 50)).toBe(false);
  });

  it('после паузы снова ловит жест', () => {
    const detector = createFlipDetector();
    detector.push(1, 0);
    detector.push(8, 100);
    expect(detector.push(1, 800)).toBe(true);
    const later = 800 + FLIP_COOLDOWN_MS + 10;
    detector.push(8, later);
    expect(detector.push(1, later + 400)).toBe(true);
  });
});
