export function omit(object: any, ...keys: string[]) {
  let result: any = {};
  for (let key in object) {
    if (keys.indexOf(key) === -1) {
      result[key] = object[key];
    }
  }
  return result;
}
