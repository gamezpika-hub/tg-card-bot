// ─────────────────────────────────────────────────────────────────────────────
// 台灣信用卡核心資料庫
// ─────────────────────────────────────────────────────────────────────────────

// ── 台灣國定假日（2025-2026）────────────────────────────────────────────────
export const TW_HOLIDAYS = new Set([
  '2025-01-01','2025-01-27','2025-01-28','2025-01-29','2025-01-30',
  '2025-01-31','2025-02-28','2025-04-04','2025-04-05','2025-05-01',
  '2025-05-31','2025-10-06','2025-10-10',
  '2026-01-01','2026-01-28','2026-01-29','2026-01-30','2026-01-31',
  '2026-02-02','2026-02-28','2026-04-04','2026-04-05','2026-05-01',
  '2026-06-19','2026-09-24','2026-10-09','2026-10-10',
])

export function getDayType(dateStr) {
  if (!dateStr) return null
  if (TW_HOLIDAYS.has(dateStr)) return 'holiday'
  const day = new Date(dateStr).getDay()
  return day === 0 || day === 6 ? 'weekend' : 'weekday'
}

export const DAY_TYPE_META = {
  weekday: { label: '平日', color: 'bg-slate-100 text-slate-600', icon: '📅' },
  weekend: { label: '週六日', color: 'bg-blue-100 text-blue-600', icon: '🎉' },
  holiday: { label: '國定假日', color: 'bg-red-100 text-red-600', icon: '🎊' },
}

// ── 商家選項 ──────────────────────────────────────────────────────────────────
export const MERCHANTS = [
  { value: 'pxmart',     label: '全聯',     icon: '🛒' },
  { value: '7eleven',    label: '7-11',     icon: '🏪' },
  { value: 'familymart', label: '全家',     icon: '🏪' },
  { value: 'shin_kong',  label: '新光三越', icon: '🏬' },
  { value: 'shopee',     label: '蝦皮購物', icon: '🛍️' },
  { value: 'momo',       label: 'momo購物', icon: '📦' },
  { value: 'uber_eats',  label: 'Uber Eats',icon: '🍔' },
]

// ── 支付方式 ──────────────────────────────────────────────────────────────────
export const PAYMENTS = [
  { value: 'physical',  label: '實體刷卡',  icon: '💳' },
  { value: 'linepay',   label: 'LINE Pay',  icon: '💚' },
  { value: 'jkopay',    label: '街口支付',  icon: '🟠' },
  { value: 'applepay',  label: 'Apple Pay', icon: '🍎' },
  { value: 'pxpay',     label: 'PX Pay',    icon: '🟣' },
  { value: 'googlepay', label: 'Google Pay',icon: '🔵' },
]

// ── 規則輔助：條件比對 ────────────────────────────────────────────────────────
function hit(condition, value) {
  return condition === '*' || condition.includes(value)
}

// ─────────────────────────────────────────────────────────────────────────────
// 信用卡資料庫
// 每張卡的 rules 陣列由上至下優先媒合，取最高 rate 的規則作為結果
// rateFromSettings / noteFromSettings / warningFromSettings 依用戶設定動態計算
// ─────────────────────────────────────────────────────────────────────────────
export const CARDS = [

  // ──────────────────────────────────────────────────────────────────────────
  // 永豐大戶卡
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'sinopac_dahu',
    name: '永豐大戶卡',
    bank: '永豐銀行',
    icon: '🟤',
    cardStyle: 'border-amber-300 bg-amber-50',
    badgeStyle: 'bg-amber-100 text-amber-700',
    defaultOwned: true,
    settings: [
      {
        key: 'is_dahu',
        label: '大戶等級',
        hint: '帳戶月均餘額 ≥ 50萬即可達標',
        type: 'toggle',
        default: false,
      },
    ],
    rules: [
      {
        merchants: ['pxmart', '7eleven', 'familymart'],
        payments: '*',
        dayTypes: '*',
        rate: null,
        rateFromSettings: (s) => s.is_dahu ? 7.0 : 1.0,
        rateType: 'cashback',
        noteFromSettings: (s) => s.is_dahu ? '大戶等級指定通路 7% 現金回饋' : '大大等級一般消費 1% 回饋',
        warningFromSettings: (s) => s.is_dahu ? null : '達成大戶等級才享有 7% 通路加碼',
      },
      {
        merchants: '*',
        payments: '*',
        dayTypes: '*',
        rate: null,
        rateFromSettings: (s) => s.is_dahu ? 2.0 : 1.0,
        rateType: 'cashback',
        noteFromSettings: (s) => s.is_dahu
          ? '大戶等級一般消費 2% 現金回饋'
          : '一般消費 1% 現金回饋',
        warning: null,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 永豐幣倍卡
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'sinopac_cobo',
    name: '永豐幣倍卡',
    bank: '永豐銀行',
    icon: '🔷',
    cardStyle: 'border-sky-300 bg-sky-50',
    badgeStyle: 'bg-sky-100 text-sky-700',
    defaultOwned: true,
    settings: [
      {
        key: 'cobo_level',
        label: '幣倍等級',
        hint: '依外幣消費/存款達標升等',
        type: 'select',
        options: [
          { value: 'basic',    label: '一般（行動支付 2%）' },
          { value: 'donghuei', label: '懂匯（行動支付 4%）' },
          { value: 'super',    label: '超匯（行動支付 7%）' },
        ],
        default: 'basic',
      },
    ],
    rules: [
      {
        merchants: '*',
        payments: ['linepay', 'jkopay', 'applepay', 'googlepay', 'pxpay'],
        dayTypes: '*',
        rate: null,
        rateFromSettings: (s) => ({ basic: 2.0, donghuei: 4.0, super: 7.0 }[s.cobo_level] ?? 2.0),
        rateType: 'points',
        noteFromSettings: (s) => {
          const map = { basic: '一般 2%', donghuei: '懂匯 4%', super: '超匯 7%' }
          return `行動支付幣倍回饋 ${map[s.cobo_level]}`
        },
        warningFromSettings: (s) => s.cobo_level === 'basic'
          ? '升等懂匯/超匯最高可享 7% 回饋'
          : null,
      },
      {
        merchants: '*',
        payments: '*',
        dayTypes: '*',
        rate: 1.0,
        rateType: 'points',
        note: '一般消費 1% 幣倍點',
        warning: null,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 玉山 Unicard
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'esun_unicard',
    name: '玉山 Unicard',
    bank: '玉山銀行',
    icon: '🦄',
    cardStyle: 'border-violet-300 bg-violet-50',
    badgeStyle: 'bg-violet-100 text-violet-700',
    defaultOwned: true,
    settings: [
      {
        key: 'plan',
        label: '目前方案',
        hint: '每月可切換一次',
        type: 'select',
        options: [
          { value: 'simple', label: '簡單選（固定3通路 3%）' },
          { value: 'free',   label: '任意選（自選3通路 3%）' },
          { value: 'up',     label: 'UP選（百大特店最高 5%）' },
        ],
        default: 'simple',
      },
    ],
    rules: [
      // 百貨 / 網購大平台 → UP選 5%，其餘方案 3%
      {
        merchants: ['shin_kong', 'shopee', 'momo'],
        payments: '*',
        dayTypes: '*',
        rate: null,
        rateFromSettings: (s) => s.plan === 'up' ? 4.5 : (s.plan === 'free' ? 3.5 : 3.0),
        rateType: 'points',
        noteFromSettings: (s) => s.plan === 'up'
          ? 'UP選百大特店 4.5% 回饋'
          : (s.plan === 'free' ? '任意選 3.5% 回饋' : '簡單選 3% 回饋'),
        warningFromSettings: (s) => s.plan === 'up'
          ? '請確認已切換至 UP選方案'
          : s.plan === 'free'
          ? '請確認已將此通路加入任意選'
          : null,
      },
      // 超商/超市 → 簡單選/任意選 3%
      {
        merchants: ['pxmart', '7eleven', 'familymart'],
        payments: '*',
        dayTypes: '*',
        rate: null,
        rateFromSettings: (s) => s.plan === 'up' ? 4.5 : (s.plan === 'free' ? 3.5 : 3.0),
        rateType: 'points',
        noteFromSettings: (s) => s.plan === 'up'
          ? 'UP選指定通路 4.5%'
          : (s.plan === 'free' ? '任意選指定通路 3.5%' : '簡單選指定通路 3%'),
        warningFromSettings: (s) => s.plan === 'free'
          ? '請確認已在任意選中設定此商家'
          : null,
      },
      // 一般
      {
        merchants: '*',
        payments: '*',
        dayTypes: '*',
        rate: 1.0,
        rateType: 'points',
        note: '一般消費 1% 回饋',
        warning: null,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 國泰 CUBE 卡（預留擴充）
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'cathay_cube',
    name: '國泰 CUBE 卡',
    bank: '國泰世華',
    icon: '🔴',
    cardStyle: 'border-red-300 bg-red-50',
    badgeStyle: 'bg-red-100 text-red-700',
    defaultOwned: false,
    settings: [],
    rules: [
      {
        merchants: ['shopee', 'momo'],
        payments: ['physical', 'applepay'],
        dayTypes: '*',
        rate: 3.0,
        rateType: 'cashback',
        note: '網購實體/Apple Pay 3% 現金回饋',
        warning: null,
      },
      {
        merchants: ['shin_kong'],
        payments: '*',
        dayTypes: '*',
        rate: 2.0,
        rateType: 'cashback',
        note: '百貨公司 2% 現金回饋',
        warning: null,
      },
      {
        merchants: ['pxmart', '7eleven', 'familymart'],
        payments: '*',
        dayTypes: '*',
        rate: 3.0,
        rateType: 'cashback',
        note: '指定超市/超商 3% 現金回饋',
        warning: null,
      },
      {
        merchants: '*',
        payments: '*',
        dayTypes: '*',
        rate: 1.0,
        rateType: 'cashback',
        note: '一般消費 1% 現金回饋',
        warning: null,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 中信 LINE Pay 卡（預留擴充）
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'ctbc_linepay',
    name: '中信 LINE Pay 卡',
    bank: '中國信託',
    icon: '🟢',
    cardStyle: 'border-green-300 bg-green-50',
    badgeStyle: 'bg-green-100 text-green-700',
    defaultOwned: false,
    settings: [],
    rules: [
      {
        merchants: '*',
        payments: ['linepay'],
        dayTypes: '*',
        rate: 3.0,
        rateType: 'points',
        note: 'LINE Pay 消費 3% LINE POINTS',
        warning: null,
      },
      {
        merchants: ['7eleven', 'familymart', 'pxmart'],
        payments: '*',
        dayTypes: '*',
        rate: 2.0,
        rateType: 'points',
        note: '指定超商/超市 2% LINE POINTS',
        warning: null,
      },
      {
        merchants: '*',
        payments: '*',
        dayTypes: '*',
        rate: 1.0,
        rateType: 'points',
        note: '一般消費 1% LINE POINTS',
        warning: null,
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 台新玫瑰 Giving 卡（預留擴充）
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'taishin_giving',
    name: '台新玫瑰 Giving 卡',
    bank: '台新銀行',
    icon: '🌹',
    cardStyle: 'border-pink-300 bg-pink-50',
    badgeStyle: 'bg-pink-100 text-pink-700',
    defaultOwned: false,
    settings: [],
    rules: [
      {
        merchants: ['shin_kong'],
        payments: ['applepay'],
        dayTypes: ['weekend', 'holiday'],
        rate: 5.0,
        rateType: 'points',
        note: '新光三越週末 Apple Pay 5% 加碼',
        warning: null,
      },
      {
        merchants: ['pxmart'],
        payments: ['pxpay'],
        dayTypes: ['weekend', 'holiday'],
        rate: 3.0,
        rateType: 'points',
        note: '全聯 PX Pay 週末/假日 3% P幣',
        warning: null,
      },
      {
        merchants: '*',
        payments: ['physical', 'applepay'],
        dayTypes: ['holiday'],
        rate: 3.0,
        rateType: 'cashback',
        note: '國定假日實體/Apple Pay 3% 現金回饋',
        warning: null,
      },
      {
        merchants: '*',
        payments: '*',
        dayTypes: '*',
        rate: 0.5,
        rateType: 'cashback',
        note: '一般消費 0.5% 現金回饋',
        warning: null,
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// 核心引擎：給定情境 + 用戶設定，計算一張卡的最佳規則
// ─────────────────────────────────────────────────────────────────────────────
export function computeBestRule(card, merchant, payment, dayType, userCardSettings) {
  const s = userCardSettings ?? {}
  let best = null
  let bestRate = -1

  for (const rule of card.rules) {
    if (!hit(rule.merchants, merchant)) continue
    if (!hit(rule.payments, payment)) continue
    if (!hit(rule.dayTypes, dayType)) continue

    const rate = rule.rate !== null ? rule.rate : (rule.rateFromSettings?.(s) ?? 0)
    if (rate <= bestRate) continue

    bestRate = rate
    best = {
      card: card.name,
      bank: card.bank,
      cardId: card.id,
      cardStyle: card.cardStyle,
      badgeStyle: card.badgeStyle,
      icon: card.icon,
      rate,
      rateType: rule.rateType,
      note: rule.note ?? rule.noteFromSettings?.(s) ?? '',
      warning: rule.warning ?? rule.warningFromSettings?.(s) ?? null,
    }
  }

  return best
}

// ─────────────────────────────────────────────────────────────────────────────
// 建立預設 cardSettings（從各卡 settings 定義中取 default 值）
// ─────────────────────────────────────────────────────────────────────────────
export function buildDefaultSettings() {
  const out = {}
  for (const card of CARDS) {
    out[card.id] = {}
    for (const s of card.settings) {
      out[card.id][s.key] = s.default
    }
  }
  return out
}

export function buildDefaultOwnedIds() {
  return CARDS.filter((c) => c.defaultOwned).map((c) => c.id)
}
