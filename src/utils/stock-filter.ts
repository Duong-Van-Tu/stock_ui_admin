export const getAvgVolumeOptions = (t: (key: string) => string) => [
  { label: t('any'), value: 'any' },
  { label: t('under500k'), value: 'u500000' },
  { label: t('under1m'), value: 'u1000000' },
  { label: t('under2m'), value: 'u2000000' },
  { label: t('under5m'), value: 'u5000000' },
  { label: t('under10m'), value: 'u10000000' },
  { label: t('under20m'), value: 'u20000000' },
  { label: t('under50m'), value: 'u50000000' },
  { label: t('under100m'), value: 'u100000000' },
  { label: t('over500k'), value: 'o500000' },
  { label: t('over1m'), value: 'o1000000' },
  { label: t('over2m'), value: 'o2000000' },
  { label: t('over5m'), value: 'o5000000' },
  { label: t('over10m'), value: 'o10000000' },
  { label: t('over20m'), value: 'o20000000' },
  { label: t('over50m'), value: 'o50000000' },
  { label: t('over100m'), value: 'o100000000' },
  { label: t('from500kTo1m'), value: '500000to1000000' },
  { label: t('from1mTo2m'), value: '10000000to2000000' },
  { label: t('from2mTo5m'), value: '20000000to5000000' },
  { label: t('from5mTo10m'), value: '5000000to10000000' },
  { label: t('from10mTo20m'), value: '10000000to20000000' },
  { label: t('from20mTo50m'), value: '20000000to50000000' },
  { label: t('from50mTo100m'), value: '50000000to100000000' }
];

export const getATROptions = (t: (key: string) => string) => [
  { label: t('any'), value: 'any' },
  { label: t('under1'), value: 'u1' },
  { label: t('under2'), value: 'u2' },
  { label: t('under5'), value: 'u5' },
  { label: t('under10'), value: 'u10' },
  { label: t('over1'), value: 'o1' },
  { label: t('over2'), value: 'o2' },
  { label: t('over5'), value: 'o5' },
  { label: t('over10'), value: 'o10' },
  { label: t('over20'), value: 'o20' },
  { label: t('over50'), value: 'o50' },
  { label: t('from1To2'), value: '1to2' },
  { label: t('from2To5'), value: '2to5' },
  { label: t('from5To10'), value: '5to10' },
  { label: t('from10To20'), value: '10to20' },
  { label: t('from20To50'), value: '20to50' }
];

export const getBetaOptions = (t: (key: string) => string) => [
  { label: t('any'), value: 'any' },
  { label: t('under1'), value: 'u1' },
  { label: t('under2'), value: 'u2' },
  { label: t('under3'), value: 'u3' },
  { label: t('over0'), value: 'o0' },
  { label: t('over1'), value: 'o1' },
  { label: t('over2'), value: 'o2' },
  { label: t('over3'), value: 'o3' },
  { label: t('over4'), value: 'o4' },
  { label: t('over5'), value: 'o5' },
  { label: t('from1To2'), value: '1to2' },
  { label: t('from2To3'), value: '2to3' },
  { label: t('from3To4'), value: '3to4' },
  { label: t('from4To5'), value: '4to5' }
];

export const getBooleanOptions = (t: (key: string) => string) => [
  { label: t('any'), value: 'any' },
  { label: t('yes'), value: 'true' },
  { label: t('no'), value: 'false' }
];

export const getRangeDateOptions = (t: (key: string) => string) => [
  { value: 1, label: t('1Day') },
  { value: 2, label: t('2Days') },
  { value: 3, label: t('3Days') },
  { value: 4, label: t('4Days') },
  { value: 5, label: t('5Days') },
  { value: 6, label: t('6Days') },
  { value: 7, label: t('1Week') },
  { value: 14, label: t('2Weeks') }
];
