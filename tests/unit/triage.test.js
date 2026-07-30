import { describe, it, expect, beforeEach } from 'vitest';

let triage, triageWithLLM;

const SIKOKU = {
  latMin: 32.5, latMax: 34.5,
  lonMin: 132.0, lonMax: 135.0
};

beforeEach(async () => {
  try {
    const mod = await import('../../src/logic/triage.js');
    triage = mod.triage;
    triageWithLLM = mod.triageWithLLM;
  } catch {
    throw new Error('triage.js 未実装 → 先に src/logic/triage.js を作成してください');
  }
});

function mockReport(overrides = {}) {
  return {
    type: overrides.type ?? 'general',
    detail: overrides.detail ?? '道路が陥没しています。車が通れません。',
    lat: overrides.lat ?? 33.5,
    lon: overrides.lon ?? 133.5,
    hasPhoto: overrides.hasPhoto ?? false,
    nearbyReports: overrides.nearbyReports ?? 0,
    ...overrides
  };
}

// ──────────────────────────────────────────────
// TRI-01〜08: AI・ルールベーストリアージ
// ──────────────────────────────────────────────

describe('TRI-01: 位置範囲チェック - 範囲外', () => {
  it('東京都（範囲外）は即座に reject', () => {
    const report = mockReport({ lat: 35.6, lon: 139.7 });
    const result = triage(report, SIKOKU);
    expect(result.status).toBe('reject');
    expect(result.reason).toMatch(/範囲外|地域外|対象地域外/i);
  });
});

describe('TRI-02: 位置範囲チェック - 範囲内', () => {
  it('高知県室戸市（範囲内）は次判定へ通過', () => {
    const report = mockReport({ lat: 33.2, lon: 134.1 });
    const result = triage(report, SIKOKU);
    expect(result.status).not.toBe('reject');
  });
});

describe('TRI-03: NGワードフィルター', () => {
  it('スパムキーワードを含む投稿は reject', () => {
    const report = mockReport({ detail: '今だけ限定！www.bad-site.com' });
    const result = triage(report, SIKOKU);
    expect(result.status).toBe('reject');
    expect(result.reason).toMatch(/NG|スパム|spam|不適切/i);
  });
});

describe('TRI-04: テキスト長チェック', () => {
  it('7文字以下の短文は hold（情報不足）', () => {
    const report = mockReport({ detail: '火事だ' });
    const result = triage(report, SIKOKU);
    expect(result.status).toBe('hold');
  });
});

describe('TRI-05: 加点スコア計算', () => {
  it('写真あり + 20文字以上 + 近隣報告ありで score 2以上', () => {
    const report = mockReport({
      detail: '橋が崩落しています。迂回路はありません。至急対応願います。',
      hasPhoto: true,
      nearbyReports: 3
    });
    const result = triage(report, SIKOKU);
    expect(result.score).toBeGreaterThanOrEqual(2);
  });
});

describe('TRI-06: LLMタイムアウト', () => {
  it('LLMがタイムアウトしても hold で復帰（システム停止しない）', async () => {
    // スコア>=2 になる条件（写真+長文+近隣報告）でLLMがタイムアウト→holdに落ちる
    const llmFn = () => new Promise((_, reject) => setTimeout(reject, 100));
    const report = mockReport({
      detail: '橋が崩落しています。迂回路はありません。至急対応願います。',
      hasPhoto: true,
      nearbyReports: 3
    });
    const result = await triageWithLLM(report, SIKOKU, { llmFn, llmTimeout: 50 });
    expect(result.status).toBe('hold');
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.reason).toMatch(/LLM/i);
  });
});

describe('TRI-07: LLM障害', () => {
  it('Workers AIが500エラーを返しても hold（投稿は消えない）', async () => {
    // スコア>=2 でも LLM 500エラーなら hold
    const llmFn = async () => { throw new Error('LLM 500 error'); };
    const report = mockReport({
      detail: 'がけ崩れで道路が完全に塞がっています。集落が孤立。',
      hasPhoto: true,
      nearbyReports: 2
    });
    const result = await triageWithLLM(report, SIKOKU, { llmFn, llmTimeout: 1000 });
    expect(result.status).toBe('hold');
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.reason).toMatch(/LLM/i);
  });
});

describe('TRI-08: 救助トリアージ', () => {
  it('type=rescue はスコアに関係なく emergency_flag=true', () => {
    const report = mockReport({
      type: 'rescue',
      detail: '祖母が取り残されています',
      hasPhoto: false,
      nearbyReports: 0
    });
    const result = triage(report, SIKOKU);
    expect(result.emergency).toBe(true);
    expect(result.status).toBe('approve');
  });
});
