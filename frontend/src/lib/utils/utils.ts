export const isEmpty = (obj: Record<any, any>) =>
  Object.keys(obj).length === 0 ||
  Object.values(obj).every((value) => value === '' || value == null)
