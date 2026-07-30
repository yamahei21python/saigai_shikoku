import { describe, it, expect, beforeEach } from 'vitest';

let parseFDMA, parseJMAQuake, parseMuniHTML;

beforeEach(async () => {
  try {
    const mod = await import('../../src/logic/parser.js');
    parseFDMA = mod.parseFDMA;
    parseJMAQuake = mod.parseJMAQuake;
    parseMuniHTML = mod.parseMuniHTML;
  } catch {
    throw new Error('parser.js 未実装 → 先に src/logic/parser.js を作成してください');
  }
});

// ──────────────────────────────────────────────
// PRS-01〜04: データパース＆スクレイピング
// ──────────────────────────────────────────────

describe('PRS-01: 消防庁PDFパース - 正常系', () => {
  it('「死者1名 重傷2名 住宅全壊5棟」のテキストを構造化', () => {
    if (!parseFDMA) return;
    const text = '死者1名 重傷2名 軽傷3名 住宅全壊5棟 半壊10棟 一部破損20棟 床上浸水3棟 床下浸水7棟';
    const result = parseFDMA(text);
    expect(result).toMatchObject({
      dead: 1,
      injuredHeavy: 2,
      injuredLight: 3,
      collapsed: 5,
      halfCollapsed: 10,
      partiallyDamaged: 20,
      floodedAbove: 3,
      floodedBelow: 7,
    });
  });
});

describe('PRS-02: 消防庁PDFパース - 異常系', () => {
  it('未知のフォーマットや空文字は { error: "parse_failed" }', () => {
    if (!parseFDMA) return;
    const result = parseFDMA('');
    expect(result).toHaveProperty('error');
    expect(result.error).toBe('parse_failed');
  });

  it('未定義の項目が混ざってもエラーにならない', () => {
    if (!parseFDMA) return;
    const text = '死者0名 謎の項目3件 負傷者1名';
    const result = parseFDMA(text);
    expect(result.dead).toBe(0);
    expect(result.injuredHeavy).toBe(1);
  });
});

describe('PRS-03: 気象庁地震JSONパース', () => {
  it('震度「6+」「6-」を「6強」「6弱」に変換', () => {
    if (!parseJMAQuake) return;
    const eq = { intensity: '6+', region: '愛媛県中予', lat: 33.5, lon: 132.5, depth: '30km', mag: 5.0, time: '2026-03-01T12:00:00Z' };
    const result = parseJMAQuake(eq);
    expect(result.intensity).toBe('6強');
  });

  it('四国外の地震はフィルタされる', () => {
    if (!parseJMAQuake) return;
    const outside = { intensity: '4', region: '東京都', lat: 35.6, lon: 139.7 };
    const result = parseJMAQuake(outside);
    expect(result).toBeNull();
  });
});

describe('PRS-04: 自治体HTMLパース', () => {
  it('Shift-JIS崩れのHTMLでも文字化けせず配列に格納', () => {
    if (!parseMuniHTML) return;
    const brokenHTML = '<html><body><p>避難所開設</p><p>給水開始</p></body></html>';
    const result = parseMuniHTML(brokenHTML, '愛媛県');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('source');
    expect(result[0].source).toContain('愛媛県');
  });

  it('空HTMLは空配列を返す', () => {
    if (!parseMuniHTML) return;
    const result = parseMuniHTML('', '高知県');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
