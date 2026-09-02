import { PoSValidator } from '../../types';

export interface ParticipantPreset {
  id: string;
  name: string;
  defaultStake: number;
  color: string;
  glow: string;
  textClass: string;
}

export const PARTICIPANT_PRESETS: ParticipantPreset[] = [
  { id: 'alice', name: 'Alice', defaultStake: 100, color: '#10B981', glow: 'rgba(16, 185, 129, 0.2)', textClass: 'text-emerald-400' },
  { id: 'bob', name: 'Bob', defaultStake: 500, color: '#059669', glow: 'rgba(5, 150, 105, 0.2)', textClass: 'text-emerald-400' },
  { id: 'charlie', name: 'Charlie', defaultStake: 50, color: '#0F766E', glow: 'rgba(15, 118, 110, 0.2)', textClass: 'text-teal-300' },
  { id: 'dave', name: 'Dave', defaultStake: 0, color: '#64748B', glow: 'rgba(100, 116, 139, 0.1)', textClass: 'text-[#717B8C]' },
  { id: 'eve', name: 'Eve', defaultStake: 200, color: '#047857', glow: 'rgba(4, 120, 87, 0.2)', textClass: 'text-emerald-300' },
  { id: 'frank', name: 'Frank', defaultStake: 150, color: '#115E59', glow: 'rgba(17, 94, 89, 0.2)', textClass: 'text-teal-400' },
  { id: 'grace', name: 'Grace', defaultStake: 80, color: '#475569', glow: 'rgba(71, 85, 105, 0.2)', textClass: 'text-slate-300' },
  { id: 'henry', name: 'Henry', defaultStake: 120, color: '#065F46', glow: 'rgba(6, 95, 70, 0.2)', textClass: 'text-emerald-300' },
  { id: 'ivy', name: 'Ivy', defaultStake: 100, color: '#14B8A6', glow: 'rgba(20, 184, 166, 0.2)', textClass: 'text-teal-300' },
  { id: 'jack', name: 'Jack', defaultStake: 250, color: '#0E7490', glow: 'rgba(14, 116, 144, 0.2)', textClass: 'text-cyan-300' },
  { id: 'karen', name: 'Karen', defaultStake: 60, color: '#334155', glow: 'rgba(51, 65, 85, 0.2)', textClass: 'text-slate-400' },
  { id: 'leo', name: 'Leo', defaultStake: 180, color: '#15803D', glow: 'rgba(21, 128, 61, 0.2)', textClass: 'text-emerald-400' },
];

export const INITIAL_POS_VALIDATORS: PoSValidator[] = [
  {
    id: 'alice',
    name: 'Alice',
    avatarColor: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30',
    stake: 100.0,
    isOnline: true,
    isActive: true,
    isMalicious: false,
    votingPower: 15.4,
    totalBlocksProposed: 1,
    totalRewards: 8.0,
    slashedAmount: 0,
  },
  {
    id: 'bob',
    name: 'Bob',
    avatarColor: 'bg-teal-600/20 text-teal-400 border border-teal-500/30',
    stake: 500.0,
    isOnline: true,
    isActive: true,
    isMalicious: false,
    votingPower: 76.9,
    totalBlocksProposed: 5,
    totalRewards: 40.0,
    slashedAmount: 0,
  },
  {
    id: 'charlie',
    name: 'Charlie',
    avatarColor: 'bg-slate-700/30 text-slate-300 border border-slate-600/30',
    stake: 50.0,
    isOnline: true,
    isActive: true,
    isMalicious: false,
    votingPower: 7.7,
    totalBlocksProposed: 1,
    totalRewards: 8.0,
    slashedAmount: 0,
  },
  {
    id: 'dave',
    name: 'Dave',
    avatarColor: 'bg-[#1C2430] text-[#717B8C] border border-[#1C2430]',
    stake: 0.0,
    isOnline: false,
    isActive: false,
    isMalicious: false,
    votingPower: 0,
    totalBlocksProposed: 0,
    totalRewards: 0,
    slashedAmount: 0,
  },
];

export const getValidatorPreset = (id: string, fallbackName?: string): ParticipantPreset => {
  const found = PARTICIPANT_PRESETS.find((p) => p.id.toLowerCase() === id.toLowerCase());
  if (found) return found;
  return {
    id,
    name: fallbackName || id,
    defaultStake: 100,
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.2)',
    textClass: 'text-emerald-400',
  };
};
