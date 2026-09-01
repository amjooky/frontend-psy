/**
 * Safe numeric & decimal formatter for MonPsy frontend.
 * Guarantees that neither "NaN", "undefined", "[object Object]" nor null will EVER be displayed.
 */

export function formatDecimal(val: any, fallback: number = 0, decimals: number = 2): string {
  if (val === null || val === undefined || val === '') {
    return fallback.toFixed(decimals);
  }
  if (typeof val === 'number') {
    return isNaN(val) ? fallback.toFixed(decimals) : val.toFixed(decimals);
  }
  if (typeof val === 'object') {
    // Decimal.js instance with toNumber
    if (typeof val.toNumber === 'function') {
      try {
        const n = val.toNumber();
        return isNaN(n) ? fallback.toFixed(decimals) : n.toFixed(decimals);
      } catch {
        return fallback.toFixed(decimals);
      }
    }
    // Serialized Decimal.js: { d: [80], e: 1, s: 1 }
    if (Array.isArray(val.d) && typeof val.s === 'number') {
      try {
        const strVal = val.d.join('');
        const exp = typeof val.e === 'number' ? val.e : 0;
        const n = (val.s * Number(strVal)) / Math.pow(10, strVal.length - 1 - exp);
        if (!isNaN(n)) return n.toFixed(decimals);
      } catch {
        return fallback.toFixed(decimals);
      }
    }
    // Object with value property
    if (val.value !== undefined) {
      const n = Number(val.value);
      if (!isNaN(n)) return n.toFixed(decimals);
    }
  }

  const str = String(val).trim();
  if (str === '' || str === '[object Object]') {
    return fallback.toFixed(decimals);
  }

  const parsed = parseFloat(str);
  return isNaN(parsed) ? fallback.toFixed(decimals) : parsed.toFixed(decimals);
}

export function formatPrice(val: any, fallback: number = 80, decimals: number = 2): string {
  return formatDecimal(val, fallback, decimals);
}

export function formatRating(val: any, fallback: number = 0): string {
  if (val === null || val === undefined || val === '') {
    return fallback > 0 ? fallback.toFixed(1) : '0.0';
  }
  const formatted = formatDecimal(val, fallback, 1);
  const n = parseFloat(formatted);
  if (isNaN(n) || n < 0) {
    return fallback > 0 ? fallback.toFixed(1) : '0.0';
  }
  return formatted;
}
