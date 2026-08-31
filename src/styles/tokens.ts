/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Standard Semantic Design Tokens for Blockchain E-Learning Lab
 * Matches fixed palette:
 * Canvas: #0A0A0A | Surface: #111111 | Elevated: #181818 | Border: #292929
 * Accent: #22C55E | Warning: #EAB308 | Danger: #EF4444
 * Text: Primary #F5F5F5 | Secondary #A1A1AA | Muted #71717A
 */

export const tokens = {
  colors: {
    // Canvas & Surface Hierarchy
    canvas: '#090A0F',
    card: '#0C0F14',
    cardElevated: '#11161E',
    surfaceSubtle: '#0F131A',
    input: '#0B0F15',
    border: '#1C2430',
    borderLight: '#151C26',
    borderFocus: '#00C98D',
    borderActive: '#24313D',

    // Typography
    textPrimary: '#F2F4F7',
    textSecondary: '#A5AFBF',
    textMuted: '#717B8C',
    textHighlight: '#F2F4F7',

    // Semantic Accents (Strictly Emerald/Green accent, no cyan)
    accentPrimary: '#00C98D',
    accentHover: '#00B982',
    accentBright: '#19E6A7',
    accentEmerald: '#00C98D',
    accentAmber: '#F59E0B',
    accentRose: '#EF4444',

    // Status Tokens
    statusValid: '#00C98D',
    statusInvalid: '#EF4444',
    statusPending: '#F59E0B',
    statusActive: '#00C98D',
  },
  radii: {
    container: '1rem', // 16px (rounded-2xl)
    panel: '0.75rem',   // 12px (rounded-xl)
    control: '0.5rem',  // 8px  (rounded-lg)
    button: '0.75rem',  // 12px (rounded-xl)
    chip: '9999px',     // pill (rounded-full)
  },
  transitions: {
    standard: 'transition-all duration-200 ease-in-out',
    smooth: 'transition-all duration-300 ease-out',
  },
} as const;

