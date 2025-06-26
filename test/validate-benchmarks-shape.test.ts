/**
 * @jest-environment node
 *
 */

import fetch from 'cross-fetch';
(global as any).fetch = fetch;
import fs from 'fs/promises';

const BENCHMARKS_URL = process.env.BENCHMARKS_URL || 'https://roll20.github.io/detect-gpu';
const TEST_FILE = 'd-apple.json';

interface ScreenEntry extends Array<number> {
  0: number;
  1: number;
  2: number;
}

describe('Live benchmark data shape', () => {
  let data: unknown;

  beforeAll(async () => {
    const base = BENCHMARKS_URL.replace(/\/$/, '');
    if (base.startsWith('file://')) {
      const dirPath = base.replace(/^file:\/\//, '');
      const raw = await fs.readFile(`${dirPath}/${TEST_FILE}`, 'utf8');
      data = JSON.parse(raw);
    } else {
      const res = await fetch(`${base}/${TEST_FILE}`);
      expect(res.ok).toBe(true);
      data = await res.json();
    }
  });

  it('is an array with a version string at index 0', () => {
    expect(Array.isArray(data)).toBe(true);
    expect(typeof (data as any)[0]).toBe('string');
  });

  it('each entry has the correct tuple shape', () => {
    const entries = (data as any).slice(1);
    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      expect(Array.isArray(entry)).toBe(true);
      expect([4, 5]).toContain(entry.length);

      const screens = entry[entry.length - 1];
      expect(Array.isArray(screens)).toBe(true);
      expect(screens.length).toBeGreaterThan(0);

      for (const screen of screens) {
        expect(Array.isArray(screen)).toBe(true);
        expect((screen as ScreenEntry).length).toBe(3);

        const [w, h, fps] = screen as ScreenEntry;
        expect(typeof w).toBe('number');
        expect(typeof h).toBe('number');
        expect(typeof fps).toBe('number');
      }
    }
  });
});
