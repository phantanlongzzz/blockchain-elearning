/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MinerColorToken {
  name: string;
  primary: string;
  border: string;
  text: string;
  bg: string;
  badge: string;
  progressBar: string;
  avatarBg: string;
  dotColor: string;
}

/**
 * 8-Miner Unique Color Identity Palette:
 * Each miner is permanently assigned a unique accent color.
 * The leading/newest block uses Gold/Amber for block status independently.
 */
export const MINER_COLORS: Record<string, MinerColorToken> = {
  Alice: {
    name: 'Alice',
    primary: '#22c55e',
    border: 'border-border-primary',
    text: 'text-text-primary',
    bg: 'bg-emerald-500/10',
    badge: 'bg-white/[0.04] text-text-primary border-border-primary',
    progressBar: 'bg-emerald-500',
    avatarBg: 'bg-white/[0.06] text-text-primary border-border-secondary',
    dotColor: '#22c55e',
  },
  Bob: {
    name: 'Bob',
    primary: '#38bdf8',
    border: 'border-sky-500/50',
    text: 'text-sky-400',
    bg: 'bg-sky-500/10',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    progressBar: 'bg-sky-500',
    avatarBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    dotColor: '#38bdf8',
  },
  Charlie: {
    name: 'Charlie',
    primary: '#8b5cf6',
    border: 'border-violet-500/50',
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    progressBar: 'bg-violet-500',
    avatarBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    dotColor: '#8b5cf6',
  },
  Dave: {
    name: 'Dave',
    primary: '#f43f5e',
    border: 'border-rose-500/50',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    progressBar: 'bg-rose-500',
    avatarBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    dotColor: '#f43f5e',
  },
  Eve: {
    name: 'Eve',
    primary: '#06b6d4',
    border: 'border-cyan-500/50',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    progressBar: 'bg-cyan-500',
    avatarBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    dotColor: '#06b6d4',
  },
  Frank: {
    name: 'Frank',
    primary: '#f97316',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    progressBar: 'bg-orange-500',
    avatarBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    dotColor: '#f97316',
  },
  Grace: {
    name: 'Grace',
    primary: '#ec4899',
    border: 'border-pink-500/50',
    text: 'text-pink-400',
    bg: 'bg-pink-500/10',
    badge: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    progressBar: 'bg-pink-500',
    avatarBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    dotColor: '#ec4899',
  },
  Henry: {
    name: 'Henry',
    primary: '#6366f1',
    border: 'border-indigo-500/50',
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    progressBar: 'bg-indigo-500',
    avatarBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    dotColor: '#6366f1',
  },
};

export const GENESIS_THEME: MinerColorToken = {
  name: 'Genesis',
  primary: '#94a3b8',
  border: 'border-slate-800',
  text: 'text-slate-300',
  bg: 'bg-slate-900/40',
  badge: 'bg-slate-800 text-slate-300 border-slate-700',
  progressBar: 'bg-slate-600',
  avatarBg: 'bg-slate-800 text-slate-300 border-slate-700',
  dotColor: '#94a3b8',
};

export const ATTACKER_THEME: MinerColorToken = {
  name: '51% Attacker Pool',
  primary: '#f43f5e',
  border: 'border-rose-500/50',
  text: 'text-rose-400',
  bg: 'bg-rose-500/10',
  badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  progressBar: 'bg-rose-500',
  avatarBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  dotColor: '#f43f5e',
};

// 8 miner names in alphabetical order
export const MINER_NAMES_8 = [
  'Alice',
  'Bob',
  'Charlie',
  'Dave',
  'Eve',
  'Frank',
  'Grace',
  'Henry',
] as const;

export const ORDERED_MINER_THEMES: MinerColorToken[] = [
  MINER_COLORS.Alice,
  MINER_COLORS.Bob,
  MINER_COLORS.Charlie,
  MINER_COLORS.Dave,
  MINER_COLORS.Eve,
  MINER_COLORS.Frank,
  MINER_COLORS.Grace,
  MINER_COLORS.Henry,
];

/**
 * Resolve miner color theme by name or ID.
 * Supports exact name match, substring, attacker pool, genesis, or deterministic fallback.
 */
export function getMinerColorTheme(nameOrId: string, blockIndex?: number): MinerColorToken {
  if (blockIndex === 0) return GENESIS_THEME;
  if (!nameOrId) return MINER_COLORS.Alice;

  const normalized = nameOrId.trim().toLowerCase();

  if (normalized === 'genesis' || normalized === 'satoshi') {
    return GENESIS_THEME;
  }

  if (normalized.includes('attacker') || normalized.includes('51%') || normalized.includes('pool')) {
    return ATTACKER_THEME;
  }

  // Exact match against canonical 8 miners
  for (const [key, token] of Object.entries(MINER_COLORS)) {
    if (normalized === key.toLowerCase() || normalized.startsWith(key.toLowerCase()) || normalized.includes(key.toLowerCase())) {
      return token;
    }
  }

  // Handle custom miner 1 / custom miner 2
  if (normalized.includes('1') || normalized.includes('custom-1')) return MINER_COLORS.Alice;
  if (normalized.includes('2') || normalized.includes('custom-2')) return MINER_COLORS.Bob;

  // Deterministic fallback across 8 themes
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
  }
  return ORDERED_MINER_THEMES[Math.abs(hash) % ORDERED_MINER_THEMES.length];
}
