import dayjs from 'dayjs';

export function toBoolean(input: any) {
  if (input === '0' || input === 'false') return false;
  return !!input;
}

export function toNumber(input: any) {
  const val = +input;
  if (isNaN(val)) return null;
  return val;
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
