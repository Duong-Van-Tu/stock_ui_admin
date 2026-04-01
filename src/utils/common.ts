import { fieldMapping } from '@/helpers/field-mapping.helper';
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';

export function toBoolean(input: any) {
  if (input === '0' || input === 'false') return false;
  return !!input;
}

export function toNumber(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null;
  }
  if (typeof input === 'string') {
    let str = input.trim();
    if (str === '') return null;

    const isPercent = str.endsWith('%');
    if (isPercent) str = str.slice(0, -1).trim();

    const isNegativeInParens = str.startsWith('(') && str.endsWith(')');
    if (isNegativeInParens) str = str.slice(1, -1);

    str = str.replace(/,/g, (_, offset, full) => {
      return full.lastIndexOf(',') > offset ? '' : '.';
    });

    const num = parseFloat(str);
    if (isNaN(num)) return null;

    const result = isNegativeInParens ? -num : num;
    return isPercent ? result / 100 : result;
  }
  const coerced = Number(input as any);
  return Number.isFinite(coerced) ? coerced : null;
}

export function concatClasses(
  ...classes: (string | null | undefined | false | 0)[]
) {
  return classes.filter(Boolean).join(' ');
}

export function camelToSnake(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

export function snakeToCamel(str: string) {
  return str
    .toLowerCase()
    .replace(/([-_][a-z0-9])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
}

export function camelObject<O extends Record<string, any>>(
  obj: O
): Record<string, any> {
  return Object.keys(obj).reduce<Record<string, any>>((newObj, key) => {
    const isObject =
      obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]);

    newObj[snakeToCamel(key)] = isObject ? camelObject(obj[key]) : obj[key];
    return newObj;
  }, {});
}

export function snakeObject<O extends Record<string, any>>(
  obj: O
): Record<string, any> {
  return Object.keys(obj).reduce<Record<string, any>>((newObj, key) => {
    const isObject =
      obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]);

    newObj[camelToSnake(key)] = isObject ? camelToSnake(obj[key]) : obj[key];
    return newObj;
  }, {});
}

export function delay(ms?: number) {
  if (ms == null) {
    return new Promise((_) => {
      // Never resolve
    });
  }
  return new Promise((res) => setTimeout(res, ms));
}

export function objectToQueryString(query: Record<string, any>, prefix = true) {
  const list = Object.keys(query).reduce((arr: any[], k) => {
    if (query[k] !== undefined) {
      arr.push(`${k}=${query[k]}`);
    }
    return arr;
  }, []);

  return list.length ? `${prefix ? '?' : ''}${list.join('&')}` : '';
}

export const getCssVariableValue = (variable: string) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
};

export const capitalizeFirstLetter = (str: string): string => {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeAllLetters = (str: string): string => {
  if (typeof str !== 'string') return str;
  return str.toUpperCase();
};

export const getFirstPathnameSegment = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  return segments[0] || '';
};

export function undefinedRefine(obj: Record<string, any>) {
  return JSON.parse(JSON.stringify(obj)); //remove key has undefined value
}

export const formatDateTime = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss');
};

export const stripTimeFromISOString = (isoString?: string | null): string => {
  if (!isoString) {
    return '-';
  }
  const tIndex = isoString.indexOf('T');
  let datePart = isoString;
  if (tIndex !== -1) {
    datePart = isoString.substring(0, tIndex);
  }

  const parts = datePart.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${month}-${day}-${year}`;
  }

  return datePart;
};

export const formatDateToDDMMYYYY = (date: string | Date | number) => {
  if (!date) return '';
  const formattedDate = dayjs(date).isValid()
    ? dayjs(date).format('DD/MM/YYYY')
    : '';
  return formattedDate;
};

export const getPathnameSegment = (pathname: string, index: number) => {
  const segments = pathname.split('/').filter(Boolean);
  return segments[index] || '';
};

export const cleanFalsyValues = (values: Record<string, any> = {}) => {
  return Object.fromEntries(
    Object.entries(values).filter(([_, value]) => Boolean(value))
  );
};

export const roundToDecimals = (
  value: number | null | undefined,
  decimals: number = 2,
  minThreshold: number = 0.0001
): number | null | undefined => {
  if (value == null) return value;
  if (Math.abs(value) < minThreshold) return 0;

  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const getRowClassName = <T extends Record<string, any>>(
  record: T,
  conditions: { key: keyof T; className: string }[]
) => {
  return conditions.reduce<string[]>((acc, condition) => {
    if (record[condition.key]) {
      acc.push(condition.className);
    }
    return acc;
  }, []);
};

export const formatMarketCap = (value: number): string => {
  const marketCapValue = value * 1000000;
  if (marketCapValue >= 1_000_000_000_000) {
    return (marketCapValue / 1_000_000_000_000).toFixed(2) + 'T';
  } else if (marketCapValue >= 1_000_000_000) {
    return (marketCapValue / 1_000_000_000).toFixed(2) + 'B';
  } else if (marketCapValue >= 1_000_000) {
    return (marketCapValue / 1_000_000).toFixed(2) + 'M';
  } else if (marketCapValue >= 1_000) {
    return (value / 1_000).toFixed(2) + 'K';
  } else {
    return value.toString();
  }
};

export const formatNumberShort = (value?: number | null): string => {
  if (value == null || !Number.isFinite(value)) return '';

  const absValue = Math.abs(value);

  if (absValue >= 1_000_000_000_000) {
    return (value / 1_000_000_000_000).toFixed(2).replace(/\.00$/, '') + 'T';
  }
  if (absValue >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  }
  if (absValue >= 1_000_000) {
    return (value / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  if (absValue >= 1_000) {
    return (value / 1_000).toFixed(2).replace(/\.00$/, '') + 'K';
  }
  return String(value);
};

export const formatPercent = (
  value: number | null | undefined,
  decimals: number = 2
): string | null | undefined => {
  if (!value) return '0%';

  const formattedValue = roundToDecimals(value, decimals);
  const sign = value > 0 ? '+' : '';

  return `${sign}${formattedValue}%`;
};

export const calculatePercentage = (
  initialValue: number,
  finalValue: number
): number => {
  if (!initialValue) return 0;

  return ((finalValue - initialValue) / initialValue) * 100;
};

export const parseRangeValue = (
  value: string
): { from: number | undefined; to: number | undefined } => {
  if (!value || value === 'Any') return { from: undefined, to: undefined };

  if (value.startsWith('u'))
    return { from: undefined, to: parseInt(value.slice(1)) };

  if (value.startsWith('o'))
    return { from: parseInt(value.slice(1)), to: undefined };

  if (value.includes('to')) {
    const [from, to] = value.split('to').map((num) => parseInt(num));
    return { from, to };
  }

  return { from: undefined, to: undefined };
};

export const convertParamsByMapping = <T extends Record<string, any>>(
  params: T
): Record<string, any> => {
  return Object.entries(params).reduce(
    (acc, [key, value]) => {
      const mappedKey = fieldMapping[key];

      const newKey = mappedKey !== undefined ? mappedKey : key;

      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
      ) {
        acc[newKey] = convertParamsByMapping(value as Record<string, unknown>);
      } else {
        acc[newKey] = value;
      }

      return acc;
    },
    {} as Record<string, any>
  );
};

export const parseToUTC = (date?: string) =>
  date ? dayjs.utc(date, 'YYYY-MM-DD HH:mm:ss').format() : '';

export const getThumbnail = (
  url: string,
  width = 200,
  height = 120
): string => {
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(
    url
  )}?w=${width}&h=${height}`;
};

export const parseConsoleObject = (rawString: string) => {
  let depth = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString[i];
    if (char === '{') depth++;
    if (char === '}') depth--;

    if (depth === 0) {
      const jsonStr = rawString.slice(0, i + 1);
      return JSON.parse(jsonStr);
    }
  }

  throw new Error('Invalid JSON structure');
};

export function isNumeric(value: unknown): boolean {
  return !isNaN(Number(value)) && value !== null && value !== '';
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export const tidyTime = (t?: string): string =>
  (t || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/:00(?=\s*[ap]m)$/i, '');

export const getTextColor = (value: number) => {
  if (value === 0) return '#ffcf4d';
  if (value > 0 && value <= 5) return '#91cf60';
  if (value > 5) return '#1a9850';
  if (value < 0 && value >= -5) return '#fc8d59';
  return '#d73027';
};

export const getTextColorSymbol = (value: number): string => {
  if (value > 0) return '#1a9850';
  if (value < 0) return '#d73027';
  return '#ffcf4d';
};

export const calculateRSI = (
  closes: number[],
  period: number
): (number | undefined)[] => {
  const out: (number | undefined)[] = new Array(closes.length).fill(undefined);
  if (closes.length < period + 1 || period <= 0) return out;

  let gain = 0;
  let loss = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) gain += change;
    else loss -= change;
  }

  let avgGain = gain / period;
  let avgLoss = loss / period;

  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const g = Math.max(change, 0);
    const l = Math.max(-change, 0);
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return out;
};

export const isUrl = (text: string): boolean => {
  try {
    return !!new URL(text);
  } catch {
    return false;
  }
};

export const scaleScore = (value?: number): number | undefined =>
  isNumeric(value) ? roundToDecimals(value! * 10, 1)! : undefined;

export function lightenColor(hex: string, percent: number) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((x) => x + x)
      .join('');
  }
  const num = parseInt(hex, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.round(r + (255 - r) * percent);
  g = Math.round(g + (255 - g) * percent);
  b = Math.round(b + (255 - b) * percent);
  return `rgb(${r},${g},${b})`;
}

export const formatTimeAgo = (dateTime: string | undefined) => {
  if (!dateTime) return '';
  const date = dayjs(dateTime).tz(TimeZone.NEW_YORK);
  const now = dayjs().tz(TimeZone.NEW_YORK);
  const diffInSeconds = now.diff(date, 'second');
  const diffInMinutes = now.diff(date, 'minute');
  const diffInHours = now.diff(date, 'hour');
  const diffInDays = now.diff(date, 'day');

  if (diffInDays > 0) {
    const formatString =
      now.year() === date.year() ? 'MMM DD - HH:mm' : 'MMM DD, YYYY - HH:mm';
    return date.format(formatString);
  } else if (diffInHours > 0) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds >= 30) {
    return `${diffInSeconds} seconds ago`;
  } else {
    return 'Just now';
  }
};
