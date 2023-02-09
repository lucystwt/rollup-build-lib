import { add as _add } from "lodash-es"

export function add(a: string, b: number) {
  return a + b
}

export function addByLodash(a: number, b: number) {
  return _add(a, b)
}

export const getFullName = (firstName: string, lastName: string) => {
  return `${firstName} ${lastName}`
}
