/**
 * Formats a cryptographic hash or long hex string with responsive ellipsis
 * Desktop: e.g. 000000a1b2...c3d4e5f6
 * Mobile/Tablet: e.g. 000000...e5f6
 */
export const formatHash = (
  hash: string,
  isMobile: boolean = false,
  customPrefixLength?: number,
  customSuffixLength?: number
): string => {
  if (!hash) return '';
  if (hash.length <= 16) return hash;

  if (isMobile) {
    const prefixLen = customPrefixLength ?? 6;
    const suffixLen = customSuffixLength ?? 6;
    if (hash.length <= prefixLen + suffixLen) return hash;
    return `${hash.slice(0, prefixLen)}…${hash.slice(-suffixLen)}`;
  }

  const prefixLen = customPrefixLength ?? 10;
  const suffixLen = customSuffixLength ?? 10;
  if (hash.length <= prefixLen + suffixLen) return hash;
  return `${hash.slice(0, prefixLen)}…${hash.slice(-suffixLen)}`;
};

/**
 * Truncate any long address, signature, or key safely
 */
export const truncateString = (str: string, maxLength: number = 24): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  const half = Math.floor((maxLength - 1) / 2);
  return `${str.slice(0, half)}…${str.slice(-half)}`;
};
