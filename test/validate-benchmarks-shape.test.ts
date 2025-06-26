/**
 * @jest-environment jsdom
 */

import fetch from 'cross-fetch';
(global as any).fetch = fetch;

const DEFAULT_URL = 'https://roll20.github.io/detect-gpu';
const BENCHMARKS_URL = process.env.BENCHMARKS_URL ?? DEFAULT_URL;
const TEST_FILE = 'd-apple.json';

interface ScreenEntry extends Array<number> {
  0: number;
  1: number;
  2: number;
}

describe('Live benchmark data shape', () => {
  let data: unknown;

  beforeAll(async () => {
    const response = await fetch(`${BENCHMARKS_URL}/${TEST_FILE}`);
    expect(response.ok).toBe(true);
    data = await response.json();
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

      for (const screen of screens as ScreenEntry[]) {
        expect(Array.isArray(screen)).toBe(true);
        expect(screen.length).toBe(3);
        expect(typeof screen[0]).toBe('number');
        expect(typeof screen[1]).toBe('number');
        expect(typeof screen[2]).toBe('number');
      }
    }
  });
});
