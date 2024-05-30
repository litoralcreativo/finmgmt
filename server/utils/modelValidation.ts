export function isValidType<T>(k: Array<keyof T>, obj: any): obj is T {
  const keys = Object.keys(obj) as Array<keyof T>;
  for (const key of k) {
    if (obj[key] === undefined) {
      return false;
    }
  }

  return true;
}
