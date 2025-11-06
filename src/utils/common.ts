import { fieldMapping } from '@/helpers/field-mapping.helper';
import dayjs from 'dayjs';

export function toBoolean(input: any) {
  if (input === '0' || input === 'false') return false;
  return !!input;
}

export function toNumber(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'string' && input.trim() === '') return null;

  const val = Number(input);
  return isNaN(val) ? null : val;
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

export function formatDateTime(date: string) {
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss');
}

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

export const formatNumberShort = (value: number): string => {
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
  return value.toString();
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
  return Object.entries(params).reduce((acc, [key, value]) => {
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
  }, {} as Record<string, any>);
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

export const tidyTime = (t?: string): string =>
  (t || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/:00(?=\s*[ap]m)$/i, '');

export const getTextColor = (clamped: number) => {
  if (clamped === 0) return '#ffcf4d';
  if (clamped > 0 && clamped <= 1) return '#91cf60';
  if (clamped > 1 && clamped <= 2) return '#1a9850';
  if (clamped < 0 && clamped >= -1) return '#fc8d59';
  return '#d73027';
};

export const getTextColorSymbol = (value: number): string => {
  if (value > 0) return '#1a9850';
  if (value < 0) return '#d73027';
  return '#ffcf4d';
};
