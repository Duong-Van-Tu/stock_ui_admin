export const isRequestSuccess = (res: any) =>
  res?.meta?.requestStatus === 'fulfilled';

export const isRequestError = (res: any) =>
  res?.meta?.requestStatus === 'rejected';

export const isRequestPending = (res: any) =>
  res?.meta?.requestStatus === 'pending';
