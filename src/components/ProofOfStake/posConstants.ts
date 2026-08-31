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
  { id: 'alice', name: 'Alice', defaultStake: 100, color: '#00C98D', glow: 'rgba(0, 201, 141, 0.3)', textClass: 'text-[#00C98D]' },
  { id: 'bob', name: 'Bob', defaultStake: 500, color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.3)', textClass: 'text-amber-400' },
  { id: 'charlie', name: 'Charlie', defaultStake: 50, color: '#A855F7', glow: 'rgba(168, 85, 247, 0.3)', textClass: 'text-purple-400' },
  { id: 'dave', name: 'Dave', defaultStake: 0, color: '#717B8C', glow: 'rgba(113, 123, 140, 0.2)', textClass: 'text-[#A5AFBF]' },
  { id: 'eve', name: 'Eve', defaultStake: 200, color: '#EF4444', glow: 'rgba(239, 68, 68, 0.3)', textClass: 'text-rose-400' },
  { id: 'frank', name: 'Frank', defaultStake: 150, color: '#00C98D', glow: 'rgba(0, 201, 141, 0.3)', textClass: 'text-[#00C98D]' },
  { id: 'grace', name: 'Grace', defaultStake: 80, color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.3)', textClass: 'text-amber-400' },
  { id: 'henry', name: 'Henry', defaultStake: 120, color: '#A855F7', glow: 'rgba(168, 85, 247, 0.3)', textClass: 'text-purple-400' },
  { id: 'ivy', name: 'Ivy', defaultStake: 100, color: '#EC4899', glow: 'rgba(236, 72, 153, 0.3)', textClass: 'text-pink-400' },
  { id: 'jack', name: 'Jack', defaultStake: 250, color: '#F97316', glow: 'rgba(249, 115, 22, 0.3)', textClass: 'text-orange-400' },
  { id: 'karen', name: 'Karen', defaultStake: 60, color: '#EAB308', glow: 'rgba(234, 179, 8, 0.3)', textClass: 'text-yellow-400' },
  { id: 'leo', name: 'Leo', defaultStake: 180, color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.3)', textClass: 'text-violet-400' },
];

export const INITIAL_POS_VALIDATORS: PoSValidator[] = [
  {
    id: 'alice',
    name: 'Alice',
    avatarColor: 'bg-[#00C98D] text-[#090A0F]',
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
    avatarColor: 'bg-[#F59E0B] text-[#090A0F]',
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
    avatarColor: 'bg-[#A855F7] text-[#090A0F]',
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
    avatarColor: 'bg-[#1C2430] text-[#717B8C]',
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
    color: '#00C98D',
    glow: 'rgba(0, 201, 141, 0.3)',
    textClass: 'text-[#00C98D]',
  };
};
