import { describe, expect, it } from 'vitest';
import { SlidingWindowLimiter } from '@/lib/rate-limit';

describe('SlidingWindowLimiter', () => {
  it('bloqueia após o limite e libera quando a janela passa', () => {
    const l = new SlidingWindowLimiter(2, 1000);
    expect(l.check('ip', 0).allowed).toBe(true);
    expect(l.check('ip', 10).allowed).toBe(true);
    const blocked = l.check('ip', 20);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(980);
    expect(l.check('outro', 20).allowed).toBe(true);
    expect(l.check('ip', 1001).allowed).toBe(true);
  });
});
